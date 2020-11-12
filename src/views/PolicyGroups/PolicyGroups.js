import React from "react";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import Skeleton from '@material-ui/lab/Skeleton';
import AddIcon from '@material-ui/icons/Add';
import Divider from '@material-ui/core/Divider';
import DeleteIcon from '@material-ui/icons/Delete';
import SettingsIcon from '@material-ui/icons/Settings';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
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
import Table from "components/Table/ObjectTable.js";
import IconButton from "components/CustomButtons/IconButton.js";
import DeleteDialog from "views/SystemTemplates/DeleteDialog.js";
import CreateDialog from "views/SystemTemplates/CreateDialog.js";
import ModifyDialog from "views/SystemTemplates/ModifyDialog.js";
import { getLoggedSession } from 'utils.js';
import { searchSecurityPolicyGroups, writeLog } from "nano_api.js";

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
    createButton: "Create New Group",
    tableTitle: "Security Policy Groups",
    name: "Name",
    os: "Operating System",
    createdTime: "Created Time",
    modifiedTime: "Last Modified",
    operates: "Operates",
    noResource: "No security policy available",
    detail: "Detail",
    delete: 'Delete',
    back: 'Back',
  },
  'cn':{
    createButton: "创建新策略组",
    tableTitle: "安全策略组",
    name: "名称",
    os: "操作系统",
    createdTime: "创建时间",
    modifiedTime: "最后修改",
    operates: "操作",
    noResource: "没有安全策略组",
    detail: "详情",
    delete: '删除',
    back: '返回',
  }
}

function dataToNodes(data, buttons){
  const operates = buttons.map((button, key) => (
    <IconButton label={button.label} icon={button.icon} onClick={button.onClick} key={key}/>
  ))
  const { id, name, operating_system, created_time, modified_time } = data;
  return [ id, name, operating_system, created_time, modified_time, operates];
}

export default function SystemTemplates(props){
    const { lang } = props;
    const texts = i18n[lang];
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
      var session = getLoggedSession();
      if (null === session){
        showErrorMessage('session expired');
        return;
      }

      searchSecurityPolicyGroups(session.user, session.group, false, false,
        setDataList, showErrorMessage);
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

    const onModifySuccess = templateID =>{
      closeModifyDialog();
      showNotifyMessage('template ' + templateID + ' modified');
      reloadAllData();
    };

    //delete
    const showDeleteDialog = templateID =>{
      setDeleteDialogVisible(true);
      setSelected(templateID);
    }

    const closeDeleteDialog = () =>{
      setDeleteDialogVisible(false);
    }

    const onDeleteSuccess = templateID =>{
      closeDeleteDialog();
      showNotifyMessage('template ' + templateID + ' deleted');
      reloadAllData();
    };

    //create
    const showCreateDialog = () =>{
      setCreateDialogVisible(true);
    };

    const closeCreateDialog = () =>{
      setCreateDialogVisible(false);
    }

    const onCreateSuccess = templateID =>{
      closeCreateDialog();
      showNotifyMessage('new template ' + templateID + ' created');
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
      content = <Box display="flex" justifyContent="center"><Info>{texts.noResource}</Info></Box>;
    }else{
      var rows = [];
      dataList.forEach( data => {
        const buttons = [
          {
            onClick: e => showModifyDialog(data.id),
            icon: SettingsIcon,
            label: texts.detail,
          },
          {
            onClick: e => showDeleteDialog(data.id),
            icon: DeleteIcon,
            label: texts.delete,
          },
        ];
        rows.push(dataToNodes(data, buttons));
      });
      content = (
        <Table
          color="primary"
          headers={["ID", texts.name, texts.os, texts.createdTime, texts.modifiedTime, texts.operates]}
          rows={rows}/>
      );

    }

    var buttonProps = [
      {
        href: '/admin/instances/',
        icon: NavigateBeforeIcon,
        label: texts.back,
      },
      {
        onClick: showCreateDialog,
        icon: AddIcon,
        label: texts.createButton,
      },
    ];

    return (
      <GridContainer>
        <GridItem xs={12}>
          <Box mt={3} mb={3}>
          <Divider/>
          </Box>
        </GridItem>
        <GridItem xs={12} sm={12} md={12}>
          <GridContainer>
            <GridItem xs={12} sm={6} md={4}>
              <Box display="flex">
              {
                buttonProps.map( p => {
                  if (p.href){
                    return (
                      <Box p={1}>
                        <Button size="sm" color="info" round href={p.href}>
                          {React.createElement(p.icon)}{p.label}
                        </Button>
                      </Box>
                    );
                  }else{
                    return (
                      <Box p={1}>
                        <Button size="sm" color="info" round onClick={p.onClick}>
                          {React.createElement(p.icon)}{p.label}
                        </Button>
                      </Box>
                    );
                  }
                })
              }
              </Box>
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
        <Snackbar
          place="tr"
          color={notifyColor}
          message={notifyMessage}
          open={"" !== notifyMessage}
          closeNotification={closeNotify}
          close
        />
        <CreateDialog
          lang={lang}
          open={createDialogVisible}
          onSuccess={onCreateSuccess}
          onCancel={closeCreateDialog}
          />
        <ModifyDialog
          lang={lang}
          open={modifyDialogVisible}
          templateID={selected}
          onSuccess={onModifySuccess}
          onCancel={closeModifyDialog}
          />
        <DeleteDialog
          lang={lang}
          open={deleteDialogVisible}
          templateID={selected}
          onSuccess={onDeleteSuccess}
          onCancel={closeDeleteDialog}
          />
      </GridContainer>
    );
}
