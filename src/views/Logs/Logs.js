import React from "react";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import Skeleton from '@material-ui/lab/Skeleton';
import Divider from '@material-ui/core/Divider';
import Box from '@material-ui/core/Box';
import Checkbox from '@material-ui/core/Checkbox';
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import DeleteIcon from '@material-ui/icons/Delete';
import ListIcon from '@material-ui/icons/List';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';

// dashboard components
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import Info from "components/Typography/Info.js";
import Snackbar from "components/Snackbar/Snackbar.js";
import Button from "components/CustomButtons/Button.js";
import OperableTable from "components/Table/OperableTable.js";
import BatchDeleteDialog from "views/Logs/BatchDeleteDialog";

import dashboardStyles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";
import { getLoggedSession, redirectToLogin } from 'utils.js';
import { queryLogs, writeLog } from "nano_api.js";

const styles = {
  ...dashboardStyles,
  cardTitleWhite: {
    color: "#FFFFFF",
    marginTop: "0px",
    minHeight: "auto",
    fontWeight: "300",
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    marginBottom: "3px",
    textDecoration: "none",
    "& small": {
      color: "#777",
      fontSize: "65%",
      fontWeight: "400",
      lineHeight: "1"
    }
  }
};

const useStyles = makeStyles(styles);

const i18n = {
  'en':{
    batchDelete: 'Batch Delete',
    enterBatch: 'Enter Batch Mode',
    exitBatch: 'Exit Batch Mode',
    tableTitle: "Operate Logs",
    duration: 'Log Duration',
    time: "Timestamp",
    content: "Content",
    noResource: "No log available",
    day: 'The Last Day',
    month: 'The Last Month',
    year: 'The Last Year',
  },
  'cn':{
    batchDelete: '批量删除',
    enterBatch: '进入批量模式',
    exitBatch: '退出批量模式',
    tableTitle: "操作日志",
    duration: '日志范围',
    time: "日志时间",
    content: "内容",
    noResource: "没有日志信息",
    day: '最近一天',
    month: '最近一个月',
    year: '最近一年',
  }
}

const LogRow = props =>{
  const { log, checked, checkable, onCheckStatusChanged} = props;
  const handleCheckChanged = e => {
    const isChecked = e.target.checked;
    onCheckStatusChanged(isChecked, log.id);
  }
  let rowHeader;
  if(checkable){
    rowHeader = (
      <Box display='flex' alignItems="center">
        <Box>
          <Checkbox
            checked={checked}
            onChange={handleCheckChanged}
            value={log.id}
            />
        </Box>
        <Box>
          {log.time}
        </Box>
      </Box>
    );
  }else{
    rowHeader = log.time;
  }
  return (
    <TableRow>
      <TableCell>
        {rowHeader}
      </TableCell>
      <TableCell>
        {log.content}
      </TableCell>
    </TableRow>
  );
}

export default function Logs(props){
    const logsPerPage = 10;
    const DurantionDay = 'last-day';
    const DurantionMonth = 'last-month';
    const DurantionYear = 'last-year';
    const classes = useStyles();
    const [ logList, setLogList ] = React.useState(null);
    const [ checkedMap, setCheckedMap ] = React.useState(new Map());
    const [ batchMode, setBatchMode ] = React.useState(false);
    const [ queryParams, setQueryParams ] = React.useState({
      offset: 0,
      duration: DurantionDay,
    })
    const [ pages, setPages ] = React.useState({
      current: 0,
      total: 0,
    })

    //for dialog
    const [ batchDeleteDialogVisible, setBatchDeleteDialogVisible ] = React.useState(false);

    const [ notifyColor, setNotifyColor ] = React.useState('warning');
    const [ notifyMessage, setNotifyMessage ] = React.useState("");

    const closeNotify = () => {
      setNotifyMessage("");
    }

    const showErrorMessage = React.useCallback((msg) => {
      const notifyDuration = 3000;
      setNotifyColor('warning');
      setNotifyMessage(msg);
      setTimeout(closeNotify, notifyDuration);
    }, [setNotifyColor, setNotifyMessage]);

    const showNotifyMessage = (msg) => {
      const notifyDuration = 3000;
      setNotifyColor('info');
      setNotifyMessage(msg);
      setTimeout(closeNotify, notifyDuration);
    };

    const dateToString = date => {
      const paddingToTwoBytes = number => {
        if (number < 10){
          return '0' + number.toString();
        }else{
          return number.toString();
        }
      }
      return date.getFullYear() + '-' + paddingToTwoBytes(date.getMonth() + 1)
       + '-' + paddingToTwoBytes(date.getDate()) + ' ' +
       paddingToTwoBytes(date.getHours()) + ':' + paddingToTwoBytes(date.getMinutes())
       + ':' + paddingToTwoBytes(date.getSeconds());
    }

    const reloadAllLogs = React.useCallback(() => {
      const onLoadFail = (err) =>{
        showErrorMessage(err);
      }
      const onLoadSuccess = result => {
        const { logs, total, offset } = result;
        var updated = new Map(checkedMap);
        var modified = false;
        if (!logs){
          setLogList([]);
          if (0 !== updated.size){
            updated.clear();
            modified = true;
          }
        }else{
          setLogList(logs);
          var removeTargets = [];
          updated.forEach((checked, id) =>{
            if(!logs.some(log => log.id === id)){
              //not exists
              removeTargets.push(id);
            }
          });
          logs.forEach(log =>{
            const logID = log.id;
            if (!updated.has(logID)){
              //new entry
              updated.set(logID, false);
              if(!modified){
                modified = true;
              }
            }
          })
          if (0 !== removeTargets.length){
            removeTargets.forEach(id =>{
              updated.delete(id);
              if(!modified){
                modified = true;
              }
            })
          }
        }
        if(modified){
          setCheckedMap(new Map(updated));
        }
        if(0 !== total){
          let currentPage;
          if(offset < logsPerPage){
            currentPage = 0;
          }else{
            currentPage = Math.floor(offset / logsPerPage);
          }
          let totalPages;
          if(0 === total % logsPerPage){
            totalPages = total / logsPerPage;
          }else{
            totalPages = Math.ceil(total / logsPerPage);
          }
          setPages({
            current: currentPage,
            total: totalPages,
          })
        }
      }

      const before = new Date();
      var after = new Date(before);
      switch (queryParams.duration) {
        case DurantionDay:
          after.setDate(before.getDate() - 1);
          break;
        case DurantionMonth:
          after.setMonth(before.getMonth() - 1);
          break;
        case DurantionYear:
          after.setFullYear(before.getFullYear() - 1);
          break;
        default:
          showErrorMessage('invalid duration: ' + queryParams.duration);
          return;
      }

      queryLogs(logsPerPage, queryParams.offset, dateToString(after), dateToString(before), onLoadSuccess, onLoadFail);
    }, [queryParams, checkedMap, showErrorMessage]);


    //batch deleting
    const showBatchDeleteDialog = () =>{
      setBatchDeleteDialogVisible(true);
    };

    const closeBatchDeleteDialog = () =>{
      setBatchDeleteDialogVisible(false);
    }

    const onBatchDeleteSuccess = count =>{
      closeBatchDeleteDialog();
      showNotifyMessage(count.toString() + ' log(s) deleted');
      writeLog(count.toString() + ' log(s) deleted');
      reloadAllLogs();
    };


    const enterBatchMode = () => {
      var updated = new Map();
      //uncheck all
      for(var instanceID of checkedMap.keys()){
        updated.set(instanceID, false);
      }
      setCheckedMap(updated);
      setBatchMode(true);
    }

    const exitBatchMode = () => {
      setBatchMode(false);
    }

    const handleLogChecked = (checked, logID) =>{
      var checkedStatus = new Map(checkedMap);
      checkedStatus.set(logID, checked);
      setCheckedMap(checkedStatus);
    }

    const handleAllClicked = e =>{
      const checked = e.target.checked;
      var updated = new Map();
      for(const logID of checkedMap.keys()){
        updated.set(logID, checked);
      }
      setCheckedMap(updated);
    }

    const handleDurationChanged = e => {
      const duration = e.target.value;
      setQueryParams({
        offset: 0,
        duration: duration,
      })

      reloadAllLogs();
    }

    const changeCurrentPage = index => {
      const offset = index * logsPerPage;
      setQueryParams(previous => ({
        ...previous,
        offset: offset,
      }))
    }

    React.useEffect(() =>{
      // var mounted = true
      // reloadAllLogs();
      // const updateInterval = 5 * 1000;
      // var timerID = setInterval(()=>{
      //   if (mounted){
      //     reloadAllLogs();
      //   }
      // }, updateInterval);
      // return () =>{
      //   mounted = false;
      //   clearInterval(timerID);
      // }
      reloadAllLogs();
    }, [reloadAllLogs]);

    //reder begin
    var session = getLoggedSession();
    if (null === session){
      return redirectToLogin();
    }

    const { lang } = props;
    const texts = i18n[lang];
    let content;
    if (!logList){
      content = <Skeleton variant="rect" style={{height: '10rem'}}/>;
    }else if (0 === logList.length){
      content = <Info>{texts.noResource}</Info>;
    }else{
      let rowHeader;
      if(batchMode){
        rowHeader = (
          <Box display='flex' alignItems="center">
            <Box>
              <Checkbox
                onChange={handleAllClicked}
                />
            </Box>
            <Box>
              {texts.time}
            </Box>
          </Box>
        );
      }else{
        rowHeader = texts.time;
      }
      content = (
        <OperableTable
          color="primary"
          headers={[rowHeader, texts.content]}
          rows={
            logList.map(log =>{
              const logID = log.id;
              return (
                <LogRow
                  key={logID}
                  log={log}
                  checked={checkedMap && checkedMap.has(logID) ? checkedMap.get(logID): false}
                  checkable={batchMode}
                  onCheckStatusChanged={handleLogChecked}
                  />
              )
            })}
          />
      );
    }

    var buttons = [];
    if(batchMode){
      buttons.push(
        <Button size="sm" color="info" round onClick={showBatchDeleteDialog}><DeleteIcon />{texts.batchDelete}</Button>,
        <Button size="sm" color="rose" round onClick={exitBatchMode}><ExitToAppIcon />{texts.exitBatch}</Button>,
      );
    }else{
      buttons.push(
        <Button size="sm" color="info" round onClick={enterBatchMode}><ListIcon />{texts.enterBatch}</Button>
      );
    }

    const durationOptions = [
      {
        label: texts.day,
        value: DurantionDay,
      },
      {
        label: texts.month,
        value: DurantionMonth,
      },
      {
        label: texts.year,
        value: DurantionYear,
      },
    ];
    const durationRadioGroup = (
      <Box m={0} pt={2}>
        <FormControl component="fieldset" fullWidth>
          <FormLabel component="legend">{texts.duration}</FormLabel>
          <RadioGroup name="duration" value={queryParams.duration} onChange={handleDurationChanged} row>
            <Box display='flex' alignItems='center'>
              {
                durationOptions.map((option, key) => (
                  <Box key={key}>
                    <FormControlLabel value={option.value} control={<Radio />} label={option.label}/>
                  </Box>
                ))
              }
            </Box>
          </RadioGroup>
        </FormControl>
      </Box>
    )

    var batchTargets = [];
    if(checkedMap){
      checkedMap.forEach((checked, id) =>{
        if(checked){
          batchTargets.push(id);
        }
      });
      batchTargets.sort();
    }

    let pagination;
    if (pages.total > 1){
      var links = [];
      for(var index = 0; index < pages.total; index++){
        const targetPage = index;
        if(index === pages.current){
          links.push(<Typography>{targetPage + 1}</Typography>);
        }else{
          links.push(<Link href='#' underline='none' onClick={() => changeCurrentPage(targetPage)}>{targetPage + 1}</Link>);
        }
      }
      pagination = (
        <Box display='flex' alignItems='center' justifyContent="center">
          {
            links.map((link, key) => (
              <Box key={key} m={1} p={0}>
                {link}
              </Box>
            ))
          }
        </Box>
      )
    }else{
      pagination = <div/>;
    }


    return (
      <GridContainer>
        <GridItem xs={12}>
          <GridContainer>
            <GridItem xs={12}>
              {durationRadioGroup}
            </GridItem>
          </GridContainer>
        </GridItem>
        <GridItem xs={12}>
          <Box mt={3} mb={3}>
            <Divider/>
          </Box>
        </GridItem>
        <GridItem xs={12}>
          <Box display='flex'>
            {
              buttons.map((button, key) =>(
                <Box key={key} m={1}>
                  {button}
                </Box>
              ))
            }
          </Box>
        </GridItem>
        <GridItem xs={12} sm={12} md={12}>
          <Card>
            <CardHeader color="primary">
              <h4 className={classes.cardTitleWhite}>{texts.tableTitle}</h4>
            </CardHeader>
            <CardBody>
              {content}
              {pagination}
            </CardBody>
          </Card>
        </GridItem>
        <GridItem>
          <Snackbar
            place="tr"
            color={notifyColor}
            message={notifyMessage}
            open={"" !== notifyMessage}
            closeNotification={closeNotify}
            close
          />
        </GridItem>
        <GridItem>
          <BatchDeleteDialog
            lang={lang}
            open={batchDeleteDialogVisible}
            targets={batchDeleteDialogVisible? batchTargets : []}
            onSuccess={onBatchDeleteSuccess}
            onCancel={closeBatchDeleteDialog}
            />
        </GridItem>
      </GridContainer>
    );
}
