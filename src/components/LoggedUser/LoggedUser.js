import React from "react";
import classNames from "classnames";
import { makeStyles } from "@material-ui/core/styles";
// import Hidden from "@material-ui/core/Hidden";
import Button from "components/CustomButtons/Button.js";
import Person from "@material-ui/icons/Person";
import MenuItem from "@material-ui/core/MenuItem";
import MenuList from "@material-ui/core/MenuList";
import Grow from "@material-ui/core/Grow";
import Paper from "@material-ui/core/Paper";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Poppers from "@material-ui/core/Popper";
import Divider from "@material-ui/core/Divider";
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from "@material-ui/core/Grid";
import TextField from '@material-ui/core/TextField';
import GridItem from "components/Grid/GridItem.js";
import SnackbarContent from "components/Snackbar/SnackbarContent.js";
import styles from "assets/jss/material-dashboard-react/components/headerLinksStyle.js";
import { getLoggedSession, logoutSession, redirectToLogin } from 'utils.js';
import { updateSession, changeUserPassword, writeLog } from 'nano_api.js';

const useStyles = makeStyles(styles);

const i18n = {
  'en':{
    modify: 'Modify Password',
    logout: 'Logout',
    current: 'Current Password',
    new: 'New Password',
    confirmNew: 'Confirm New Password',
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  'cn':{
    modify: '修改密码',
    logout: '注销',
    current: '当前密码',
    new: '新密码',
    confirmNew: '确认新密码',
    cancel: '取消',
    confirm: '确认',
  }
};

export default function LoggedUser(props){
  const classes = useStyles();
  const [ mounted, setMounted ] = React.useState(false)
  const [ username, setUsername] = React.useState("")
  const [ openProfile, setOpenProfile ] = React.useState(null);
  const [ isLogged, setLogged ] = React.useState(()=>{
    return (null !== getLoggedSession());
  });
  const handleClickProfile = event => {
    if (openProfile && openProfile.contains(event.target)) {
      setOpenProfile(null);
    } else {
      setOpenProfile(event.currentTarget);
    }
  };
  const handleCloseProfile = () => {
    setOpenProfile(null);
  };
  const logout = () => {
    const onFinished = () => {
      logoutSession();
      setLogged(false);
    }
    writeLog('logout', onFinished, onFinished);
  }

  const [ dialogVisible, setDialogVisible ] = React.useState(false);
  const [ dialogParams, setDialogParams ] = React.useState({
    old: '',
    new: '',
    new2: '',
    error: '',
  });

  const handleDialogParamsChanged = (name) => e =>{
    var value = e.target.value;
    setDialogParams(previous => ({
      ...previous,
      [name]: value,
    }));
  };

  const showModifyPassword = () =>{
    setDialogParams({
      old: '',
      new: '',
      new2: '',
      error: '',
    });
    setDialogVisible(true);
  }

  const closeModifyPassword = () =>{
    setDialogVisible(false);
  }

  const displayError = (msg) =>{
    setDialogParams({
      ...dialogParams,
      error: msg,
    })
  }
  const modifyPassword = () =>{
    var session = getLoggedSession();
    if (null === session){
      displayError('session expired');
      return;
    }
    if ('' === dialogParams.old){
      displayError('previous password required');
      return;
    }
    if ('' === dialogParams.new){
      displayError('new password required');
      return;
    }
    if (dialogParams.new2 !== dialogParams.new){
      displayError('confirm password dismatch');
      return;
    }
    const onModifiedSuccess = name =>{
      closeModifyPassword();
      writeLog('change password of ' + name);
    }
    changeUserPassword(session.user, dialogParams.old, dialogParams.new, onModifiedSuccess, displayError);
  }

  const keepAlive = React.useCallback(() => {
    const onUpdateFail = () =>{
      logoutSession();
      if (mounted){
        setLogged(false);
      }
    }
    updateSession(onUpdateFail);
  }, [mounted]);

  //mount/unmount only
  React.useEffect(() =>{
    setMounted(true);
    keepAlive();
    var session = getLoggedSession();
    if (null === session){
      return;
    }

    if (mounted){
      setUsername(session.user);
    }

    var updateInterval = session.timeout * 1000 * 2 / 3;
    // var updateInterval = 3000;
    var timerID = setInterval(()=>{
      keepAlive();
    }, updateInterval);
    return () => {
      setMounted(false);
      clearInterval(timerID);
    }

  }, [mounted, keepAlive]);

  //render begin
  const texts = i18n[props.lang];
  if (!isLogged){
    return redirectToLogin();
  }

  let notifyItem;
  if (!dialogParams || '' === dialogParams.error){
    notifyItem = <GridItem xs={12}/>;
  }else{
    notifyItem = (
      <GridItem xs={12}>
        <SnackbarContent message={dialogParams.error} color="danger"/>
      </GridItem>
    );
  }

  return(
    <div className={classes.manager}>
      <Button
        color={window.innerWidth > 959 ? "transparent" : "white"}
        simple={!(window.innerWidth > 959)}
        aria-owns={openProfile ? "profile-menu-list-grow" : null}
        aria-haspopup="true"
        onClick={handleClickProfile}
        className={classes.buttonLink}
      >
        {username}
        <Person className={classes.icons} />
      </Button>
      <Poppers
        open={Boolean(openProfile)}
        anchorEl={openProfile}
        transition
        disablePortal
        className={
          classNames({ [classes.popperClose]: !openProfile }) +
          " " +
          classes.popperNav
        }
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            id="profile-menu-list-grow"
            style={{
              transformOrigin:
                placement === "bottom" ? "center top" : "center bottom"
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleCloseProfile}>
                <MenuList role="menu">
                  <MenuItem
                    onClick={showModifyPassword}
                    className={classes.dropdownItem}
                  >
                    {texts.modify}
                  </MenuItem>
                  <Divider light />
                  <MenuItem
                    onClick={logout}
                    className={classes.dropdownItem}
                  >
                    {texts.logout}
                  </MenuItem>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Poppers>
      <Dialog
        open={dialogVisible}
        aria-labelledby={texts.modify}
        maxWidth='sm'
      >
        <DialogTitle>{texts.modify}</DialogTitle>
        <DialogContent>
          <Grid container>
            <GridItem xs={12}>
              <TextField
                label={texts.current}
                onChange={handleDialogParamsChanged('old')}
                value={dialogParams.old}
                margin="normal"
                type='password'
                required
              />
            </GridItem>
            <GridItem xs={12}>
              <TextField
                label={texts.new}
                onChange={handleDialogParamsChanged('new')}
                value={dialogParams.new}
                margin="normal"
                type='password'
                required
              />
            </GridItem>
            <GridItem xs={12}>
              <TextField
                label={texts.confirmNew}
                onChange={handleDialogParamsChanged('new2')}
                value={dialogParams.new2}
                margin="normal"
                type='password'
                required
              />
            </GridItem>
            {notifyItem}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModifyPassword} color="transparent" autoFocus>
            {texts.cancel}
          </Button>
          <Button onClick={modifyPassword} color="info">
            {texts.confirm}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
