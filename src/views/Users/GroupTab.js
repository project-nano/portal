import React from "react";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import Container from '@material-ui/core/Container';
import Skeleton from '@material-ui/lab/Skeleton';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import GroupIcon from '@material-ui/icons/Group';
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
import IconButton from "components/CustomButtons/IconButton.js";
import OperableTable from "components/Table/OperableTable.js";
import AddGroupDialog from "views/Users/AddGroupDialog";
import ModifyGroupDialog from "views/Users/ModifyGroupDialog";
import RemoveGroupDialog from "views/Users/RemoveGroupDialog";
import { getLoggedSession, logoutSession, redirectToLogin } from 'utils.js';
import { queryAllGroups, writeLog } from "nano_api.js";
import tableStyles from "assets/jss/material-dashboard-react/components/tableStyle.js";

const styles = {
  ...tableStyles,
};

const useStyles = makeStyles(styles);

const i18n = {
  'en':{
    createButton: "Add New Group",
    name: 'Group Name',
    display: 'Display Name',
    modify: 'Modify',
    remove: 'Remove',
    member: 'Members',
    operates: 'Operates',
    noResource: 'No Group Available',
  },
  'cn':{
    createButton: "创建新用户组",
    name: '用户组名',
    display: '显示名称',
    modify: '修改',
    remove: '删除',
    member: '成员',
    operates: '操作',
    noResource: '尚未创建用户组',
  }
}

export default function GroupTab(props){
    const { lang } = props;
    const showMembers = props.setGroup;
    const classes = useStyles();
    const [ groupList, setGroupList ] = React.useState(null);

    //for dialog
    const [ addDialogVisible, setAddDialogVisible ] = React.useState(false);
    const [ removeDialogVisible, setRemoveDialogVisible ] = React.useState(false);
    const [ modifyDialogVisible, setModifyDialogVisible ] = React.useState(false);
    const [ currentGroup, setCurrentGroup ] = React.useState('');

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

    const reloadAllGroups = React.useCallback(() => {
      const onLoadFail = (err) =>{
        showErrorMessage(err);
        logoutSession();
      }
      queryAllGroups(setGroupList, onLoadFail);
    }, [ showErrorMessage]);

    const showNotifyMessage = (msg) => {
      const notifyDuration = 3000;
      setNotifyColor('info');
      setNotifyMessage(msg);
      writeLog(msg);
      setTimeout(closeNotify, notifyDuration);
    };

    //detail
    const showModifyDialog = groupName =>{
      setModifyDialogVisible(true);
      setCurrentGroup(groupName);
    }

    const closeModifyDialog = () =>{
      setModifyDialogVisible(false);
    }

    const onModifySuccess = groupName =>{
      closeModifyDialog();
      showNotifyMessage('group '+ groupName + ' modified');
      reloadAllGroups();
    };

    //remove
    const showRemoveDialog = groupName =>{
      setRemoveDialogVisible(true);
      setCurrentGroup(groupName);
    }

    const closeRemoveDialog = () =>{
      setRemoveDialogVisible(false);
    }

    const onRemoveSuccess = groupName =>{
      closeRemoveDialog();
      showNotifyMessage('group '+ groupName + ' removed');
      reloadAllGroups();
    };

    //create
    const showAddDialog = () =>{
      setAddDialogVisible(true);
    };

    const closeAddDialog = () =>{
      setAddDialogVisible(false);
    }

    const onAddSuccess = groupName =>{
      closeAddDialog();
      showNotifyMessage('new group '+ groupName + ' added');
      reloadAllGroups();
    };

    React.useEffect(() =>{
      reloadAllGroups();
    }, [reloadAllGroups]);


    //reder begin
    var session = getLoggedSession();
    if (null === session){
      return redirectToLogin();
    }

    const texts = i18n[lang];
    let content;
    if (null === groupList){
      content = <Skeleton variant="rect" style={{height: '10rem'}}/>;
    }else if (0 === groupList.length){
      content = <Info>{texts.noResource}</Info>;
    }else{
      content = (
        <OperableTable
          color="primary"
          headers={[texts.name, texts.display, texts.member, texts.operates]}
          rows={
            groupList.map((group, key) => {
              const name = group.name;
              var operators = [
                <IconButton key='modify' label={texts.modify} icon={EditIcon} onClick={() => showModifyDialog(name)}/>,
                <IconButton key='member' label={texts.member} icon={GroupIcon} onClick={() => showMembers(name)}/>,
              ];
              if (name !== session.group){
                operators.push(<IconButton key='remove' label={texts.remove} icon={DeleteIcon} onClick={() => showRemoveDialog(name)}/>)
              }
              return (
                <TableRow className={classes.tableBodyRow} key={key}>
                  <TableCell className={classes.tableCell}>
                    {name}
                  </TableCell>
                  <TableCell className={classes.tableCell}>
                    {group.display}
                  </TableCell>
                  <TableCell className={classes.tableCell}>
                    {group.member.toString()}
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
          <AddGroupDialog
            lang={lang}
            open={addDialogVisible}
            onSuccess={onAddSuccess}
            onCancel={closeAddDialog}
            />
        </GridItem>
        <GridItem>
          <ModifyGroupDialog
            lang={lang}
            name={currentGroup}
            open={modifyDialogVisible}
            onSuccess={onModifySuccess}
            onCancel={closeModifyDialog}
            />
        </GridItem>
        <GridItem>
          <RemoveGroupDialog
            lang={lang}
            name={currentGroup}
            open={removeDialogVisible}
            onSuccess={onRemoveSuccess}
            onCancel={closeRemoveDialog}
            />
        </GridItem>
      </GridContainer>
    );
}
