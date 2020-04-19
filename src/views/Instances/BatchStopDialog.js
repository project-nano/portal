import React from "react";
// @material-ui/core components
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import TableHead from '@material-ui/core/TableHead';
import TableContainer from '@material-ui/core/TableContainer';
import Paper from '@material-ui/core/Paper';

// dashboard components
import CustomDialog from "components/Dialog/CustomDialog.js";
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
  const [ operatable, setOperatable ] = React.useState(true);
  const [ prompt, setPrompt ] = React.useState('');
  const [ mounted, setMounted ] = React.useState(false);
  const texts = i18n[lang];
  const title = texts.title;
  const onStopFail = React.useCallback(msg =>{
    if(!mounted){
      return;
    }
    setOperatable(true);
    setPrompt(msg);
  }, [mounted]);

  const resetDialog = () => {
    setPrompt('');
    setStage(StageEnum.initial);
  }

  const closeDialog = ()=>{
    resetDialog();
    onCancel();
  }

  const onStopSuccess = () =>{
    if(!mounted){
      return;
    }
    setStage(StageEnum.initial);
    setPrompt('');
    onSuccess();
  }

  const handleConfirm = () =>{
    setPrompt('');
    setOperatable(false);
    if (!targets || 0 === targets.length){
      onStopFail('no target selecetd');
      return;
    }

    var batchID;
    const onProcessing = dataList =>{
      if(!mounted){
        return;
      }
      setResultList(dataList);
      setTimeout(()=> {
        checkBatchStoppingStatus(batchID, onProcessing, onComplete, onStopFail)
      }, updateInterval);
    }

    const onComplete = dataList =>{
      if(!mounted){
        return;
      }
      setResultList(dataList);
      if(StageEnum.finish !== stage){
        setOperatable(true);
        setStage(StageEnum.finish);
      }
    }

    const onAccept = id => {
      if(!mounted){
        return;
      }
      if(StageEnum.initial === stage){
        setStage(StageEnum.processing);
      }
      batchID = id;
      checkBatchStoppingStatus(batchID, onProcessing, onComplete, onStopFail);
    }

    batchStoppingGuests(targets, onAccept, onStopFail);
  }

  const cancelButton = {
    color: "transparent",
    label: texts.cancel,
    onClick: closeDialog,
  };
  const confirmButton = {
    color: 'info',
    label: texts.confirm,
    onClick: handleConfirm,
  };
  const finishButton = {
    color: 'info',
    label: texts.finish,
    onClick: onStopSuccess,
  };

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

  React.useEffect(() =>{
    setMounted(true);
    return () => setMounted(false);
  }, []);

  let content, buttons;
  switch (stage) {
    case StageEnum.processing:
      content = resultToTable(resultList);
      if(prompt){
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

  return <CustomDialog size='sm' open={open} prompt={prompt} promptPosition="top"
    hideBackdrop title={title}  buttons={buttons} content={content} operatable={operatable}/>;
};
