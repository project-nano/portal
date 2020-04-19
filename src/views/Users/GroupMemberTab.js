import React from "react";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import Container from '@material-ui/core/Container';
import Skeleton from '@material-ui/lab/Skeleton';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
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
import AddMemberDialog from "views/Users/AddMemberDialog";
import RemoveMemberDialog from "views/Users/RemoveMemberDialog";
import { getLoggedSession, logoutSession, redirectToLogin } from 'utils.js';
import { queryGroupMembers,writeLog } from "nano_api.js";
import tableStyles from "assets/jss/material-dashboard-react/components/tableStyle.js";

const styles = {
  ...tableStyles,
};

const useStyles = makeStyles(styles);

const i18n = {
  'en':{
    addButton: "Add Group Member",
    backButton: "Back",
    remove: 'Remove',
    member: 'Member',
    operates: 'Operates',
    noResource: 'No Member Available',
  },
  'cn':{
    addButton: "增加新成员",
    backButton: "返回",
    remove: '删除',
    member: '成员',
    operates: '操作',
    noResource: '尚未添加成员',
  }
}

export default function GroupMemberTab(props){
    const { lang, group, onBack } = props;
    const classes = useStyles();
    const [ memberList, setMemberList ] = React.useState(null);

    //for dialog
    const [ addDialogVisible, setAddDialogVisible ] = React.useState(false);
    const [ removeDialogVisible, setRemoveDialogVisible ] = React.useState(false);
    const [ currentMember, setCurrentMember ] = React.useState('');

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

    const reloadAllMembers = React.useCallback(() => {
      const onLoadFail = (err) =>{
        showErrorMessage(err);
        logoutSession();
      }
      queryGroupMembers(group, setMemberList, onLoadFail);
    }, [ showErrorMessage, group]);

    const showNotifyMessage = (msg) => {
      const notifyDuration = 3000;
      setNotifyColor('info');
      setNotifyMessage(msg);
      writeLog(msg);
      setTimeout(closeNotify, notifyDuration);
    };

    //remove
    const showRemoveDialog = name =>{
      setRemoveDialogVisible(true);
      setCurrentMember(name);
    }

    const closeRemoveDialog = () =>{
      setRemoveDialogVisible(false);
    }

    const onRemoveSuccess = name =>{
      closeRemoveDialog();
      showNotifyMessage('member '+ name + ' removed');
      reloadAllMembers();
    };

    //create
    const showAddDialog = () =>{
      setAddDialogVisible(true);
    };

    const closeAddDialog = () =>{
      setAddDialogVisible(false);
    }

    const onAddSuccess = name =>{
      closeAddDialog();
      showNotifyMessage('member '+ name + ' added');
      reloadAllMembers();
    };

    React.useEffect(() =>{
      reloadAllMembers();
    }, [reloadAllMembers]);


    //reder begin
    var session = getLoggedSession();
    if (null === session){
      return redirectToLogin();
    }

    const texts = i18n[lang];
    let content;
    if (null === memberList){
      content = <Skeleton variant="rect" style={{height: '10rem'}}/>;
    }else if (0 === memberList.length){
      content = <Info>{texts.noResource}</Info>;
    }else{
      content = (
        <OperableTable
          color="primary"
          headers={[texts.member, texts.operates]}
          rows={
            memberList.map((member, key) => {
              var operators = [
                <IconButton key='remove' label={texts.remove} icon={DeleteIcon} onClick={() => showRemoveDialog(member)}/>,
              ];

              return (
                <TableRow className={classes.tableBodyRow} key={key}>
                  <TableCell className={classes.tableCell}>
                    {member}
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
      <Button size="sm" color="info" round onClick={onBack}><NavigateBeforeIcon />{texts.backButton}</Button>,
      <Button size="sm" color="info" round onClick={showAddDialog}><AddIcon />{texts.addButton}</Button>,
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
          <AddMemberDialog
            lang={lang}
            group={group}
            open={addDialogVisible}
            onSuccess={onAddSuccess}
            onCancel={closeAddDialog}
            />
        </GridItem>
        <GridItem>
          <RemoveMemberDialog
            lang={lang}
            group={group}
            member={currentMember}
            open={removeDialogVisible}
            onSuccess={onRemoveSuccess}
            onCancel={closeRemoveDialog}
            />
        </GridItem>
      </GridContainer>
    );
}
