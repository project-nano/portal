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
import ModifyPasswordDialog from "components/LoggedUser/ModifyPasswordDialog.js";
import styles from "assets/jss/material-dashboard-react/components/headerLinksStyle.js";
import { getLoggedSession, logoutSession, redirectToLogin } from 'utils.js';
import { updateSession,  writeLog } from 'nano_api.js';

const useStyles = makeStyles(styles);

const i18n = {
  'en':{
    modify: 'Modify Password',
    logout: 'Logout',
  },
  'cn':{
    modify: '修改密码',
    logout: '注销',
  }
};

export default function LoggedUser(props){
  const classes = useStyles();
  const { lang } = props;
  const texts = i18n[lang];
  const [ mounted, setMounted ] = React.useState(false)
  const [ username, setUsername] = React.useState("")
  const [ openProfile, setOpenProfile ] = React.useState(null);
  const [ dialogVisible, setDialogVisible ] = React.useState(false);
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

  const showModifyPassword = () =>{
    setDialogVisible(true);
  }

  const closeModifyPassword = () =>{
    setDialogVisible(false);
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
  if (!isLogged){
    return redirectToLogin();
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
      <ModifyPasswordDialog
        lang={lang}
        open={dialogVisible}
        user={username}
        onSuccess={closeModifyPassword}
        onCancel={closeModifyPassword}
        />
    </div>
  );
}
