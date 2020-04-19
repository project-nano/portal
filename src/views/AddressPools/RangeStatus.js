import React from "react";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
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
import Table from "components/Table/ObjectTable.js";
import IconButton from "components/CustomButtons/IconButton.js";
import { getAddressRangeStatus } from "nano_api.js";

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
    back: 'Back',
    internal: 'Address Range Status',
    allocated: 'Allocated Address',
    startAddress: 'Start Address',
    endAddress: 'End Address',
    netmask: 'Netmask',
    noAllocated: 'No address allocated',
    allocatedAddress: 'Allocated Address',
    instance: 'Instance',
    detail: 'Detail',
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
    detail: '详情',
  }
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

export default function RangeStatus(props){
    const poolName = props.match.params.pool;
    const rangeType = props.match.params.type;
    const startAddress = props.match.params.start;
    const { lang } = props;
    const texts = i18n[lang];
    const classes = useStyles();
    const [ mounted, setMounted ] = React.useState(false);
    const [ status, setStatus ] = React.useState(null);
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

    const reloadRangeStatus = React.useCallback(() => {
      if (!mounted){
        return;
      }
      const onLoadFail = (err) =>{
        if (!mounted){
          return;
        }
        showErrorMessage(err);
      }
      getAddressRangeStatus(poolName, rangeType, startAddress, setStatus, onLoadFail);
    }, [showErrorMessage, poolName, rangeType, startAddress, mounted]);

    // const showNotifyMessage = (msg) => {
    //   const notifyDuration = 3000;
    //   setNotifyColor('info');
    //   setNotifyMessage(msg);
    //   setTimeout(closeNotify, notifyDuration);
    // };

    React.useEffect(() =>{
      setMounted(true);
      reloadRangeStatus();
      return () =>{
        setMounted(false);
      }
    }, [reloadRangeStatus]);

    //begin rendering
    let content;
    if (null === status){
      content = <Skeleton variant="rect" style={{height: '10rem'}}/>;
    }else{
      const internalContent = (
        <Table
          color="primary"
          headers={[texts.startAddress, texts.endAddress, texts.netmask]}
          rows={[[startAddress, status.end, status.netmask]]}
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
        allocatedContent = <Box display="flex" justifyContent="center"><Info>{texts.noAllocated}</Info></Box>;
      }else{
        var rows = [];
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
