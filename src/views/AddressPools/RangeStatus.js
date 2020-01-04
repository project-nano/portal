import React from "react";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import { Link } from "react-router-dom";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import IconButton from "@material-ui/core/IconButton";
import Skeleton from '@material-ui/lab/Skeleton';
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
import { getLoggedSession, logoutSession, redirectToLogin } from 'utils.js';
import { getAddressRangeStatus } from "nano_api.js";

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
    internal: 'Address Range Status',
    allocated: 'Allocated Address',
    startAddress: 'Start Address',
    endAddress: 'End Address',
    netmask: 'Netmask',
    noAllocated: 'No address allocated',
    allocatedAddress: 'Allocated Address',
    instance: 'Instance',
  },
  'cn':{
    back: '返回',
    internal: '地址段状态',
    allocated: '已分配地址',
    startAddress: '开始地址',
    endAddress: '结束地址',
    netmask: '子网掩码',
    noAllocated: '未分配地址',
    allocatedAddress: '已分配地址',
    instance: '云主机实例',
  }
}

export default function RangeStatus(props){
    const poolName = props.match.params.pool;
    const rangeType = props.match.params.type;
    const startAddress = props.match.params.start;
    const classes = useStyles();
    const [ status, setStatus ] = React.useState(null);

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

    const reloadRangeStatus = React.useCallback(() => {
      const onLoadFail = (err) =>{
        showErrorMessage(err);
        logoutSession();
      }
      getAddressRangeStatus(poolName, rangeType, startAddress, setStatus, onLoadFail);
    }, [showErrorMessage, poolName, rangeType, startAddress]);

    // const showNotifyMessage = (msg) => {
    //   const notifyDuration = 3000;
    //   setNotifyColor('info');
    //   setNotifyMessage(msg);
    //   setTimeout(closeNotify, notifyDuration);
    // };

    React.useEffect(() =>{
      reloadRangeStatus();
    }, [reloadRangeStatus]);


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
      const internalContent = (
        <OperableTable
          color="primary"
          headers={[texts.startAddress, texts.endAddress, texts.netmask]}
          rows={[
            <TableRow className={classes.tableBodyRow} key='current'>
              <TableCell className={classes.tableCell}>
                {startAddress}
              </TableCell>
              <TableCell className={classes.tableCell}>
                {status.end}
              </TableCell>
              <TableCell className={classes.tableCell}>
                {status.netmask}
              </TableCell>
            </TableRow>
          ]}
          />
      )
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
      </GridContainer>
    );
}
