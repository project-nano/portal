import React from "react";
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
import ViewQuiltIcon from '@material-ui/icons/ViewQuilt';
import CloudQueueIcon from '@material-ui/icons/CloudQueue';
import DeleteIcon from '@material-ui/icons/Delete';
import SettingsIcon from '@material-ui/icons/Settings';
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
import DeleteDialog from "views/ComputePools/DeleteDialog.js";
import CreateDialog from "views/ComputePools/CreateDialog.js";
import ModifyDialog from "views/ComputePools/ModifyDialog.js";
import fontStyles from "assets/jss/material-dashboard-react/components/typographyStyle.js";
import { getAllComputePools, writeLog } from "nano_api.js";

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
    createButton: "Create Compute Pool",
    tableTitle: "Compute Pools",
    name: "Name",
    cells: "Cells",
    storage: 'Backend Storage',
    network: 'Address Pool',
    failover: "FailOver",
    status: "Status",
    operates: "Operates",
    noPools: "No compute pool available",
    computePools: "Compute Pools",
    enable: 'Enable',
    disable: 'Disable',
    enabled: 'Enabled',
    disabled: 'Disabled',
    instances: 'Instances',
    modify: 'Modify',
    delete: 'Delete',
    on: 'on',
    off: 'off',
    localStorage: 'Use local storage',
    noAddressPool: "Don't use address pool",
  },
  'cn':{
    createButton: "创建资源池",
    tableTitle: "计算资源池",
    name: "名称",
    cells: "资源节点",
    storage: '后端存储',
    network: '地址池',
    failover: "故障切换",
    status: "状态",
    operates: "操作",
    noPools: "没有计算资源池",
    computePools: "计算资源池",
    enable: '启用',
    disable: '禁用',
    enabled: '已启用',
    disabled: '已禁用',
    instances: '云主机实例',
    modify: '修改',
    delete: '删除',
    on: '开启',
    off: '关闭',
    localStorage: '使用本地存储',
    noAddressPool: "不使用地址池",
  }
}

export default function ComputePools(props){
    const classes = useStyles();
    const { lang } = props;
    const texts = i18n[lang];
    const [ mounted, setMounted ] = React.useState(false);
    const [ dataList, setDataList ] = React.useState(null);
    //for dialog
    const [ createDialogVisible, setCreateDialogVisible ] = React.useState(false);
    const [ modifyDialogVisible, setModifyDialogVisible ] = React.useState(false);
    const [ deleteDialogVisible, setDeleteDialogVisible ] = React.useState(false);
    const [ selected, setSelected ] = React.useState('');

    const [ notifyColor, setNotifyColor ] = React.useState('warning');
    const [ notifyMessage, setNotifyMessage ] = React.useState("");

    const closeNotify = () => {
      setNotifyMessage("");
    }

    const showErrorMessage = React.useCallback(msg => {
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
      getAllComputePools(setDataList, onLoadFail);
    }, [showErrorMessage, mounted]);

    const showNotifyMessage = msg => {
      if (!mounted){
        return;
      }
      const notifyDuration = 3000;
      setNotifyColor('info');
      setNotifyMessage(msg);
      writeLog(msg);
      setTimeout(closeNotify, notifyDuration);
    };

    //modify
    const showModifyDialog = (poolName) =>{
      setModifyDialogVisible(true);
      setSelected(poolName);
    }

    const closeModifyDialog = () =>{
      setModifyDialogVisible(false);
    }

    const onModifySuccess = poolName =>{
      closeModifyDialog();
      showNotifyMessage('pool ' + poolName + ' modified');
      reloadAllData();
    };

    //delete
    const showDeleteDialog = poolName =>{
      setDeleteDialogVisible(true);
      setSelected(poolName);
    }

    const closeDeleteDialog = () =>{
      setDeleteDialogVisible(false);
    }

    const onDeleteSuccess = (poolName) =>{
      closeDeleteDialog();
      showNotifyMessage('pool ' + poolName + ' deleted');
      reloadAllData();
    };

    //create
    const showCreateDialog = () =>{
      setCreateDialogVisible(true);
    };

    const closeCreateDialog = () =>{
      setCreateDialogVisible(false);
    }

    const onCreateSuccess = (poolName) =>{
      closeCreateDialog();
      showNotifyMessage('pool ' + poolName + ' created');
      reloadAllData();
    };

    React.useEffect(() =>{
      setMounted(true);
      reloadAllData();
      return () =>{
        setMounted(false);
      }
    }, [reloadAllData]);

    //begin rendering
    let content;
    if (null === dataList){
      content = <Skeleton variant="rect" style={{height: '10rem'}}/>;
    }else if (0 === dataList.length){
      content = <Box display="flex" justifyContent="center"><Info>{texts.noPools}</Info></Box>;
    }else{
      var rows = [];
      dataList.forEach( pool => {
        var buttons = [
          {
            label: texts.cells,
            icon: ViewQuiltIcon,
            href: '/admin/compute_cells/?pool=' + pool.name,
          },
          {
            label: texts.instances,
            icon: CloudQueueIcon,
            href: '/admin/instances/range/?pool=' + pool.name,
          },
          {
            onClick: e => showModifyDialog(pool.name),
            icon: SettingsIcon,
            label: texts.modify,
          },
          {
            onClick: e => showDeleteDialog(pool.name),
            icon: DeleteIcon,
            label: texts.delete,
          },
        ];

        const { name, cells, network, storage, enabled, failover } = pool;
        let statusLabel, statusIcon, failoverLabel;
        if (enabled){
          statusLabel = texts.enabled;
          statusIcon = (
            <Tooltip
              title={statusLabel}
              placement="top"
              >
              <CheckIcon className={classes.successText}/>
            </Tooltip>
          );
          const disableButton = {
            label: texts.disable,
            icon: BlockIcon,
          };
          buttons = [disableButton].concat(buttons);
        }else{
          statusLabel = texts.disabled;
          statusIcon = (
            <Tooltip
              title={statusLabel}
              placement="top"
              >
              <BlockIcon className={classes.warningText}/>
            </Tooltip>
          );
          const enableButton = {
            label: texts.enable,
            icon: CheckIcon,
          };
          buttons = [enableButton].concat(buttons);
        }

        if (failover){
          failoverLabel = texts.on;
        }else{
          failoverLabel = texts.off;
        }

        const operates = buttons.map((button, key) => (
          React.createElement(IconButton, {
            ...button,
            key: key,
          })
        ))
        var row = [name, cells, network? network: texts.noAddressPool,
          storage? storage: texts.localStorage, failoverLabel, statusIcon, operates];
        rows.push(row);
      });
      content = (
        <Table
          color="primary"
          headers={[texts.name, texts.cells, texts.network, texts.storage, texts.failover, texts.status, texts.operates]}
          rows={rows}/>
      );
    }

    return (
      <GridContainer>
        <GridItem xs={12}>
          <Breadcrumbs separator="›" aria-label="breadcrumb">
            <Typography color="textPrimary">{texts.computePools}</Typography>
          </Breadcrumbs>
        </GridItem>
        <GridItem xs={12}>
          <Box mt={3} mb={3}>
          <Divider/>
          </Box>
        </GridItem>
        <GridItem xs={12} sm={12} md={12}>
          <GridContainer>
            <GridItem xs={3} sm={3} md={3}>
              <Button size="sm" color="info" round onClick={showCreateDialog}><AddIcon />{texts.createButton}</Button>
            </GridItem>
          </GridContainer>
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
          <ModifyDialog
            lang={lang}
            open={modifyDialogVisible}
            pool={selected}
            onSuccess={onModifySuccess}
            onCancel={closeModifyDialog}
            />
        </GridItem>
        <GridItem>
          <DeleteDialog
            lang={lang}
            open={deleteDialogVisible}
            pool={selected}
            onSuccess={onDeleteSuccess}
            onCancel={closeDeleteDialog}
            />
        </GridItem>
      </GridContainer>
    );
}
