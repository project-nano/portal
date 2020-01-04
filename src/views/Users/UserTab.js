import React from "react";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import Container from '@material-ui/core/Container';
import Skeleton from '@material-ui/lab/Skeleton';
import CreateIcon from '@material-ui/icons/Create';
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
import CreateUserDialog from "views/Users/CreateUserDialog";
import ModifyUserDialog from "views/Users/ModifyUserDialog";
import DeleteUserDialog from "views/Users/DeleteUserDialog";
import { getLoggedSession, logoutSession, redirectToLogin } from 'utils.js';
import { queryAllUsers, writeLog } from "nano_api.js";
import tableStyles from "assets/jss/material-dashboard-react/components/tableStyle.js";

const styles = {
  ...tableStyles,
};

const useStyles = makeStyles(styles);

const i18n = {
  'en':{
    createButton: "Create New User",
    name: 'User Name',
    modify: 'Modify',
    delete: 'Delete',
    operates: 'Operates',
    noResource: 'No User Available',
  },
  'cn':{
    createButton: "创建新用户",
    name: '用户名',
    modify: '修改',
    delete: '删除',
    operates: '操作',
    noResource: '尚未创建用户',
  }
}

export default function UserTab(props){
    const classes = useStyles();
    const [ userList, setUserList ] = React.useState(null);

    //for dialog
    const [ createDialogVisible, setCreateDialogVisible ] = React.useState(false);
    const [ deleteDialogVisible, setDeleteDialogVisible ] = React.useState(false);
    const [ modifyDialogVisible, setModifyDialogVisible ] = React.useState(false);
    const [ currentUser, setCurrentUser ] = React.useState('');

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

    const reloadAllUsers = React.useCallback(() => {
      const onLoadFail = (err) =>{
        showErrorMessage(err);
        logoutSession();
      }
      queryAllUsers(setUserList, onLoadFail);
    }, [ showErrorMessage]);

    const showNotifyMessage = (msg) => {
      const notifyDuration = 3000;
      setNotifyColor('info');
      setNotifyMessage(msg);
      writeLog(msg);
      setTimeout(closeNotify, notifyDuration);
    };

    //detail
    const showModifyDialog = username =>{
      setModifyDialogVisible(true);
      setCurrentUser(username);
    }

    const closeModifyDialog = () =>{
      setModifyDialogVisible(false);
    }

    const onModifySuccess = username =>{
      closeModifyDialog();
      showNotifyMessage('user '+ username + ' modified');
      reloadAllUsers();
    };

    //delete
    const showDeleteDialog = username =>{
      setDeleteDialogVisible(true);
      setCurrentUser(username);
    }

    const closeDeleteDialog = () =>{
      setDeleteDialogVisible(false);
    }

    const onDeleteSuccess = username =>{
      closeDeleteDialog();
      showNotifyMessage('user '+ username + ' deleted');
      reloadAllUsers();
    };

    //create
    const showCreateDialog = () =>{
      setCreateDialogVisible(true);
    };

    const closeCreateDialog = () =>{
      setCreateDialogVisible(false);
    }

    const onCreateSuccess = username =>{
      closeCreateDialog();
      showNotifyMessage('user '+ username + ' created');
      reloadAllUsers();
    };

    React.useEffect(() =>{
      reloadAllUsers();
    }, [reloadAllUsers]);


    //reder begin
    var session = getLoggedSession();
    if (null === session){
      return redirectToLogin();
    }

    const { lang } = props;
    const texts = i18n[lang];
    let content;
    if (null === userList){
      content = <Skeleton variant="rect" style={{height: '10rem'}}/>;
    }else if (0 === userList.length){
      content = <Info>{texts.noResource}</Info>;
    }else{
      content = (
        <OperableTable
          color="primary"
          headers={[texts.name, texts.operates]}
          rows={
            userList.map((username, key) => {
              const name = username;
              var operators = [<TooltipButton key='modify' title={texts.modify} icon={EditIcon} onClick={() => showModifyDialog(name)}/>]
              if (name !== session.user){
                operators.push(<TooltipButton key='delete' title={texts.delete} icon={DeleteIcon} onClick={() => showDeleteDialog(name)}/>)
              }
              return (
                <TableRow className={classes.tableBodyRow} key={key}>
                  <TableCell className={classes.tableCell}>
                    {username}
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
      <Button size="sm" color="info" round onClick={showCreateDialog}><CreateIcon />{texts.createButton}</Button>,
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
          <CreateUserDialog
            lang={lang}
            open={createDialogVisible}
            onSuccess={onCreateSuccess}
            onCancel={closeCreateDialog}
            />
        </GridItem>
        <GridItem>
          <ModifyUserDialog
            lang={lang}
            name={currentUser}
            open={modifyDialogVisible}
            onSuccess={onModifySuccess}
            onCancel={closeModifyDialog}
            />
        </GridItem>
        <GridItem>
          <DeleteUserDialog
            lang={lang}
            name={currentUser}
            open={deleteDialogVisible}
            onSuccess={onDeleteSuccess}
            onCancel={closeDeleteDialog}
            />
        </GridItem>
      </GridContainer>
    );
}
