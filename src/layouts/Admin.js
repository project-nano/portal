import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";
// import { Router, Redirect } from "@reach/router";
// creates a beautiful scrollbar
import PerfectScrollbar from "perfect-scrollbar";
import "perfect-scrollbar/css/perfect-scrollbar.css";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
// core components
import Navbar from "components/Navbars/Navbar.js";
import Sidebar from "components/Sidebar/Sidebar.js";
import ComputeCells from "views/ComputeCells/ComputeCells.js";
import allRoutes from "routes.js";
import styles from "assets/jss/material-dashboard-react/layouts/adminStyle.js";

import bgImage from "assets/img/sidebar.jpg";
// import logo from "assets/img/reactlogo.png";
// import logo from "assets/img/nano.ico";
import logo from "assets/img/nano_white.svg";
import { getLoggedSession, redirectToLogin } from 'utils.js';

let ps;

function SwitchRoutes(props) {
  const { routes, ...rest } = props;
  const first = routes[0];
  const firstPath = first.layout + first.path;
  return (
    <Switch>
      {routes.map((item, key) => {
        if (item.layout === "/admin") {
          return (
            <Route
              path={item.layout + item.path}
              render={()=> React.createElement(item.component, rest)}
              key={key}
            />
          );
        }
        return null;
      })}
      <Route path="/admin/compute_cells/" render={()=> React.createElement(ComputeCells, rest)}/>
      <Redirect from="/admin" to={firstPath} />
    </Switch>
  );
}

const useStyles = makeStyles(styles);

export default function Admin({ lang, setLang, ...rest }) {
  // styles
  const classes = useStyles();
  // ref to help us initialize PerfectScrollbar on windows devices
  const mainPanel = React.createRef();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const resizeFunction = () => {
    if (window.innerWidth >= 960) {
      setMobileOpen(false);
    }
  };
  // initialize and destroy the PerfectScrollbar plugin
  React.useEffect(() => {
    if (navigator.platform.indexOf("Win") > -1) {
      ps = new PerfectScrollbar(mainPanel.current, {
        suppressScrollX: true,
        suppressScrollY: false
      });
      document.body.style.overflow = "hidden";
    }
    window.addEventListener("resize", resizeFunction);
    // Specify how to clean up after this effect:
    return function cleanup() {
      if (navigator.platform.indexOf("Win") > -1) {
        ps.destroy();
      }
      window.removeEventListener("resize", resizeFunction);
    };
  }, [mainPanel]);

  var session = getLoggedSession();
  if (null === session){
    return redirectToLogin();
  }
  const menuList = session.menu;
  var authorizedMenus = [];
  allRoutes.forEach( menu => {
    if(menuList.some(name => {
      if(name === menu.name){
        return true;
      }else{
        return false;
      }
    })){
      authorizedMenus.push(menu);
    }
  })

  return (
    <div className={classes.wrapper}>
      <Sidebar
        routes={authorizedMenus}
        logoText={"Nano Portal"}
        logo={logo}
        image={bgImage}
        handleDrawerToggle={handleDrawerToggle}
        open={mobileOpen}
        color="blue"
        lang={lang}
        {...rest}
      />
      <div className={classes.mainPanel} ref={mainPanel}>
        <Navbar
          routes={authorizedMenus}
          handleDrawerToggle={handleDrawerToggle}
          lang={lang}
          setLang={setLang}
          {...rest}
        />
        <div className={classes.content}>
          <div className={classes.container}>
            <SwitchRoutes lang={lang} routes={authorizedMenus}/>
          </div>
        </div>
      </div>
    </div>
  );
}
