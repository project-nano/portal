/*!

=========================================================
* Material Dashboard React - v1.8.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2019 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/material-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React from "react";
import ReactDOM from "react-dom";
import {createTheme} from '@material-ui/core/styles';
import ThemeProvider from '@material-ui/styles/ThemeProvider';

import { createBrowserHistory } from "history";
import { Router, Route, Switch, Redirect } from "react-router-dom";
import Danger from "components/Typography/Danger.js";
import { primaryColor, infoColor, dangerColor } from "assets/jss/material-dashboard-react.js";
// core components
import Admin from "layouts/Admin.js";
import Login from "views/Login/Login.js";
import Initial from "views/Login/Initial.js";
import ControlInstance from "views/Instances/ControlInstance.js";
import { getLanguage } from "utils.js";

import "assets/css/material-dashboard-react.css?v=1.8.0";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorStack: null,
    };
  }

  static getDerivedStateFromError(error) {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return {
      hasError: true,
      error: error.message,
      errorStack: error.stack,
    };
  }

  render() {
    if (this.state.hasError){
      return <Danger>{this.state.error}</Danger>;
    }

    return this.props.children;
  }
}

const history = createBrowserHistory();
const mainTheme = createTheme({
  palette: {
    primary: {
      light: primaryColor[1],
      main: primaryColor[0],
    },
    secondary:{
      light: infoColor[1],
      main: infoColor[0],
    },
    error:{
      light: dangerColor[1],
      main: dangerColor[0],
    },
  },
});

function LanguageProvider(props){
  const [ lang, setLang ] = React.useState(getLanguage());

  return (
    <ThemeProvider theme={mainTheme}>
      <ErrorBoundary>
        <Router history={history}>
          <Switch>
            <Route path="/admin" render={ (props) => <Admin lang={lang} setLang={setLang}/>}/>
            <Route path="/login" render={ (props) => <Login lang={lang} setLang={setLang}/>}/>
            <Route path="/initial" render={ (props) => <Initial lang={lang} setLang={setLang}/>}/>
            <Route path="/monitor/:id" render={ props => <ControlInstance lang={lang} {...props}/>}/>
            <Redirect from="/" to="/login" />
          </Switch>
        </Router>
      </ErrorBoundary>
    </ThemeProvider>
  )
}

ReactDOM.render(
  <LanguageProvider/>,
  document.getElementById("root")
);
