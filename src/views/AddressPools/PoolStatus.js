import React from "react";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import { Link } from "react-router-dom";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import IconButton from "@material-ui/core/IconButton";
import Skeleton from '@material-ui/lab/Skeleton';
import AddIcon from '@material-ui/icons/Add';
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
import OperableTable from "components/Table/OperableTable.js";
import RangeRow from "views/AddressPools/RangeRow";
import RemoveRangeDialog from "views/AddressPools/RemoveRangeDialog.js";
import AddRangeDialog from "views/AddressPools/AddRangeDialog.js";
import { getLoggedSession, logoutSession, redirectToLogin } from 'utils.js';
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
  }
}

export default function PoolStatus(props){
    const poolName = props.match.params.pool;
    const classes = useStyles();
    const [ status, setStatus ] = React.useState(null);
    //for dialog
    const [ addDialogVisible, setAddDialogVisible ] = React.useState(false);
    const [ removeDialogVisible, setRemoveDialogVisible ] = React.useState(false);
    const [ current, setCurrent ] = React.useState({
      pool: '',
      type: '',
      start: '',
    });

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

    const reloadPoolStatus = React.useCallback(() => {
      const onLoadFail = (err) =>{
        showErrorMessage(err);
        logoutSession();
      }
      getNetworkPool(poolName, setStatus, onLoadFail);
    }, [showErrorMessage, poolName]);

    const showNotifyMessage = (msg) => {
      const notifyDuration = 3000;
      setNotifyColor('info');
      setNotifyMessage(msg);
      writeLog(msg);
      setTimeout(closeNotify, notifyDuration);
    };

    //remove
    const showRemoveDialog = (poolName, rangeType, startAddress) =>{
      setRemoveDialogVisible(true);
      setCurrent({
        pool: poolName,
        type: rangeType,
        start: startAddress,
      });
    }

    const closeRemoveDialog = () =>{
      setRemoveDialogVisible(false);
    }

    const onRemoveSuccess = (poolName, rangeType, startAddress) =>{
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

    const onAddSuccess = (poolName, rangeType, startAddress) =>{
      closeAddDialog();
      showNotifyMessage('range "' + startAddress + '" of ' + rangeType + ' address added');
      reloadPoolStatus();
    };

    React.useEffect(() =>{
      reloadPoolStatus();
    }, [reloadPoolStatus]);


    //reder begin
    var session = getLoggedSession();
    if (null === session){
      return redirectToLogin();
    }
    const { lang } = props;
    const texts = i18n[lang];
    let content;
    if (null === status){
      content = <Skeleton variant="rect" style={{height: '10rem'}}/>;
    }else{
      let internalContent;
      if (!status.ranges || 0 === status.ranges.length){
        internalContent = <Info>{texts.noInternalRange}</Info>;
      }else{
        internalContent = (
          <OperableTable
            color="primary"
            headers={[texts.startAddress, texts.endAddress, texts.netmask, texts.operates]}
            rows={
              status.ranges.map((range, key) =>(
                <RangeRow
                  key={key}
                  poolName={poolName}
                  lang={lang}
                  rangeType='internal'
                  range={range}
                  onRemove={showRemoveDialog}
                  />
              ))}
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
        allocatedContent = <Info>{texts.noAllocated}</Info>;
      }else{
        allocatedContent = (
          <OperableTable
            color="primary"
            headers={[texts.allocatedAddress, texts.instance, '']}
            rows={
              status.allocated.map((allocated, key) =>(
                <TableRow className={classes.tableBodyRow} key={key}>
                  <TableCell className={classes.tableCell}>
                    {allocated.address}
                  </TableCell>
                  <TableCell className={classes.tableCell}>
                    {allocated.instance}
                  </TableCell>
                  <TableCell className={classes.tableCell}>
                    <Link to={'/admin/instances/details/' + allocated.instance}>
                      <IconButton color="inherit">
                        <VisibilityIcon/>
                      </IconButton>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
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
            poolName={current.pool}
            rangeType={current.type}
            startAddress={current.start}
            onSuccess={onRemoveSuccess}
            onCancel={closeRemoveDialog}
            />
        </GridItem>
      </GridContainer>
    );
}
