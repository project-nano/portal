import React from "react";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import Skeleton from '@material-ui/lab/Skeleton';
import AddIcon from '@material-ui/icons/Add';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Box from '@material-ui/core/Box';

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
import PoolRow from "views/ComputePools/PoolRow.js";
import DeleteDialog from "views/ComputePools/DeleteDialog.js";
import CreateDialog from "views/ComputePools/CreateDialog.js";
import ModifyDialog from "views/ComputePools/ModifyDialog.js";
import { getLoggedSession, logoutSession, redirectToLogin } from 'utils.js';
import { getAllComputePools, writeLog } from "nano_api.js";

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
  }
}

export default function ComputePools(props){
    const classes = useStyles();
    const [ poolList, setPoolList ] = React.useState(null);
    //for dialog
    const [ dialogSwitch, setDialogSwitch] = React.useState({
      create: false,
      modify: false,
      delete: false,
      current: '',
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

    const reloadAllComputePools = React.useCallback(() => {
      const onLoadFail = (err) =>{
        showErrorMessage(err);
        logoutSession();
      }
      getAllComputePools(setPoolList, onLoadFail);
    }, [showErrorMessage]);



    const showNotifyMessage = (msg) => {
      const notifyDuration = 3000;
      setNotifyColor('info');
      setNotifyMessage(msg);
      writeLog(msg);
      setTimeout(closeNotify, notifyDuration);
    };

    //modify
    const showModifyDialog = (poolName) =>{
      setDialogSwitch( previous =>({
        ...previous,
        modify: true,
        current: poolName,
      }));
    }

    const closeModifyDialog = () =>{
      setDialogSwitch( previous =>({
        ...previous,
        modify: false,
      }));
    }

    const onModifySuccess = (poolName) =>{
      closeModifyDialog();
      showNotifyMessage('pool ' + poolName + ' modified');
      reloadAllComputePools();
    };

    //delete
    const showDeleteDialog = (poolName) =>{
      setDialogSwitch( previous =>({
        ...previous,
        delete: true,
        current: poolName,
      }));
    }

    const closeDeleteDialog = () =>{
      setDialogSwitch( previous =>({
        ...previous,
        delete: false,
      }));
    }

    const onDeleteSuccess = (poolName) =>{
      closeDeleteDialog();
      showNotifyMessage('pool ' + poolName + ' deleted');
      reloadAllComputePools();
    };

    //create
    const showCreateDialog = () =>{
      setDialogSwitch( previous =>({
        ...previous,
        create: true,
      }));
    };

    const closeCreateDialog = () =>{
      setDialogSwitch( previous =>({
        ...previous,
        create: false,
      }));
    }

    const onCreateSuccess = (poolName) =>{
      closeCreateDialog();
      showNotifyMessage('pool ' + poolName + ' created');
      reloadAllComputePools();
    };

    React.useEffect(() =>{
      reloadAllComputePools();
    }, [reloadAllComputePools]);


    //reder begin
    var session = getLoggedSession();
    if (null === session){
      return redirectToLogin();
    }
    const { lang } = props;
    const texts = i18n[lang];
    let content;
    if (null === poolList){
      content = <Skeleton variant="rect" style={{height: '10rem'}}/>;
    }else if (0 === poolList.length){
      content = <Info>{texts.noPools}</Info>;
    }else{
      content = (
        <OperableTable
          color="primary"
          headers={[texts.name, texts.cells, texts.network, texts.storage, texts.failover, texts.status, texts.operates]}
          rows={
            poolList.map(pool =>(
              <PoolRow
                key={pool.name}
                pool={pool}
                lang={lang}
                onModify={showModifyDialog}
                onDelete={showDeleteDialog}
                />
            ))}
          />
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
            open={dialogSwitch.create}
            onSuccess={onCreateSuccess}
            onCancel={closeCreateDialog}
            />
        </GridItem>
        <GridItem>
          <ModifyDialog
            lang={lang}
            open={dialogSwitch.modify}
            pool={dialogSwitch.current}
            onSuccess={onModifySuccess}
            onCancel={closeModifyDialog}
            />
        </GridItem>
        <GridItem>
          <DeleteDialog
            lang={lang}
            open={dialogSwitch.delete}
            pool={dialogSwitch.current}
            onSuccess={onDeleteSuccess}
            onCancel={closeDeleteDialog}
            />
        </GridItem>
      </GridContainer>
    );
}
