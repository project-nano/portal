import React from "react";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import Container from '@material-ui/core/Container';
import Skeleton from '@material-ui/lab/Skeleton';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import Divider from '@material-ui/core/Divider';
import Box from '@material-ui/core/Box';
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";

// dashboard components
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Info from "components/Typography/Info.js";
import Snackbar from "components/Snackbar/Snackbar.js";
import Button from "components/CustomButtons/Button.js";
import TooltipButton from "components/CustomButtons/TooltipButton.js";
import OperableTable from "components/Table/OperableTable.js";
import AddRoleDialog from "views/Users/AddRoleDialog";
import ModifyRoleDialog from "views/Users/ModifyRoleDialog";
import RemoveRoleDialog from "views/Users/RemoveRoleDialog";
import { getLoggedSession, logoutSession, redirectToLogin } from 'utils.js';
import { queryAllRoles, writeLog } from "nano_api.js";
import tableStyles from "assets/jss/material-dashboard-react/components/tableStyle.js";

const styles = {
  ...tableStyles,
};

const useStyles = makeStyles(styles);

const i18n = {
  'en':{
    createButton: "Add New Role",
    name: 'Role Name',
    modify: 'Modify',
    delete: 'Remove',
    operates: 'Operates',
    noResource: 'No Role Available',
  },
  'cn':{
    createButton: "增加新角色",
    name: '角色名',
    modify: '修改',
    delete: '删除',
    operates: '操作',
    noResource: '尚未创建角色',
  }
}

export default function RoleTab(props){
    const classes = useStyles();
    const [ roleList, setRoleList ] = React.useState(null);

    //for dialog
    const [ addDialogVisible, setAddDialogVisible ] = React.useState(false);
    const [ removeDialogVisible, setRemoveDialogVisible ] = React.useState(false);
    const [ modifyDialogVisible, setModifyDialogVisible ] = React.useState(false);
    const [ currentRole, setCurrentRole ] = React.useState('');

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

    const reloadAllRoles = React.useCallback(() => {
      const onLoadFail = (err) =>{
        showErrorMessage(err);
        logoutSession();
      }
      queryAllRoles(setRoleList, onLoadFail);
    }, [ showErrorMessage]);

    const showNotifyMessage = (msg) => {
      const notifyDuration = 3000;
      setNotifyColor('info');
      setNotifyMessage(msg);
      writeLog(msg);
      setTimeout(closeNotify, notifyDuration);
    };

    //detail
    const showModifyDialog = rolename =>{
      setModifyDialogVisible(true);
      setCurrentRole(rolename);
    }

    const closeModifyDialog = () =>{
      setModifyDialogVisible(false);
    }

    const onModifySuccess = rolename =>{
      closeModifyDialog();
      showNotifyMessage('role '+ rolename + ' modified');
      reloadAllRoles();
    };

    //delete
    const showRemoveDialog = rolename =>{
      setRemoveDialogVisible(true);
      setCurrentRole(rolename);
    }

    const closeRemoveDialog = () =>{
      setRemoveDialogVisible(false);
    }

    const onRemoveSuccess = rolename =>{
      closeRemoveDialog();
      showNotifyMessage('role '+ rolename + ' removed');
      reloadAllRoles();
    };

    //create
    const showAddDialog = () =>{
      setAddDialogVisible(true);
    };

    const closeAddDialog = () =>{
      setAddDialogVisible(false);
    }

    const onAddSuccess = rolename =>{
      closeAddDialog();
      showNotifyMessage('role '+ rolename + ' added');
      reloadAllRoles();
    };

    React.useEffect(() =>{
      reloadAllRoles();
    }, [reloadAllRoles]);


    //reder begin
    var session = getLoggedSession();
    if (null === session){
      return redirectToLogin();
    }

    const { lang } = props;
    const texts = i18n[lang];
    let content;
    if (null === roleList){
      content = <Skeleton variant="rect" style={{height: '10rem'}}/>;
    }else if (0 === roleList.length){
      content = <Info>{texts.noResource}</Info>;
    }else{
      content = (
        <OperableTable
          color="primary"
          headers={[texts.name, texts.operates]}
          rows={
            roleList.map((rolename, key) => {
              const name = rolename;
              var operators = [
                <TooltipButton key='modify' title={texts.modify} icon={EditIcon} onClick={() => showModifyDialog(name)}/>,
                <TooltipButton key='remove' title={texts.delete} icon={DeleteIcon} onClick={() => showRemoveDialog(name)}/>,
              ];

              return (
                <TableRow className={classes.tableBodyRow} key={key}>
                  <TableCell className={classes.tableCell}>
                    {rolename}
                  </TableCell>
                  <TableCell className={classes.tableCell}>
                    {operators}
                  </TableCell>
                </TableRow>
              )
            })}
          />
      );
    }

    const buttons = [
      <Button size="sm" color="info" round onClick={showAddDialog}><AddIcon />{texts.createButton}</Button>,
    ];

    return (

      <GridContainer>
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
          <Box mt={3} mb={3}>
            <Divider/>
          </Box>
        </GridItem>
        <GridItem xs={12}>
          <Container maxWidth='sm'>
            {content}
          </Container>
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
          <AddRoleDialog
            lang={lang}
            open={addDialogVisible}
            onSuccess={onAddSuccess}
            onCancel={closeAddDialog}
            />
        </GridItem>
        <GridItem>
          <ModifyRoleDialog
            lang={lang}
            name={currentRole}
            open={modifyDialogVisible}
            onSuccess={onModifySuccess}
            onCancel={closeModifyDialog}
            />
        </GridItem>
        <GridItem>
          <RemoveRoleDialog
            lang={lang}
            name={currentRole}
            open={removeDialogVisible}
            onSuccess={onRemoveSuccess}
            onCancel={closeRemoveDialog}
            />
        </GridItem>
      </GridContainer>
    );
}
