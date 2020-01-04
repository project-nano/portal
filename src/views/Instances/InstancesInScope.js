import React from "react";
import { Link } from "react-router-dom";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import Skeleton from '@material-ui/lab/Skeleton';
import AddIcon from '@material-ui/icons/Add';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Box from '@material-ui/core/Box';
import Checkbox from '@material-ui/core/Checkbox';
import PowerSettingsNewIcon from '@material-ui/icons/PowerSettingsNew';
import DeleteIcon from '@material-ui/icons/Delete';
import PlaylistAddIcon from '@material-ui/icons/PlaylistAdd';
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

import InstanceRow from "views/Instances/InstanceRow.js";
import DeleteDialog from "views/Instances/DeleteDialog.js";
import CreateDialog from "views/Instances/CreateDialog.js";
import StartWithMediaDialog from "views/Instances/StartWithMediaDialog.js";
import InsertMediaDialog from "views/Instances/InsertMediaDialog.js";
import BuildImageDialog from "views/Instances/BuildImageDialog.js";
import ResetSystemDialog from "views/Instances/ResetSystemDialog.js";
import MigrateInstanceDialog from "views/Instances/MigrateInstanceDialog.js";
import BatchStopDialog from "views/Instances/BatchStopDialog";
import BatchDeleteDialog from "views/Instances/BatchDeleteDialog";
import BatchCreateDialog from "views/Instances/BatchCreateDialog";

// import DetailDialog from "views/Instances/DetailDialog.js";
import { getLoggedSession, logoutSession, redirectToLogin } from 'utils.js';
import { searchInstances, writeLog } from "nano_api.js";
import { useLocation } from "react-router-dom";

const styles = {
  cardCategoryWhite: {
    "&,& a,& a:hover,& a:focus": {
      color: "rgba(255,255,255,.62)",
      margin: "0",
      fontSize: "14px",
      marginTop: "0",
      marginBottom: "0"
    },
    "& a,& a:hover,& a:focus": {
      color: "#FFFFFF"
    }
  },
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
    createButton: "Create New Instance",
    batchCreate: 'Batch Create',
    batchDelete: 'Batch Delete',
    batchStop: 'Batch Stop',
    enterBatch: 'Enter Batch Mode',
    exitBatch: 'Exit Batch Mode',
    tableTitle: "Cloud Instances",
    name: "Name",
    cell: "Host Cell",
    address: "Address",
    core: "Core",
    memory: "Memory",
    disk: "Disk",
    status: "Status",
    operates: "Operates",
    noResource: "No instances available",
    computePools: "Compute Pools",
  },
  'cn':{
    createButton: "创建云主机",
    batchCreate: '批量创建',
    batchDelete: '批量删除',
    batchStop: '批量停止',
    enterBatch: '进入批量模式',
    exitBatch: '退出批量模式',
    tableTitle: "云主机实例",
    name: "名称",
    cell: "承载节点",
    address: "地址",
    core: "核心",
    memory: "内存",
    disk: "磁盘",
    status: "状态",
    operates: "操作",
    noResource: "没有云主机实例",
    computePools: "计算资源池",
  }
}

export default function InstancesInScope(props){
    const classes = useStyles();
    const [ instanceList, setInstanceList ] = React.useState(null);
    const [ checkedMap, setCheckedMap ] = React.useState(new Map());
    const [ batchMode, setBatchMode ] = React.useState(false);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const poolName = queryParams.get("pool");
    const cellName = queryParams.get("cell");

    //for dialog
    const [ createDialogVisible, setCreateDialogVisible ] = React.useState(false);
    const [ deleteDialogVisible, setDeleteDialogVisible ] = React.useState(false);
    const [ mediaStartDialogVisible, setMediaStartDialogVisible ] = React.useState(false);
    const [ insertMediaDialogVisible, setInsertMediaDialogVisible ] = React.useState(false);
    const [ resetSystemDialogVisible, setResetSystemDialogVisible ] = React.useState(false);
    const [ buildImageDialogVisible, setBuildImageDialogVisible ] = React.useState(false);
    const [ migrateDialogVisible, setMigrateDialogVisible ] = React.useState(false);
    const [ batchStopDialogVisible, setBatchStopDialogVisible ] = React.useState(false);
    const [ batchDeleteDialogVisible, setBatchDeleteDialogVisible ] = React.useState(false);
    const [ batchCreateDialogVisible, setBatchCreateDialogVisible ] = React.useState(false);
    const [ currentInstance, setCurrentInstance ] = React.useState('');
    const [ sourcePool, setSourcePool ] = React.useState('');
    const [ sourceCell, setSourceCell ] = React.useState('');

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
      writeLog(msg);
      setTimeout(closeNotify, notifyDuration);
    };

    const reloadAllInstances = React.useCallback(() => {
      const onLoadFail = (err) =>{
        showErrorMessage(err);
        logoutSession();
      }
      const onLoadSuccess = dataList => {
        var updated = checkedMap;
        var modified = false;
        if (!dataList){
          setInstanceList([]);
          if (0 !== updated.size){
            updated.clear();
            modified = true;
          }
        }else{
          setInstanceList(dataList);
          var removeTargets = [];
          updated.forEach((checked, id) =>{
            if(!dataList.some(instance => instance.id === id)){
              //not exists
              removeTargets.push(id);
            }
          });
          dataList.forEach(instance =>{
            const instanceID = instance.id;
            if (!updated.has(instanceID)){
              //new entry
              updated.set(instanceID, false);
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
      }
      searchInstances(poolName, cellName, onLoadSuccess, onLoadFail);
    }, [poolName, cellName, checkedMap, showErrorMessage]);

    //delete
    const showDeleteDialog = (instanceID) =>{
      setDeleteDialogVisible(true);
      setCurrentInstance(instanceID);
    }

    const closeDeleteDialog = () =>{
      setDeleteDialogVisible(false);
    }

    const onDeleteSuccess = (instanceID) =>{
      closeDeleteDialog();
      showNotifyMessage('instance ' + instanceID + ' deleted');
      reloadAllInstances();
    };

    //start with media
    const showMediaStartDialog = (instanceID) =>{
      setMediaStartDialogVisible(true);
      setCurrentInstance(instanceID);
    }

    const closeMediaStartDialog = () =>{
      setMediaStartDialogVisible(false);
    }

    const onMediaStartSuccess = (instanceID) =>{
      closeMediaStartDialog();
      showNotifyMessage('instance ' + instanceID + ' started with media');
      reloadAllInstances();
    };

    //insert media
    const showInsertMediaDialog = (instanceID) =>{
      setInsertMediaDialogVisible(true);
      setCurrentInstance(instanceID);
    }

    const closeInsertMediaDialog = () =>{
      setInsertMediaDialogVisible(false);
    }

    const onInsertMediaSuccess = (instanceID) =>{
      closeInsertMediaDialog();
      showNotifyMessage('instance ' + instanceID + ' started with media');
      reloadAllInstances();
    };

    //reset system
    const showResetSystemDialog = (instanceID) =>{
      setResetSystemDialogVisible(true);
      setCurrentInstance(instanceID);
    }

    const closeResetSystemDialog = () =>{
      setResetSystemDialogVisible(false);
    }

    const onResetSystemSuccess = (instanceID) =>{
      closeResetSystemDialog();
      showNotifyMessage('guest system of ' + instanceID + ' reset');
    };

    //build image
    const showBuildImageDialog = (instanceID) =>{
      setBuildImageDialogVisible(true);
      setCurrentInstance(instanceID);
    }

    const closeBuildImageDialog = () =>{
      setBuildImageDialogVisible(false);
    }

    const onBuildImageSuccess = (imageName) =>{
      closeBuildImageDialog();
      showNotifyMessage('new image ' + imageName + ' created from ' + currentInstance);
    };

    //migrate instance
    const showMigrateDialog = (instanceID, pool, cell) =>{
      setMigrateDialogVisible(true);
      setCurrentInstance(instanceID);
      setSourcePool(pool);
      setSourceCell(cell);
    }

    const closeMigrateDialog = () =>{
      setMigrateDialogVisible(false);
    }

    const onMigrateSuccess = (instanceID) =>{
      closeMigrateDialog();
      showNotifyMessage('instance ' + instanceID + ' migrated');
      reloadAllInstances();
    };

    //create
    const showCreateDialog = () =>{
      setCreateDialogVisible(true);
    };

    const closeCreateDialog = () =>{
      setCreateDialogVisible(false);
    }

    const onCreateSuccess = (id) =>{
      closeCreateDialog();
      showNotifyMessage('new instance ' + id + ' created');
      reloadAllInstances();
    };

    //batch stopping
    const showBatchStopDialog = () =>{
      setBatchStopDialogVisible(true);
    };

    const closeBatchStopDialog = () =>{
      setBatchStopDialogVisible(false);
    }

    const onBatchStopSuccess = () =>{
      closeBatchStopDialog();
      reloadAllInstances();
    };

    //batch deleting
    const showBatchDeleteDialog = () =>{
      setBatchDeleteDialogVisible(true);
    };

    const closeBatchDeleteDialog = () =>{
      setBatchDeleteDialogVisible(false);
    }

    const onBatchDeleteSuccess = () =>{
      closeBatchDeleteDialog();
      reloadAllInstances();
    };

    //batch creating
    const showBatchCreateDialog = () =>{
      setBatchCreateDialogVisible(true);
    };

    const closeBatchCreateDialog = () =>{
      setBatchCreateDialogVisible(false);
    }

    const onBatchCreateSuccess = () =>{
      closeBatchCreateDialog();
      reloadAllInstances();
    };

    const onStatusChange = () =>{
      reloadAllInstances();
    }

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
    const handleInstanceChecked = (checked, instanceID) =>{
      var checkedStatus = new Map(checkedMap);
      checkedStatus.set(instanceID, checked);
      setCheckedMap(checkedStatus);
    }

    const handleAllClicked = e =>{
      const checked = e.target.checked;
      var updated = new Map();
      for(var instanceID of checkedMap.keys()){
        updated.set(instanceID, checked);
      }
      setCheckedMap(updated);
    }

    React.useEffect(() =>{
      var mounted = true
      reloadAllInstances();
      const updateInterval = 5 * 1000;
      var timerID = setInterval(()=>{
        if (mounted){
          reloadAllInstances();
        }
      }, updateInterval);
      return () =>{
        mounted = false;
        clearInterval(timerID);
      }
    }, [reloadAllInstances]);

    if (!poolName){
      console.log('pool name omit');
      return redirectToLogin();
    }

    //reder begin
    var session = getLoggedSession();
    if (null === session){
      return redirectToLogin();
    }

    const { lang } = props;
    const texts = i18n[lang];
    let content;
    if (null === instanceList){
      content = <Skeleton variant="rect" style={{height: '10rem'}}/>;
    }else if (0 === instanceList.length){
      content = <Info>{texts.noResource}</Info>;
    }else{
      let nameHeader;
      if(batchMode){
        nameHeader = (
          <Box display='flex' alignItems="center">
            <Box>
              <Checkbox
                onChange={handleAllClicked}
                />
            </Box>
            <Box>
              {texts.name}
            </Box>
          </Box>
        );
      }else{
        nameHeader = texts.name;
      }
      content = (
        <OperableTable
          color="primary"
          headers={[nameHeader, texts.cell, texts.address, texts.core, texts.memory, texts.disk, texts.status, texts.operates]}
          rows={
            instanceList.map(instance =>{
              const instanceID = instance.id;
              return (
                <InstanceRow
                  key={instance.id}
                  instance={instance}
                  lang={lang}
                  checked={checkedMap && checkedMap.has(instanceID) ? checkedMap.get(instanceID): false}
                  checkable={batchMode}
                  onCheckStatusChanged={handleInstanceChecked}
                  onNotify={showNotifyMessage}
                  onError={showErrorMessage}
                  onDelete={showDeleteDialog}
                  onMediaStart={showMediaStartDialog}
                  onInsertMedia={showInsertMediaDialog}
                  onResetSystem={showResetSystemDialog}
                  onBuildImage={showBuildImageDialog}
                  onStatusChange={onStatusChange}
                  onMigrateInstance={showMigrateDialog}
                  />
              )
            })}
          />
      );
    }

    var breadcrumbs = [<Link to='/admin/compute_pools/' key={texts.computePools}>{texts.computePools}</Link>];
    if(cellName){
      breadcrumbs.push(<Link to={'/admin/instances/range/?pool=' + poolName} key={poolName}>{poolName}</Link>);
      breadcrumbs.push(<Typography color="textPrimary" key={cellName}>{cellName}</Typography>);
    }else{
      breadcrumbs.push(<Typography color="textPrimary" key={poolName}>{poolName}</Typography>);
    }

    var buttons = [
      <Button size="sm" color="info" round onClick={showCreateDialog}><AddIcon />{texts.createButton}</Button>,
      <Button size="sm" color="info" round onClick={showBatchCreateDialog}><PlaylistAddIcon />{texts.batchCreate}</Button>,
    ]
    if(batchMode){
      buttons.push(
        <Button size="sm" color="info" round onClick={showBatchDeleteDialog}><DeleteIcon />{texts.batchDelete}</Button>,
        <Button size="sm" color="info" round onClick={showBatchStopDialog}><PowerSettingsNewIcon />{texts.batchStop}</Button>,
        <Button size="sm" color="rose" round onClick={exitBatchMode}><ExitToAppIcon />{texts.exitBatch}</Button>,
      );
    }else{
      buttons.push(
        <Button size="sm" color="info" round onClick={enterBatchMode}><ListIcon />{texts.enterBatch}</Button>
      );
    }

    var batchTargets = [];
    if(checkedMap){
      checkedMap.forEach((checked, id) =>{
        if(checked){
          batchTargets.push(id);
        }
      });
      batchTargets.sort();
    }

    return (
      <GridContainer>
        <GridItem xs={12}>
          <Breadcrumbs separator="›" aria-label="breadcrumb">
            {breadcrumbs}
          </Breadcrumbs>
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
          <CreateDialog
            lang={lang}
            open={createDialogVisible}
            onSuccess={onCreateSuccess}
            onCancel={closeCreateDialog}
            />
        </GridItem>
        <GridItem>
          <DeleteDialog
            lang={lang}
            instanceID={currentInstance}
            open={deleteDialogVisible}
            onSuccess={onDeleteSuccess}
            onCancel={closeDeleteDialog}
            />
        </GridItem>
        <GridItem>
          <StartWithMediaDialog
            lang={lang}
            instanceID={currentInstance}
            open={mediaStartDialogVisible}
            onSuccess={onMediaStartSuccess}
            onCancel={closeMediaStartDialog}
            />
        </GridItem>
        <GridItem>
          <InsertMediaDialog
            lang={lang}
            instanceID={currentInstance}
            open={insertMediaDialogVisible}
            onSuccess={onInsertMediaSuccess}
            onCancel={closeInsertMediaDialog}
            />
        </GridItem>
        <GridItem>
          <ResetSystemDialog
            lang={lang}
            instanceID={currentInstance}
            open={resetSystemDialogVisible}
            onSuccess={onResetSystemSuccess}
            onCancel={closeResetSystemDialog}
            />
        </GridItem>
        <GridItem>
          <BuildImageDialog
            lang={lang}
            instanceID={currentInstance}
            open={buildImageDialogVisible}
            onSuccess={onBuildImageSuccess}
            onCancel={closeBuildImageDialog}
            />
        </GridItem>
        <GridItem>
          <MigrateInstanceDialog
            lang={lang}
            instanceID={currentInstance}
            sourcePool={sourcePool}
            sourceCell={sourceCell}
            open={migrateDialogVisible}
            onSuccess={onMigrateSuccess}
            onCancel={closeMigrateDialog}
            />
        </GridItem>
        <GridItem>
          <BatchStopDialog
            lang={lang}
            open={batchStopDialogVisible}
            targets={batchStopDialogVisible? batchTargets : []}
            onSuccess={onBatchStopSuccess}
            onCancel={closeBatchStopDialog}
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
        <GridItem>
          <BatchCreateDialog
            lang={lang}
            open={batchCreateDialogVisible}
            onSuccess={onBatchCreateSuccess}
            onCancel={closeBatchCreateDialog}
            />
        </GridItem>
      </GridContainer>
    );
}
