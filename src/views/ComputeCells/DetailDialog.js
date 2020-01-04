import React from "react";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableRow from "@material-ui/core/TableRow";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import Grid from "@material-ui/core/Grid";
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Skeleton from '@material-ui/lab/Skeleton';
import Tooltip from "@material-ui/core/Tooltip";

import PowerIcon from '@material-ui/icons/Power';
import PowerOffIcon from '@material-ui/icons/PowerOff';
import WifiRoundedIcon from '@material-ui/icons/WifiRounded';
import WifiOffRoundedIcon from '@material-ui/icons/WifiOffRounded';
import CheckIcon from '@material-ui/icons/Check';
import BlockIcon from '@material-ui/icons/Block';

// dashboard components
import Button from "components/CustomButtons/Button.js";
import GridItem from "components/Grid/GridItem.js";
import SnackbarContent from "components/Snackbar/SnackbarContent.js";
// core components
import tableStyles from "assets/jss/material-dashboard-react/components/tableStyle.js";
import fontStyles from "assets/jss/material-dashboard-react/components/typographyStyle.js";
import { getComputeCell } from 'nano_api.js';

const i18n = {
  'en':{
    name: "Name",
    address: "Address",
    alive: "Alive",
    status: "Status",
    enabled: 'Enabled',
    disabled: 'Disabled',
    online: "Online",
    offline: "Offline",
    title: 'Current Cell Status',
    cancel: 'Cancel',
    confirm: 'Confirm',
    attached: 'Attached',
    storage: 'Backend Storage',
    localStorage: 'Use local storage',
  },
  'cn':{
    name: "名称",
    address: "地址",
    alive: "活动",
    status: "状态",
    enabled: '已启用',
    disabled: '已禁用',
    online: "在线",
    offline: "离线",
    title: '当前节点状态',
    cancel: '取消',
    confirm: '确定',
    attached: '已挂载',
    storage: '后端存储',
    localStorage: '使用本地存储',
  },
}

const DetailDialog = (props) => {
  const classes = makeStyles(tableStyles)();
  const fontClasses = makeStyles(fontStyles)();
  const { lang, pool, cell, open, onCancel } = props;
  const [ initialed, setInitialed ] = React.useState(false);
  const [ error, setError ] = React.useState('');
  const [ status, setStatus ] = React.useState(null);

  const texts = i18n[lang];

  const onFetchFail = (msg) =>{
    setError(msg);
  }

  const resetDialog = () =>{
    setError('');
    setStatus(null);
    setInitialed(false);
  };

  const closeDialog = ()=>{
    resetDialog();
    onCancel();
  }


  React.useEffect(()=>{
    if (!pool || !cell || !open || initialed ){
      return;
    }

    const onFetchSuccess = (currentStatus) =>{
      setStatus(currentStatus);
      setInitialed(true);
    }

    getComputeCell(pool, cell, onFetchSuccess, onFetchFail);

  }, [initialed, open, pool, cell]);

  //begin render
  let content;
  if (!initialed){
    content = <Skeleton variant="rect" style={{height: '10rem'}}/>;
  }else{
    let statusLabel, statusIcon;
    if (status.enabled){
      statusLabel = texts.enabled;
      statusIcon = <CheckIcon className={fontClasses.successText}/>;
    }else{
      statusLabel = texts.disabled;
      statusIcon = <BlockIcon className={fontClasses.warningText}/>;
    }

    let aliveLabel, aliveIcon;
    if (status.alive){
      aliveLabel = texts.online;
      aliveIcon = <WifiRoundedIcon className={fontClasses.successText}/>;
    }else{
      aliveLabel = texts.offline;
      aliveIcon = <WifiOffRoundedIcon className={fontClasses.warningText}/>;
    }

    content = (
      <div className={classes.tableResponsive}>
        <Table className={classes.table}>
          <TableBody>
            <TableRow className={classes.tableBodyRow}>
              <TableCell className={classes.tableCell}>
                {texts.name}
              </TableCell>
              <TableCell className={classes.tableCell}>
                {status.name}
              </TableCell>
            </TableRow>
            <TableRow className={classes.tableBodyRow}>
              <TableCell className={classes.tableCell}>
                {texts.address}
              </TableCell>
              <TableCell className={classes.tableCell}>
                {status.address ? status.address : ''}
              </TableCell>
            </TableRow>
            <TableRow className={classes.tableBodyRow}>
              <TableCell className={classes.tableCell}>
                {texts.status}
              </TableCell>
              <TableCell className={classes.tableCell}>
                <Tooltip
                  title={statusLabel}
                  placement="top"
                  >
                  {statusIcon}
                </Tooltip>
              </TableCell>
            </TableRow>
            <TableRow className={classes.tableBodyRow}>
              <TableCell className={classes.tableCell}>
                {texts.alive}
              </TableCell>
              <TableCell className={classes.tableCell}>
                <Tooltip
                  title={aliveLabel}
                  placement="top"
                  >
                  {aliveIcon}
                </Tooltip>
              </TableCell>
            </TableRow>
            {
              status.storage?
              status.storage.map( storage => {
                let icon;
                if (storage.attached){
                  icon = (
                    <Tooltip
                      title={texts.attached}
                      placement="top"
                      >
                      <PowerIcon className={fontClasses.successText}/>
                    </Tooltip>
                  );
                }else{
                  icon = (
                    <Tooltip
                      title={storage.error}
                      placement="top"
                      >
                      <PowerOffIcon className={fontClasses.warningText}/>
                    </Tooltip>
                  );
                }
                return (
                  <TableRow className={classes.tableBodyRow}>
                    <TableCell className={classes.tableCell}>
                      {storage.name}
                    </TableCell>
                    <TableCell className={classes.tableCell}>
                      {icon}
                    </TableCell>
                  </TableRow>
                )
              }):
              <TableRow className={classes.tableBodyRow}>
                <TableCell className={classes.tableCell}>
                  {texts.storage}
                </TableCell>
                <TableCell className={classes.tableCell}>
                  {texts.localStorage}
                </TableCell>
              </TableRow>
            }
          </TableBody>
        </Table>
      </div>
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
      </DialogActions>
    </Dialog>
  )
};

export default DetailDialog;
