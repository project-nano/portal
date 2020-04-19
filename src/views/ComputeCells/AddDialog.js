import React from "react";
import Skeleton from '@material-ui/lab/Skeleton';
import InputList from "components/CustomInput/InputList";
import CustomDialog from "components/Dialog/CustomDialog.js";
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
  const [ operatable, setOperatable ] = React.useState(true);
  const [ prompt, setPrompt ] = React.useState('');
  const [ request, setRequest ] = React.useState(defaultValues);
  const [ options, setOptions ] = React.useState([]);
  const texts = i18n[lang];
  const title = texts.title;

  const onAddFail = msg =>{
    setOperatable(true);
    setPrompt(msg);
  }
  const resetDialog = () => {
    setPrompt('');
    setRequest(defaultValues);
    setInitialed(false);
  }
  const closeDialog = ()=>{
    resetDialog();
    onCancel();
  }

  const onAddSuccess = (poolName, cellName) =>{
    setOperatable(true);
    resetDialog();
    onSuccess(cellName);
  }

  const handleConfirm = () =>{
    setOperatable(false);
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
          label: cell.address ? cell.name + ' (' + cell.address + ')' : cell.name,
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
  var buttons = [{
    color: 'transparent',
    label: texts.cancel,
    onClick: closeDialog,
  }];
  let content;
  if (!initialed){
    content = <Skeleton variant="rect" style={{height: '10rem'}}/>;
  }else{
    const inputs = [
      {
        type: "select",
        label: texts.name,
        onChange: handleRequestPropsChanged('cell'),
        value: request.cell,
        options: options,
        required: true,
        oneRow: true,
        xs: 8,
      },
    ];
    content = <InputList inputs={inputs}/>

    buttons.push(
      {
        color: 'info',
        label: texts.confirm,
        onClick: handleConfirm,
      }
    );
  }

  return <CustomDialog size='sm' open={open} prompt={prompt}
    title={title}  buttons={buttons} content={content} operatable={operatable}/>;
};

export default AddDialog;
