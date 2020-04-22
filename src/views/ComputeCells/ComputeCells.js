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
import CheckIcon from '@material-ui/icons/Check';
import BlockIcon from '@material-ui/icons/Block';
import CloudQueueIcon from '@material-ui/icons/CloudQueue';
import DeleteIcon from '@material-ui/icons/Delete';
import SettingsIcon from '@material-ui/icons/Settings';
import LocalShippingRoundedIcon from '@material-ui/icons/LocalShippingRounded';
import WifiRoundedIcon from '@material-ui/icons/WifiRounded';
import WifiOffRoundedIcon from '@material-ui/icons/WifiOffRounded';
import StorageIcon from '@material-ui/icons/Storage';
import Tooltip from "@material-ui/core/Tooltip";

// dashboard components
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import Info from "components/Typography/Info.js";
import Snackbar from "components/Snackbar/Snackbar.js";
import Button from "components/CustomButtons/Button.js";
import Table from "components/Table/ObjectTable.js";
import IconButton from "components/CustomButtons/IconButton.js";
import RemoveDialog from "views/ComputeCells/RemoveDialog.js";
import AddDialog from "views/ComputeCells/AddDialog.js";
import DetailDialog from "views/ComputeCells/DetailDialog.js";
import MigrateDialog from "views/ComputeCells/MigrateDialog";
import StorageDialog from "views/ComputeCells/ChangeStorageDialog";
import fontStyles from "assets/jss/material-dashboard-react/components/typographyStyle.js";
import { queryComputeCellsInPool, modifyComputeCell, writeLog } from "nano_api.js";
import { useLocation } from "react-router-dom";

const styles = {
  ...fontStyles,
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
    addButton: "Add Compute Cell",
    tableTitle: "Compute Cells",
    name: "Name",
    address: "Address",
    alive: "Alive",
    status: "Status",
    operates: "Operates",
    noResource: "No compute cell available",
    computePools: "Compute Pools",
    enable: 'Enable',
    disable: 'Disable',
    enabled: 'Enabled',
    disabled: 'Disabled',
    instances: 'Instances',
    detail: 'Detail',
    remove: 'Remove',
    migrate: 'Migrate',
    online: "Online",
    offline: "Offline",
    changeStorage: "Change Storage Path",
  },
  'cn':{
    addButton: "添加资源节点",
    tableTitle: "计算资源节点",
    name: "名称",
    address: "地址",
    alive: "活动",
    status: "状态",
    operates: "操作",
    noResource: "没有计算资源节点",
    computePools: "计算资源池",
    enable: '启用',
    disable: '禁用',
    enabled: '已启用',
    disabled: '已禁用',
    instances: '云主机实例',
    detail: '详情',
    remove: '移除',
    migrate: '迁移',
    online: "在线",
    offline: "离线",
    changeStorage: "修改存储路径",
  }
}

export default function ComputeCells(props){
    const classes = useStyles();
    const { lang } = props;
    const texts = i18n[lang];
    const [ mounted, setMounted ] = React.useState(false);
    const [ dataList, setDataList ] = React.useState(null);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const poolName = queryParams.get("pool");

    //for dialog
    const [ addDialogVisible, setAddDialogVisible ] = React.useState(false);
    const [ detailDialogVisible, setDetailDialogVisible ] = React.useState(false);
    const [ removeDialogVisible, setRemoveDialogVisible ] = React.useState(false);
    const [ migrateDialogVisible, setMigrateDialogVisible ] = React.useState(false);
    const [ storageDialogVisible, setStorageDialogVisible ] = React.useState(false);
    const [ selected, setSelected ] = React.useState('');

    const [ notifyColor, setNotifyColor ] = React.useState('warning');
    const [ notifyMessage, setNotifyMessage ] = React.useState("");

    const closeNotify = () => {
      setNotifyMessage("");
    }

    const showErrorMessage = React.useCallback((msg) => {
      if (!mounted){
        return;
      }
      const notifyDuration = 3000;
      setNotifyColor('warning');
      setNotifyMessage(msg);
      setTimeout(closeNotify, notifyDuration);
    }, [setNotifyColor, setNotifyMessage, mounted]);

    const reloadAllData = React.useCallback(() => {
      if (!mounted){
        return;
      }
      const onLoadFail = (err) =>{
        if (!mounted){
          return;
        }
        showErrorMessage(err);
      }
      queryComputeCellsInPool(poolName, setDataList, onLoadFail);
    }, [poolName, showErrorMessage, mounted]);

    const showNotifyMessage = (msg) => {
      const notifyDuration = 3000;
      setNotifyColor('info');
      setNotifyMessage(msg);
      writeLog(msg);
      setTimeout(closeNotify, notifyDuration);
    };

    //detail
    const showDetailDialog = (cellName) =>{
      setDetailDialogVisible(true);
      setSelected(cellName);
    }

    const closeDetailDialog = () =>{
      setDetailDialogVisible(false);
    }

    //delete
    const showRemoveDialog = (cellName) =>{
      setRemoveDialogVisible(true);
      setSelected(cellName);
    }

    const closeRemoveDialog = () =>{
      setRemoveDialogVisible(false);
    }

    const onRemoveSuccess = (cellName) =>{
      closeRemoveDialog();
      showNotifyMessage('cell '+ cellName + ' removed from ' + poolName);
      reloadAllData();
    };

    //create
    const showAddDialog = () =>{
      setAddDialogVisible(true);
    };

    const closeAddDialog = () =>{
      setAddDialogVisible(false);
    }

    const onAddSuccess = (cellName) =>{
      closeAddDialog();
      showNotifyMessage('cell '+ cellName + ' added to ' + poolName);
      reloadAllData();
    };

    //migrate instance
    const showMigrateDialog = cellName =>{
      setMigrateDialogVisible(true);
      setSelected(cellName);
    }

    const closeMigrateDialog = () =>{
      setMigrateDialogVisible(false);
    }

    const onMigrateSuccess = () =>{
      closeMigrateDialog();
      reloadAllData();
    };

    //change storage
    //migrate instance
    const showStorageDialog = cellName =>{
      setStorageDialogVisible(true);
      setSelected(cellName);
    }

    const closeStorageDialog = () =>{
      setStorageDialogVisible(false);
    }

    const onStoragePathChange = (location, cellName) =>{
      closeStorageDialog();
      showNotifyMessage('storage path of  '+ cellName + ' changed to ' + location);
    };

    const enableCell = cellName =>{
      const onSuccess = () =>{
        if (!mounted){
          return;
        }
        reloadAllData();
      }
      modifyComputeCell(poolName, cellName, true, onSuccess, showErrorMessage);
    }

    const disableCell = cellName =>{
      const onSuccess = () =>{
        if (!mounted){
          return;
        }
        reloadAllData();
      }
      modifyComputeCell(poolName, cellName, false, onSuccess, showErrorMessage);
    }

    React.useEffect(() =>{
      setMounted(true);
      reloadAllData();
      const updateInterval = 5 * 1000;
      var timerID = setInterval(()=>{
        if (mounted){
          reloadAllData();
        }
      }, updateInterval);
      return () =>{
        setMounted(false);
        clearInterval(timerID);
      }
    }, [reloadAllData, mounted]);

    let content;
    if (null === dataList){
      content = <Skeleton variant="rect" style={{height: '10rem'}}/>;
    }else if (0 === dataList.length){
      content = <Box display="flex" justifyContent="center"><Info>{texts.noResource}</Info></Box>;
    }else{
      var rows = [];
      dataList.forEach( cell => {
        var buttons = [
          {
            label: texts.instances,
            icon: CloudQueueIcon,
            href: '/admin/instances/range/?pool=' + poolName + '&cell=' + cell.name,
          },
          {
            onClick: e => showDetailDialog(cell.name),
            icon: SettingsIcon,
            label: texts.detail,
          },
          {
            onClick: e => showStorageDialog(cell.name),
            icon: StorageIcon,
            label: texts.changeStorage,
          },
          {
            onClick: e => showRemoveDialog(cell.name),
            icon: DeleteIcon,
            label: texts.remove,
          },
          {
            onClick: e => showMigrateDialog(cell.name),
            icon: LocalShippingRoundedIcon,
            label: texts.migrate,
          },
        ];

        const { name, address, enabled, alive } = cell;
        let statusIcon, aliveIcon;
        if (enabled){
          statusIcon = (
            <Tooltip
              title={texts.enabled}
              placement="top"
              >
              <CheckIcon className={classes.successText}/>
            </Tooltip>
          );
          const disableButton = {
            label: texts.disable,
            icon: BlockIcon,
            onClick: () => disableCell(name),
          };
          buttons = [disableButton].concat(buttons);
        }else{
          statusIcon = (
            <Tooltip
              title={texts.disabled}
              placement="top"
              >
              <BlockIcon className={classes.warningText}/>
            </Tooltip>
          );
          const enableButton = {
            label: texts.enable,
            icon: CheckIcon,
            onClick: () => enableCell(name),
          };
          buttons = [enableButton].concat(buttons);
        }

        if (alive){
          aliveIcon = (
            <Tooltip
              title={texts.online}
              placement="top"
              >
              <WifiRoundedIcon className={classes.successText}/>
            </Tooltip>
          );
        }else{
          aliveIcon = (
            <Tooltip
              title={texts.offline}
              placement="top"
              >
              <WifiOffRoundedIcon className={classes.warningText}/>
            </Tooltip>
          );
        }

        const operates = buttons.map((button, key) => (
          React.createElement(IconButton, {
            ...button,
            key: key,
          })
        ))
        var row = [name, address, aliveIcon, statusIcon, operates];
        rows.push(row);
      });
      content = (
        <Table
          color="primary"
          headers={[texts.name, texts.address, texts.alive, texts.status, texts.operates]}
          rows={rows}/>
      );
    }

    return (
      <GridContainer>
        <GridItem xs={12}>
          <Breadcrumbs separator="›" aria-label="breadcrumb">
            <Link to='/admin/compute_pools/'>
              {texts.computePools}
            </Link>
            <Typography color="textPrimary">{poolName}</Typography>
          </Breadcrumbs>
        </GridItem>
        <GridItem xs={12}>
          <Box mt={3} mb={3}>
          <Divider/>
          </Box>
        </GridItem>
        <GridItem xs={12}>
          <GridContainer>
            <GridItem xs={3}>
              <Button size="sm" color="info" round onClick={showAddDialog}><AddIcon />{texts.addButton}</Button>
            </GridItem>
          </GridContainer>
        </GridItem>
        <GridItem xs={12}>
          <Card>
            <CardHeader color="primary">
              <h4 className={classes.cardTitleWhite}>{texts.tableTitle}</h4>
            </CardHeader>
            <CardBody>
              {content}
            </CardBody>
          </Card>
        </GridItem>
        <Snackbar
          place="tr"
          color={notifyColor}
          message={notifyMessage}
          open={"" !== notifyMessage}
          closeNotification={closeNotify}
          close
        />
        <AddDialog
          lang={lang}
          open={addDialogVisible}
          pool={poolName}
          onSuccess={onAddSuccess}
          onCancel={closeAddDialog}
          />
        <DetailDialog
          lang={lang}
          open={detailDialogVisible}
          pool={poolName}
          cell={selected}
          onCancel={closeDetailDialog}
          />
        <RemoveDialog
          lang={lang}
          open={removeDialogVisible}
          pool={poolName}
          cell={selected}
          onSuccess={onRemoveSuccess}
          onCancel={closeRemoveDialog}
          />
        <MigrateDialog
          lang={lang}
          open={migrateDialogVisible}
          sourcePool={poolName}
          sourceCell={selected}
          onSuccess={onMigrateSuccess}
          onCancel={closeMigrateDialog}
          />
        <StorageDialog
          lang={lang}
          open={storageDialogVisible}
          pool={poolName}
          cell={selected}
          onSuccess={onStoragePathChange}
          onCancel={closeStorageDialog}
          />
      </GridContainer>
    );
}
