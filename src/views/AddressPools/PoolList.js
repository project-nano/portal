import React from "react";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import Skeleton from '@material-ui/lab/Skeleton';
import AddIcon from '@material-ui/icons/Add';
import Divider from '@material-ui/core/Divider';
import Box from '@material-ui/core/Box';
import DeleteIcon from '@material-ui/icons/Delete';
import BuildIcon from '@material-ui/icons/Build';
import ListIcon from '@material-ui/icons/List';

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
import DeleteDialog from "views/AddressPools/DeleteDialog.js";
import CreateDialog from "views/AddressPools/CreateDialog.js";
import ModifyDialog from "views/AddressPools/ModifyDialog.js";
import { getAllNetworkPools, writeLog } from "nano_api.js";

const styles = {
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
    createButton: "Create Address Pool",
    tableTitle: "Address Pools",
    name: "Name",
    gateway: "Gateway",
    address: "Total Address",
    allocated: "Allocated Address",
    provider: 'Provider',
    operates: "Operates",
    noResource: "No address pool available",
    modify: 'Modify',
    delete: 'Delete',
    detail: 'Detail',
  },
  'cn':{
    createButton: "创建地址池",
    tableTitle: "地址资源池",
    name: "名称",
    gateway: "网关",
    address: "地址数量",
    allocated: "已分配地址",
    provider: '分配模式',
    operates: "操作",
    noResource: "没有地址池",
    modify: '修改',
    delete: '删除',
    detail: '详情',
  }
}

function dataToNodes(data, buttons){
  const operates = buttons.map((button, key) => (
    <IconButton label={button.label} icon={button.icon} onClick={button.onClick} href={button.href} key={key}/>
  ))
  const { name, gateway, provider, addresses, allocated } = data;
  var providerName = 'DHCP';
  if ('cloudinit' === provider){
    providerName = 'Cloud-Init';
  }
  return [ name, providerName, gateway, addresses.toString(), allocated.toString(), operates];
}

export default function PoolList(props){
    const classes = useStyles();
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
      getAllNetworkPools(setDataList, onLoadFail);
    }, [showErrorMessage, mounted]);

    const showNotifyMessage = (msg) => {
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
    const showModifyDialog = poolName =>{
      setModifyDialogVisible(true);
      setSelected(poolName);
    }

    const closeModifyDialog = () =>{
      setModifyDialogVisible(false);
    }

    const onModifySuccess = (poolName) =>{
      closeModifyDialog();
      showNotifyMessage('pool ' + poolName + ' modified');
      reloadAllData();
    };

    //delete
    const showDeleteDialog = (poolName) =>{
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
    const { lang } = props;
    const texts = i18n[lang];
    let content;
    if (null === dataList){
      content = <Skeleton variant="rect" style={{height: '10rem'}}/>;
    }else if (0 === dataList.length){
      content = <Box display="flex" justifyContent="center"><Info>{texts.noResource}</Info></Box>;
    }else{
      var rows = [];
      dataList.forEach( data => {
        const buttons = [
          {
            onClick: e => showModifyDialog(data.name),
            icon: BuildIcon,
            label: texts.modify,
          },
          {
            icon: ListIcon,
            label: texts.detail,
            href: '/admin/address_pools/' + data.name,
          },
          {
            onClick: e => showDeleteDialog(data.name),
            icon: DeleteIcon,
            label: texts.delete,
          },
        ];
        rows.push(dataToNodes(data, buttons));
      });
      content = (
        <Table
          color="primary"
          headers={[texts.name, texts.provider, texts.gateway, texts.address, texts.allocated, texts.operates]}
          rows={rows}/>
      );
    }

    return (
      <GridContainer>
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
