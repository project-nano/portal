import React from "react";
import Skeleton from '@material-ui/lab/Skeleton';
import InputList from "components/CustomInput/InputList";
import CustomDialog from "components/Dialog/CustomDialog.js";
import { queryComputeCellsInPool, migrateSingleInstance } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Migrate Single Instance',
    sourcePool: 'Source Pool',
    sourceCell: 'Source Cell',
    targetCell: 'Target Cell',
    offline: 'Offline',
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  'cn':{
    title: '迁移云主机实例',
    sourcePool: '源资源池',
    sourceCell: '源节点',
    targetCell: '目标节点',
    offline: '离线',
    cancel: '取消',
    confirm: '确认',
  },
}

export default function MigrateInstanceDialog(props){
  const defaultValues = {
    targetCell: '',
  };
  const { lang, instanceID, open, sourcePool, sourceCell, onSuccess, onCancel } = props;
  const [ initialed, setInitialed ] = React.useState(false);
  const [ operatable, setOperatable ] = React.useState(true);
  const [ prompt, setPrompt ] = React.useState('');
  const [ mounted, setMounted ] = React.useState(false);
  const [ request, setRequest ] = React.useState(defaultValues);
  const [ options, setOptions ] = React.useState({
    cells: [],
  });

  const texts = i18n[lang];
  const title = texts.title;

  const onMigrateFail = React.useCallback(msg =>{
    if(!mounted){
      return;
    }
    setOperatable(true);
    setPrompt(msg);
  }, [mounted]);

  const resetDialog = () => {
    setPrompt('');
    setRequest(defaultValues);
    setInitialed(false);
  }

  const closeDialog = ()=>{
    resetDialog();
    onCancel();
  }

  const onMigrateSuccess = (instanceID) =>{
    if(!mounted){
      return;
    }
    setOperatable(true);
    resetDialog();
    onSuccess(instanceID);
  }

  const handleConfirm = () =>{
    const targetCell = request.targetCell;
    if ('' === targetCell){
      onMigrateFail('select a target cell');
      return;
    }
    setPrompt("");
    setOperatable(false);
    migrateSingleInstance(sourcePool, sourceCell, targetCell, instanceID, onMigrateSuccess, onMigrateFail);
  }

  const handleRequestPropsChanged = name => e =>{
    if(!mounted){
      return;
    }
    var value = e.target.value
    setRequest(previous => ({
      ...previous,
      [name]: value,
    }));
  };

  React.useEffect(()=>{
    if (!open){
      return;
    }

    setMounted(true);
    const onQueryCellSuccess = dataList => {
      if(!mounted){
        return;
      }
      var cellList = [];
      dataList.forEach(cell =>{
        if (cell.name !== sourceCell){
          let label;
          if(cell.alive){
            label = cell.name + '('+ cell.address +')';
          }else{
            label = cell.name + '('+ texts.offline +')';
          }

          cellList.push({
            label: label,
            value: cell.name,
            disabled: !cell.alive,
          })
        }
      });
      if (0 === cellList.length){
        onMigrateFail('no target cell available');
        return;
      }
      setOptions({
        cells: cellList,
      });
      setInitialed(true);
    };

    queryComputeCellsInPool(sourcePool, onQueryCellSuccess, onMigrateFail);
    return () => {
      setMounted(false);
    }
  }, [mounted, open, sourcePool, sourceCell, onMigrateFail, texts.offline]);

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
        type: "text",
        label: texts.sourcePool,
        value: sourcePool,
        disabled: true,
        oneRow: true,
        xs: 12,
        sm: 8,
      },
      {
        type: "text",
        label: texts.sourceCell,
        value: sourceCell,
        disabled: true,
        oneRow: true,
        xs: 12,
        sm: 8,
      },
      {
        type: "select",
        label: texts.targetCell,
        onChange: handleRequestPropsChanged('targetCell'),
        value: request.targetCell,
        options: options.cells,
        required: true,
        oneRow: true,
        xs: 12,
        sm: 10,
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

  return <CustomDialog size='xs' open={open} prompt={prompt}
    title={title}  buttons={buttons} content={content} operatable={operatable}/>;
};
