import React from "react";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import Skeleton from '@material-ui/lab/Skeleton';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import ListIcon from '@material-ui/icons/List';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import Divider from '@material-ui/core/Divider';
import Box from '@material-ui/core/Box';
import VisibilityIcon from '@material-ui/icons/Visibility';

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
import RemoveRangeDialog from "views/AddressPools/RemoveRangeDialog.js";
import AddRangeDialog from "views/AddressPools/AddRangeDialog.js";
import { getNetworkPool, writeLog } from "nano_api.js";

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
    back: 'Back',
    createButton: "Add Address Range",
    tableTitle: "Address Pool Status",
    internal: 'Internal Address Range',
    allocated: 'Allocated Address',
    startAddress: 'Start Address',
    endAddress: 'End Address',
    netmask: 'Netmask',
    noInternalRange: 'No internal range available',
    noAllocated: 'No address allocated',
    operates: "Operates",
    allocatedAddress: 'Allocated Address',
    instance: 'Instance',
    detail: 'Detail',
    remove: 'Remove',
  },
  'cn':{
    back: '返回',
    createButton: "添加地址段",
    tableTitle: "地址资源池状态",
    internal: '内部地址段',
    allocated: '已分配地址',
    startAddress: '开始地址',
    endAddress: '结束地址',
    netmask: '子网掩码',
    noInternalRange: '没有内部地址段',
    noAllocated: '未分配地址',
    operates: "操作",
    allocatedAddress: '已分配地址',
    instance: '云主机实例',
    detail: '详情',
    remove: '删除',
  }
}

function dataToNodes(data, buttons){
  // const operates = buttons.map((button, key) => (
  //   <IconButton label={button.label} icon={button.icon} onClick={button.onClick} href={button.href} key={key}/>
  // ))
  const operates = buttons.map((button, key) => (
    React.createElement(IconButton, {
      ...button,
      key: key,
    })
  ))
  const { start, end, netmask } = data;
  return [ start, end, netmask, operates];
}

function dataToAllocated(data, buttons){
  const { address, instance } = data;
  const operates = buttons.map((button, key) => (
    React.createElement(IconButton, {
      ...button,
      key: key,
    })
  ))
  return [address, instance].concat(operates);
}

export default function PoolStatus(props){
    const { lang } = props;
    const texts = i18n[lang];
    const poolName = props.match.params.pool;
    const classes = useStyles();
    const [ mounted, setMounted ] = React.useState(false);
    const [ status, setStatus ] = React.useState(null);
    //for dialog
    const [ addDialogVisible, setAddDialogVisible ] = React.useState(false);
    const [ removeDialogVisible, setRemoveDialogVisible ] = React.useState(false);
    const [ current, setCurrent ] = React.useState({
      type: '',
      start: '',
    });

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

    const reloadPoolStatus = React.useCallback(() => {
      if (!mounted){
        return;
      }
      const onLoadFail = (err) =>{
        if (!mounted){
          return;
        }
        showErrorMessage(err);
      }
      getNetworkPool(poolName, setStatus, onLoadFail);
    }, [showErrorMessage, poolName, mounted]);

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

    //remove
    const showRemoveDialog = (rangeType, startAddress) =>{
      setRemoveDialogVisible(true);
      setCurrent({
        type: rangeType,
        start: startAddress,
      });
    }

    const closeRemoveDialog = () =>{
      setRemoveDialogVisible(false);
    }

    const onRemoveSuccess = (rangeType, startAddress) =>{
      closeRemoveDialog();
      showNotifyMessage('range "' + startAddress + '" of ' + rangeType + ' address removed');
      reloadPoolStatus();
    };

    //add
    const showAddDialog = () =>{
      setAddDialogVisible(true);
    };

    const closeAddDialog = () =>{
      setAddDialogVisible(false);
    }

    const onAddSuccess = (rangeType, startAddress) =>{
      closeAddDialog();
      showNotifyMessage('range "' + startAddress + '" of ' + rangeType + ' address added');
      reloadPoolStatus();
    };

    React.useEffect(() =>{
      setMounted(true);
      reloadPoolStatus();
      return () =>{
        setMounted(false);
      }
    }, [reloadPoolStatus]);


    //begin rendering
    let content;
    if (null === status){
      content = <Skeleton variant="rect" style={{height: '10rem'}}/>;
    }else{
      let internalContent;
      if (!status.ranges || 0 === status.ranges.length){
        internalContent = <Box display="flex" justifyContent="center"><Info>{texts.noInternalRange}</Info></Box>;
      }else{
        var rows = [];
        status.ranges.forEach( data => {
          const buttons = [
            {
              icon: ListIcon,
              label: texts.detail,
              href: '/admin/address_pools/' + poolName + "/internal/ranges/" + data.start,
            },
            {
              onClick: e => showRemoveDialog("internal", data.start),
              icon: DeleteIcon,
              label: texts.remove,
            },
          ];
          rows.push(dataToNodes(data, buttons));
        });
        internalContent = (
          <Table
            color="primary"
            headers={[texts.startAddress, texts.endAddress, texts.netmask, texts.operates]}
            rows={rows}
            />
        )
      }
      const internalRanges = (
        <Card>
          <CardHeader color="primary">
            <h4 className={classes.cardTitleWhite}>{texts.internal}</h4>
          </CardHeader>
          <CardBody>
            {internalContent}
          </CardBody>
        </Card>
      )

      let allocatedContent;
      if (!status.allocated || 0 === status.allocated.length){
        allocatedContent = <Box display="flex" justifyContent="center"><Info>{texts.noAllocated}</Info></Box>;
      }else{
        rows = [];
        status.allocated.forEach( data => {
          const buttons = [
            {
              icon: VisibilityIcon,
              label: texts.detail,
              href: '/admin/instances/details/' + data.instance,
            },
          ];
          rows.push(dataToAllocated(data, buttons));
        });
        allocatedContent = (
          <Table
            color="primary"
            headers={[texts.allocatedAddress, texts.instance, '']}
            rows={rows}
            />
        )
      }
      const allocatedList = (
        <Card>
          <CardHeader color="primary">
            <h4 className={classes.cardTitleWhite}>{texts.allocated}</h4>
          </CardHeader>
          <CardBody>
            {allocatedContent}
          </CardBody>
        </Card>
      )

      content = (
        <GridContainer>
          <GridItem xs={12}>
            {internalRanges}
          </GridItem>
          <GridItem xs={12}>
            {allocatedList}
          </GridItem>
        </GridContainer>
      );
    }

    const buttons = [
      <Button key='back' size="sm" color="info" round onClick={() =>{
        props.history.goBack();
        }}>
        <NavigateBeforeIcon />{texts.back}
      </Button>,
      <Button key='add' size="sm" color="info" round onClick={showAddDialog}><AddIcon />{texts.createButton}</Button>,
    ];

    return (
      <GridContainer>
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
        <GridItem xs={12}>
          {content}
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
          <AddRangeDialog
            lang={lang}
            poolName={poolName}
            open={addDialogVisible}
            onSuccess={onAddSuccess}
            onCancel={closeAddDialog}
            />
        </GridItem>
        <GridItem>
          <RemoveRangeDialog
            lang={lang}
            open={removeDialogVisible}
            poolName={poolName}
            rangeType={current.type}
            startAddress={current.start}
            onSuccess={onRemoveSuccess}
            onCancel={closeRemoveDialog}
            />
        </GridItem>
      </GridContainer>
    );
}
