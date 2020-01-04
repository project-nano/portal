import React from "react";
import classNames from "classnames";
import PropTypes from "prop-types";
import Box from '@material-ui/core/Box';
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Link from '@material-ui/core/Link';
import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import Typography from '@material-ui/core/Typography';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import Hidden from "@material-ui/core/Hidden";
// @material-ui/icons
import Menu from "@material-ui/icons/Menu";
// core components
import AdminNavbarLinks from "./AdminNavbarLinks.js";
import Button from "components/CustomButtons/Button.js";
import LanguageSelector from "components/Language/Selector.js";

import styles from "assets/jss/material-dashboard-react/components/headerStyle.js";
import { getCurrentVersion } from 'nano_api.js';

const useStyles = makeStyles(styles);

const i18n = {
  'en':{
    manual: 'Online Manual',
    manualURL: 'https://nanocloud.readthedocs.io/projects/guide/en/latest/',
  },
  'cn':{
    manual: '在线文档',
    manualURL: 'https://nanocloud.readthedocs.io/projects/guide/zh_CN/latest/',
  }
}

export default function Header(props) {
  const classes = useStyles();
  function makeBrand() {
    var name = '';
    props.routes.every(prop => {
      if (window.location.href.indexOf(prop.layout + prop.path) !== -1) {
        name = prop.display[props.lang]
        return false;
      }
      return true;
    });
    return name;
  }
  const { color, lang, setLang } = props;
  const texts = i18n[lang];
  const appBarClasses = classNames({
    [" " + classes[color]]: color
  });

  const version = (
    <Box mr={2}>
      <Typography component='span'>
        {'Project Nano ' + getCurrentVersion() + ' © 2018~2020.'}
      </Typography>
    </Box>
  );

  const manualButton = (
    <Tooltip title={texts.manual} placement='top'>
      <Link target='_blank' href={texts.manualURL}>
        <IconButton color='default' size='small'>
          <HelpOutlineIcon/>
        </IconButton>
      </Link>
    </Tooltip>
  )

  return (
    <AppBar className={classes.appBar + appBarClasses}>
      <Toolbar className={classes.container}>
        <div className={classes.flex}>
          {/* Here we create navbar brand, based on route name */}
          <Button color="transparent" href="#" className={classes.title}>
            {makeBrand()}
          </Button>
        </div>
        {version}
        {manualButton}
        <LanguageSelector lang={lang} setLang={setLang}/>
        <Hidden smDown implementation="css">
          <AdminNavbarLinks lang={lang}/>
        </Hidden>
        <Hidden mdUp implementation="css">
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={props.handleDrawerToggle}
          >
            <Menu />
          </IconButton>
        </Hidden>
      </Toolbar>
    </AppBar>
  );
}

Header.propTypes = {
  color: PropTypes.oneOf(["primary", "info", "success", "warning", "danger"]),
  rtlActive: PropTypes.bool,
  handleDrawerToggle: PropTypes.func,
  routes: PropTypes.arrayOf(PropTypes.object)
};
