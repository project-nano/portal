import React from "react";
// @material-ui/core components
import Grid from "@material-ui/core/Grid";
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import TableHead from '@material-ui/core/TableHead';
import TableContainer from '@material-ui/core/TableContainer';
import Paper from '@material-ui/core/Paper';

// dashboard components
import Button from "components/CustomButtons/Button.js";
import GridItem from "components/Grid/GridItem.js";
import SnackbarContent from "components/Snackbar/SnackbarContent.js";
import { batchStoppingGuests, checkBatchStoppingStatus } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Batch Stopping Instance',
    content1: 'Are you sure to stop ',
    content2: ' instance(s)',
    cancel: 'Cancel',
    confirm: 'Confirm',
    finish: 'Finish',
    fail: 'Fail',
    complete: 'Stopped',
    processing: 'Stopping',
    instance: 'Instance',
    result: 'Result',
  },
  'cn':{
    title: '批量停止云主机',
    content1: '是否停止 ',
    content2: ' 个云主机',
    cancel: '取消',
    confirm: '确定',
    finish: '完成',
    fail: '失败',
    complete: '已停止',
    processing: '停止中',
    instance: '云主机',
    result: '处理结果',
  },
}

export default function BatchStopDialog(props){
  const updateInterval = 2 * 1000;// 2 seconds
  const StageEnum = {
    initial: 0,
    processing: 1,
    finish: 2,
  };
  const { lang, targets, open, onSuccess, onCancel } = props;
  const [ stage, setStage ] = React.useState(StageEnum.initial);
  const [ resultList, setResultList ] = React.useState(null);
  const [ error, setError ] = React.useState('');
  const texts = i18n[lang];
  const onStopFail = (msg) =>{
    setError(msg);
  }

  const closeDialog = ()=>{
    setStage(StageEnum.initial);
    setError('');
    onCancel();
  }

  const onStopSuccess = () =>{
    setStage(StageEnum.initial);
    setError('');
    onSuccess();
  }

  const confirmStop = () =>{
    if (!targets || 0 === targets.length){
      setError('no target selecetd');
      return;
    }

    var batchID;
    const onProcessing = dataList =>{
      setResultList(dataList);
      setTimeout(()=> {
        checkBatchStoppingStatus(batchID, onProcessing, onComplete, onStopFail)
      }, updateInterval);
    }

    const onComplete = dataList =>{
      setResultList(dataList);
      if(StageEnum.finish !== stage){
        setStage(StageEnum.finish);
      }
    }

    const onAccept = id => {
      if(StageEnum.initial === stage){
        setStage(StageEnum.processing);
      }
      batchID = id;
      checkBatchStoppingStatus(batchID, onProcessing, onComplete, onStopFail);
    }

    batchStoppingGuests(targets, onAccept, onStopFail);
  }

  //begin render
  let prompt;
  if (!error || '' === error){
    prompt = <GridItem xs={12}/>;
  }else{
    prompt = (
      <GridItem xs={12}>
        <SnackbarContent message={error} color="danger"/>
      </GridItem>
    );
  }
  const cancelButton = (
    <Button onClick={closeDialog} color="transparent" key='cancel'>
      {texts.cancel}
    </Button>
  );
  const confirmButton = (
    <Button onClick={confirmStop} color="info" key='confirm'>
      {texts.confirm}
    </Button>
  );
  const finishButton = (
    <Button onClick={onStopSuccess} color="info" key='finish'>
      {texts.finish}
    </Button>
  );

  const resultToTable = dataList => {
    var rows = [];
    if(!dataList){
      return <div/>;
    }
    dataList.forEach((result, index) =>{
      if('fail' === result.status){
        rows.push({
          id: result.id,
          text: texts.fail + ':' + result.error,
        });
      }else if ('stopped' === result.status){
        rows.push({
          id: result.id,
          text: texts.complete,
        });
      }else{
        //stopping
        rows.push({
          id: result.id,
          text: texts.processing,
        });
      }
    });

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{texts.instance}</TableCell>
              <TableCell>{texts.result}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {
              rows.map(row => (
                <TableRow key={row.id}>
                  <TableCell component='th' scope='row'>
                    {row.id}
                  </TableCell>
                  <TableCell>
                    {row.text}
                  </TableCell>
                </TableRow>
              ))
            }
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  let content, buttons;
  switch (stage) {
    case StageEnum.processing:
      content = resultToTable(resultList);
      if(error){
        buttons = [cancelButton];
      }else{
        buttons = [];
      }
      break;
    case StageEnum.finish:
      content = resultToTable(resultList);
      buttons = [finishButton];
      break;
    default:
      //initial
      content = texts.content1 + targets.length.toString() + texts.content2;
      buttons = [cancelButton, confirmButton];
  }

  return (
    <Dialog
      open={open}
      aria-labelledby={texts.title}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>{texts.title}</DialogTitle>
      <DialogContent>
        <Grid container>
          <GridItem xs={12}>
            {content}
          </GridItem>
          {prompt}
        </Grid>
      </DialogContent>
      <DialogActions>
        {buttons}
      </DialogActions>
    </Dialog>
  )
};
