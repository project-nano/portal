import React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Skeleton from '@material-ui/lab/Skeleton';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';

import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import GridItem from "components/Grid/GridItem.js";
import Button from "components/CustomButtons/Button.js";
import SnackbarContent from "components/Snackbar/SnackbarContent.js";
import { Redirect } from 'react-router-dom';
import dashboardStyles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";
import LanguageSelector from "components/Language/Selector.js";

import bgImage from 'assets/img/login_background.jpg';
import { getSystemStatus, initialSystem, getAllMenus } from 'nano_api.js';

const getClasses = makeStyles(()=>({
  ...dashboardStyles,
  background:{
    backgroundImage: "url(" + bgImage + ")",
    height: '100vh',
  }
}));

const i18n = {
  'cn':{
    welcome: '欢迎使用Nano云平台',
    description: '请设定管理员账号及密码，开始初始化系统',
    user: '默认管理员帐号',
    password: '密码',
    password2: '确认密码',
    initial: '初始化',
    confirm: '确认',
    success: '系统初始化成功，点击进入登录页面',
  },
  'en':{
    welcome: 'Welcome to Nano',
    description: 'Please set up a new admin account',
    user: 'Super Admin Name',
    password: 'Password',
    password2: 'Confirm Password',
    initial: 'Initial System',
    confirm: 'Confirm',
    success: 'System initialed, click to login',
  }
};

export default function InitialSystem(props){
  const StageEnum = {
    uninitial: 0,
    input: 1,
    initialed: 2,
    redirect: 3,
  };
  const classes = getClasses();
  const { lang, setLang } = props;
  const texts = i18n[lang];
  const [ request, setRequest ] = React.useState({
    user: '',
    password: '',
    password2: '',
  });

  const [ errorMessage, setError ] = React.useState('');
  const [ stage, setStage ] = React.useState(StageEnum.uninitial);

  const notifyError = (message) =>{
    const notifyElapsed = 5000;
    setError(message);
    setTimeout(()=>{
      setError('');
    }, notifyElapsed);
  };

  const handleRequestPropsChanged = name => e =>{
    var value = e.target.value
    setRequest(previous => ({
      ...previous,
      [name]: value,
    }));
  };

  const onInitialFail = React.useCallback(msg =>{
    notifyError(msg);
  }, []);

  const onInitialSuccess = () =>{
    setError('');
    setStage(StageEnum.initialed);
  }

  const redirect = React.useCallback(() =>{
    setStage(StageEnum.redirect);
  }, [StageEnum.redirect]);

  const onResultConfirm = () => {
    redirect();
  }

  const confirmInitial = () =>{
    const namePattern = new RegExp('[^\\w-.]');
    if(!request.user){
      onInitialFail('must specify user name');
      return;
    }else if (namePattern.test(request.user)){
      onInitialFail("only letter/digit/'-'/'_'/'.' allowed in username");
      return;
    }

    if(!request.password){
      onInitialFail('please input password');
      return;
    }else if (request.password2 !== request.password){
      onInitialFail('password mismatch');
      return;
    }
    var menuList = []
    getAllMenus(lang).forEach(menu => {
      menuList.push(menu.value);
    });
    initialSystem(request.user, null, null, null, request.password, menuList, onInitialSuccess, onInitialFail);
  }

  React.useEffect(() =>{
    const onQueryStatusSuccess = result => {
      if (result.ready){
        redirect();
        return;
      }
      //need initial
      setStage(StageEnum.input);
    }

    getSystemStatus(onQueryStatusSuccess, onInitialFail);
  }, [StageEnum.input, onInitialFail, redirect]);

  let errorBar;
  if (errorMessage && '' !== errorMessage){
    errorBar = (
      <GridItem xs={12}>
        <SnackbarContent message={errorMessage} color="danger"/>
      </GridItem>
    );
  }else{
    errorBar = <GridItem xs={12}/>;
  }

  let content, button;
  switch (stage) {
    case StageEnum.input:
      button = <Button color="info" onClick={confirmInitial}>{texts.initial}</Button>;
      content = (
        <Grid container>
          <GridItem xs={12}>
            <Box justifyContent="center" display='flex'>
              <Typography className={classes.cardTitle}>
                {texts.description}
              </Typography>
            </Box>
          </GridItem>
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
            <Box m={0} pt={2}>
              <TextField
                label={texts.password2}
                onChange={handleRequestPropsChanged('password2')}
                value={request.password2}
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
      )
      break;
    case StageEnum.initialed:
      button = <Button color="info" onClick={onResultConfirm}>{texts.confirm}</Button>;
      content = (
        <Grid container>
          <GridItem xs={12}>
            <Box justifyContent="center" display='flex'>
              <Typography variant='body1' component='span' className={classes.cardTitle}>
                {texts.success}
              </Typography>
            </Box>
          </GridItem>
          <GridItem xs={12}>
            <Box justifyContent="center" display='flex'>
              {button}
            </Box>
          </GridItem>
        </Grid>
      )
      break;
    case StageEnum.redirect:
      return <Redirect to='/login'/>;
    default:
      //uninitial
      content = (
        <div>
          <Skeleton variant="rect" style={{height: '10rem'}}/>
          {errorBar}
        </div>
      );
  }

  return(
    <Box component='div' className={classes.background}>
      <Container maxWidth='lg'>
        <Grid container justify="center">
          <Grid item xs={12} sm={8} md={4}>
            <Box mt={20} p={0}>
              <Card>
                <CardHeader color="primary">
                  <h4 className={classes.cardTitleWhite}>{texts.welcome}</h4>
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
