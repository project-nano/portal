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
import CellRow from "views/ComputeCells/CellRow.js";
import RemoveDialog from "views/ComputeCells/RemoveDialog.js";
import AddDialog from "views/ComputeCells/AddDialog.js";
import DetailDialog from "views/ComputeCells/DetailDialog.js";
import MigrateDialog from "views/ComputeCells/MigrateDialog";
import { getLoggedSession, logoutSession, redirectToLogin } from 'utils.js';
import { queryComputeCellsInPool, writeLog } from "nano_api.js";
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
    addButton: "Add Compute Cell",
    tableTitle: "Compute Cells",
    name: "Name",
    address: "Address",
    alive: "Alive",
    status: "Status",
    operates: "Operates",
    noResource: "No compute cell available",
    computePools: "Compute Pools",
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
  }
}

export default function ComputeCells(props){
    const classes = useStyles();
    const [ cellList, setCellList ] = React.useState(null);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const poolName = queryParams.get("pool");

    //for dialog
    const [ addDialogVisible, setAddDialogVisible ] = React.useState(false);
    const [ detailDialogVisible, setDetailDialogVisible ] = React.useState(false);
    const [ removeDialogVisible, setRemoveDialogVisible ] = React.useState(false);
    const [ migrateDialogVisible, setMigrateDialogVisible ] = React.useState(false);
    const [ currentCell, setCurrentCell ] = React.useState('');

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

    const reloadAllComputeCells = React.useCallback(() => {
      const onLoadFail = (err) =>{
        showErrorMessage(err);
        logoutSession();
      }
      queryComputeCellsInPool(poolName, setCellList, onLoadFail);
    }, [poolName, showErrorMessage]);

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
      setCurrentCell(cellName);
    }

    const closeDetailDialog = () =>{
      setDetailDialogVisible(false);
    }

    //delete
    const showRemoveDialog = (cellName) =>{
      setRemoveDialogVisible(true);
      setCurrentCell(cellName);
    }

    const closeRemoveDialog = () =>{
      setRemoveDialogVisible(false);
    }

    const onRemoveSuccess = (cellName) =>{
      closeRemoveDialog();
      showNotifyMessage('cell '+ cellName + ' removed from ' + poolName);
      reloadAllComputeCells();
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
      reloadAllComputeCells();
    };

    const onStatusChange = () =>{
      reloadAllComputeCells();
    }

    //migrate instance
    const showMigrateDialog = cellName =>{
      setMigrateDialogVisible(true);
      setCurrentCell(cellName);
    }

    const closeMigrateDialog = () =>{
      setMigrateDialogVisible(false);
    }

    const onMigrateSuccess = () =>{
      closeMigrateDialog();
      reloadAllComputeCells();
    };

    React.useEffect(() =>{
      var mounted = true
      reloadAllComputeCells();
      const updateInterval = 5 * 1000;
      var timerID = setInterval(()=>{
        if (mounted){
          reloadAllComputeCells();
        }
      }, updateInterval);
      return () =>{
        mounted = false;
        clearInterval(timerID);
      }
    }, [reloadAllComputeCells]);

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
    if (null === cellList){
      content = <Skeleton variant="rect" style={{height: '10rem'}}/>;
    }else if (0 === cellList.length){
      content = <Info>{texts.noResource}</Info>;
    }else{
      content = (
        <OperableTable
          color="primary"
          headers={[texts.name, texts.address, texts.alive, texts.status, texts.operates]}
          rows={
            cellList.map(cell =>(
              <CellRow
                key={cell.name}
                poolName={poolName}
                cell={cell}
                lang={lang}
                onNotify={showNotifyMessage}
                onError={showErrorMessage}
                onDetail={showDetailDialog}
                onRemove={showRemoveDialog}
                onMigrate={showMigrateDialog}
                onStatusChange={onStatusChange}
                />
            ))}
          />
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
        <GridItem xs={12} sm={12} md={12}>
          <GridContainer>
            <GridItem xs={3} sm={3} md={3}>
              <Button size="sm" color="info" round onClick={showAddDialog}><AddIcon />{texts.addButton}</Button>
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
          <AddDialog
            lang={lang}
            open={addDialogVisible}
            pool={poolName}
            onSuccess={onAddSuccess}
            onCancel={closeAddDialog}
            />
        </GridItem>
        <GridItem>
          <DetailDialog
            lang={lang}
            open={detailDialogVisible}
            pool={poolName}
            cell={currentCell}
            onCancel={closeDetailDialog}
            />
        </GridItem>
        <GridItem>
          <RemoveDialog
            lang={lang}
            open={removeDialogVisible}
            pool={poolName}
            cell={currentCell}
            onSuccess={onRemoveSuccess}
            onCancel={closeRemoveDialog}
            />
        </GridItem>
        <GridItem>
          <MigrateDialog
            lang={lang}
            open={migrateDialogVisible}
            sourcePool={poolName}
            sourceCell={currentCell}
            onSuccess={onMigrateSuccess}
            onCancel={closeMigrateDialog}
            />
        </GridItem>
      </GridContainer>
    );
}
