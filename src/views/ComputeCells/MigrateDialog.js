import React from "react";
// @material-ui/core components
import Grid from "@material-ui/core/Grid";
import Box from '@material-ui/core/Box';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import Skeleton from '@material-ui/lab/Skeleton';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';

// dashboard components
import Button from "components/CustomButtons/Button.js";
import GridItem from "components/Grid/GridItem.js";
import SingleRow from "components/Grid/SingleRow.js";
import SnackbarContent from "components/Snackbar/SnackbarContent.js";
import { queryComputeCellsInPool, migrateInstancesInCell } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Migrate All Instance',
    sourcePool: 'Source Pool',
    sourceCell: 'Source Cell',
    targetCell: 'Target Cell',
    offline: 'Offline',
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  'cn':{
    title: '迁移所有云主机实例',
    sourcePool: '源资源池',
    sourceCell: '源节点',
    targetCell: '目标节点',
    offline: '离线',
    cancel: '取消',
    confirm: '确认',
  },
}

export default function MigrateInstancesDialog(props){
  const defaultValues = {
    targetCell: '',
  };
  const { lang, open, sourcePool, sourceCell, onSuccess, onCancel } = props;
  const [ initialed, setInitialed ] = React.useState(false);
  const [ error, setError ] = React.useState('');
  const [ request, setRequest ] = React.useState(defaultValues);
  const [ options, setOptions ] = React.useState({
    cells: [],
  });

  const texts = i18n[lang];
  const onMigrateFail = (msg) =>{
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

  const onMigrateSuccess = (sourceCell, targetCell) =>{
    resetDialog();
    onSuccess(sourceCell, targetCell);
  }

  const confirmMigrate = () =>{
    const targetCell = request.targetCell;
    if ('' === targetCell){
      onMigrateFail('select a target cell');
      return;
    }
    migrateInstancesInCell(sourcePool, sourceCell, targetCell, onMigrateSuccess, onMigrateFail);
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
      dataList.forEach(cell =>{
        if (cell.name !== sourceCell){
          cellList.push({
            name: cell.name,
            address: cell.address,
            alive: cell.alive,
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
  }, [initialed, open, sourcePool, sourceCell]);

  //begin render
  let content;
  if (!initialed){
    content = <Skeleton variant="rect" style={{height: '10rem'}}/>;
  }else{
    content = (
      <Grid container>
        <SingleRow>
          <GridItem xs={12} sm={8}>
            <Box m={0} pt={2}>
              <TextField
                label={texts.sourcePool}
                value={sourcePool}
                margin="normal"
                disabled
                fullWidth
              />
            </Box>
          </GridItem>
        </SingleRow>
        <SingleRow>
          <GridItem xs={12} sm={8}>
            <Box m={0} pt={2}>
              <TextField
                label={texts.sourceCell}
                value={sourceCell}
                margin="normal"
                disabled
                fullWidth
              />
            </Box>
          </GridItem>
        </SingleRow>
        <SingleRow>
          <GridItem xs={12} sm={10}>
            <Box m={0} pt={2}>
              <InputLabel htmlFor="targetCell">{texts.targetCell}</InputLabel>
              <Select
                value={request.targetCell}
                onChange={handleRequestPropsChanged('targetCell')}
                inputProps={{
                  name: 'targetCell',
                  id: 'targetCell',
                }}
                fullWidth
              >
                {
                  options.cells.map(cell =>{
                    if(cell.alive){
                      const label = cell.name + '('+ cell.address +')';
                      return <MenuItem value={cell.name} key={cell.name}>{label}</MenuItem>
                    }else{
                      const label = cell.name + '('+ texts.offline +')';
                      return <MenuItem value={cell.name} key={cell.name} disabled>{label}</MenuItem>
                    }
                  })
                }
              </Select>
            </Box>
          </GridItem>
        </SingleRow>
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
      maxWidth="xs"
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
        <Button onClick={confirmMigrate} color="info">
          {texts.confirm}
        </Button>
      </DialogActions>
    </Dialog>
  )
};
