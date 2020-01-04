import React from "react";
// @material-ui/core components
import Grid from "@material-ui/core/Grid";
import Box from '@material-ui/core/Box';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Skeleton from '@material-ui/lab/Skeleton';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';

// dashboard components
import Button from "components/CustomButtons/Button.js";
import GridItem from "components/Grid/GridItem.js";
import SnackbarContent from "components/Snackbar/SnackbarContent.js";
import { queryUnallocatedComputeCells, addComputeCell } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Add Compute Cell To Pool ',
    name: 'Cell Name',
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  'cn':{
    title: '添加节点到资源池 ',
    name: '资源节点名称',
    cancel: '取消',
    confirm: '确定',
  },
}

const AddDialog = (props) =>{
  const defaultValues = {
    cell: '',
  };
  const { lang, pool, open, onSuccess, onCancel } = props;
  const [ initialed, setInitialed ] = React.useState(false);
  const [ error, setError ] = React.useState('');
  const [ request, setRequest ] = React.useState(defaultValues);
  const [ options, setOptions ] = React.useState([]);

  const texts = i18n[lang];
  const onAddFail = (msg) =>{
    setError(msg);
  }
  const resetDialog = () => {
    setError('');
    setRequest(defaultValues);
    setInitialed(false);
  }
  const closeDialog = ()=>{
    resetDialog();
    onCancel();
  }

  const onAddSuccess = (poolName, cellName) =>{
    resetDialog();
    onSuccess(cellName);
  }

  const confirmAdd = () =>{
    const cellName = request.cell;
    if ('' === cellName){
      onAddFail('must select a cell');
      return;
    }
    addComputeCell(pool, cellName, onAddSuccess, onAddFail);
  }

  const handleRequestPropsChanged = name => e =>{
    var value = e.target.value
    setRequest(previous => ({
      ...previous,
      [name]: value,
    }));
  };

  React.useEffect(()=>{
    if (!open || initialed){
      return;
    }

    const onQueryCellSuccess = (dataList) => {
      var cellList = [];
      dataList.forEach((cell)=>{
        var item = {
          name: cell.address ? cell.name + ' (' + cell.address + ')' : cell.name,
          value: cell.name,
        }
        cellList.push(item);
      })
      if (0 === cellList.length){
        onAddFail('no unallocated cells available');
        setInitialed(true);
        return;
      }
      setOptions(cellList);
      setInitialed(true);
    };

    queryUnallocatedComputeCells(onQueryCellSuccess, onAddFail);
  }, [initialed, open]);

  //begin render
  let content;
  if (!initialed){
    content = <Skeleton variant="rect" style={{height: '10rem'}}/>;
  }else{
    content = (
      <Grid container>
        <GridItem xs={8}>
          <Box m={1} p={2}>
          <InputLabel htmlFor="cell">{texts.name}</InputLabel>
          <Select
            value={request.cell}
            onChange={handleRequestPropsChanged('cell')}
            inputProps={{
              name: 'cell',
              id: 'cell',
            }}
            autoWidth
          >
            {
              options.map((option) =>(
                <MenuItem value={option.value} key={option.value}>{option.name}</MenuItem>
              ))
            }
          </Select>
          </Box>
        </GridItem>
      </Grid>
    );
  }

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
        <Button onClick={closeDialog} color="transparent" autoFocus>
          {texts.cancel}
        </Button>
        <Button onClick={confirmAdd} color="info">
          {texts.confirm}
        </Button>
      </DialogActions>
    </Dialog>
  )
};

export default AddDialog;
