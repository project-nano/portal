import React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Skeleton from '@material-ui/lab/Skeleton';

import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import GridItem from "components/Grid/GridItem.js";
import Button from "components/CustomButtons/Button.js";
import SnackbarContent from "components/Snackbar/SnackbarContent.js";
import { Redirect } from 'react-router-dom';
// import { Redirect } from "@reach/router";
import bgImage from 'assets/img/login_background.jpg';
import LanguageSelector from "components/Language/Selector.js";
import { loginUser, writeLog, getSystemStatus } from 'nano_api.js';
import { saveLoggedSession } from 'utils.js';

const getClasses = makeStyles(()=>({
  background:{
    backgroundImage: "url(" + bgImage + ")",
    height: '100vh',
  }
}));

const i18n = {
  'cn':{
    title: 'Nano管理门户',
    user: '用户名',
    password: '密码',
    login: '登录',
  },
  'en':{
    title: 'Nano Web Portal',
    user: 'User',
    password: 'Password',
    login: 'Login',
  }
};

export default function Login(props){
  const { lang, setLang } = props;
  const texts = i18n[lang];
  const classes = getClasses();
  const [ request, setRequest ] = React.useState({
    user: '',
    password: '',
    nonce: 'stub',
    type: 'manager',
  });
  const [ errorMessage, setError ] = React.useState('');
  const [ systemReady, setSystemReady ] = React.useState(true);
  const [ initialed, setInitialed ] = React.useState(false);
  const [ isLogged, setLogged ] = React.useState(false);

  const notifyError = React.useCallback(message =>{
    const notifyElapsed = 5000;
    setError(message);
    setTimeout(()=>{
      setError('');
    }, notifyElapsed);
  }, [setError]);

  const handleRequestPropsChanged = name => e => {
    var value = e.target.value
    setRequest(previous => ({
      ...previous,
      [name]: value,
    }));
  };

  const onLoginFail = React.useCallback(msg =>{
    notifyError(msg);
  }, [notifyError]);

  const onLoginSuccess = payload =>{
    var session = {
      id: payload.session,
      timeout: payload.timeout,
      menu: payload.menu,
      address: payload.address,
      user: request.user,
      group: payload.group,
      nonce: request.nonce,
      type: request.type,
    }
    saveLoggedSession(session);
    if (!isLogged){
        setLogged(true);
        writeLog('login success');
    }
  };

  const handleLoginClick = () =>{
    loginUser(request.user, request.password, onLoginSuccess, onLoginFail);
  };

  React.useEffect(() =>{
    if(initialed){
      return;
    }
    const onQueryStatusSuccess = result => {
      if (!result.ready){
        setSystemReady(false);
      }
      setInitialed(true);
    }

    getSystemStatus(onQueryStatusSuccess, onLoginFail);
  }, [initialed, onLoginFail]);

  let content, button;
  if (!initialed){
    content = <Skeleton variant="rect" style={{height: '10rem'}}/>;
  } else if (!systemReady){
    return <Redirect to='/initial'/>;
  } else if (isLogged){
    const PreviousKey = "previous";
    var params = new URLSearchParams(window.location.search);
    if (params.has(PreviousKey)){
      return <Redirect to={decodeURIComponent(params.get(PreviousKey))}/>;
    }else{
      return <Redirect to='/admin'/>;
    }
  }else{
    let errorBar;
    if (errorMessage){
      errorBar = (
        <GridItem xs={12}>
          <SnackbarContent message={errorMessage} color="danger"/>
        </GridItem>
      );
    }else{
      errorBar = <GridItem xs={12}/>;
    }
    button = <Button color="info" onClick={handleLoginClick}>{texts.login}</Button>;
    content = (
      <Grid container>
        <GridItem xs={12}>
          <Box m={0} pt={2}>
            <TextField
              label={texts.user}
              onChange={handleRequestPropsChanged('user')}
              value={request.user}
              margin="normal"
              required
              fullWidth
            />
          </Box>
        </GridItem>
        <GridItem xs={12}>
          <Box m={0} pt={2}>
            <TextField
              label={texts.password}
              onChange={handleRequestPropsChanged('password')}
              value={request.password}
              margin="normal"
              type='password'
              required
              fullWidth
            />
          </Box>
        </GridItem>
        <GridItem xs={12}>
          <Box alignItems='center' display='flex' m={1}>
            {button}
            <Box flexGrow={1}/>
            <LanguageSelector lang={lang} setLang={setLang}/>
          </Box>
        </GridItem>
        <GridItem xs={12}>
          {errorBar}
        </GridItem>
      </Grid>
    );
  }
  return(
    <Box component='div' className={classes.background}>
      <Container maxWidth='lg'>
        <Grid container justify="center">
          <Grid item xs={10} sm={6} md={4}>
            <Box mt={20} p={0}>
              <Card>
                <CardHeader color="primary">
                  <h4 className={classes.cardTitleWhite}>{texts.title}</h4>
                </CardHeader>
                <CardBody>
                  {content}
                </CardBody>
              </Card>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}
