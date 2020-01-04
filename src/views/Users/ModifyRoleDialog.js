import React from "react";
// @material-ui/core components
import Grid from "@material-ui/core/Grid";
import Box from '@material-ui/core/Box';
import Skeleton from '@material-ui/lab/Skeleton';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import FormGroup from '@material-ui/core/FormGroup';
import Checkbox from '@material-ui/core/Checkbox';

// dashboard components
import Button from "components/CustomButtons/Button.js";
import GridItem from "components/Grid/GridItem.js";
import SingleRow from "components/Grid/SingleRow.js";
import SnackbarContent from "components/Snackbar/SnackbarContent.js";
import { getRole, modifyRole, getAllMenus } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Modify Role',
    name: 'Name',
    menu: 'Menus',
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  'cn':{
    title: '修改角色权限',
    name: '名称',
    menu: '可用菜单',
    cancel: '取消',
    confirm: '确定',
  },
}

export default function ModifyRoleDialog(props){
  const defaultValues = {
    checked: new Set(),
  };
  const { lang, name, open, onSuccess, onCancel } = props;
  const texts = i18n[lang];
  const options = getAllMenus(lang);
  const [ initialed, setInitialed ] = React.useState(false);
  const [ error, setError ] = React.useState('');
  const [ request, setRequest ] = React.useState(defaultValues);

  const onModifyFail = (msg) =>{
    setError(msg);
  }
  const resetDialog = () =>{
    setError('');
    setRequest(defaultValues);
    setInitialed(false);
  };

  const closeDialog = ()=>{
    resetDialog();
    onCancel();
  }

  const onModifySuccess = () =>{
    resetDialog();
    onSuccess(name);
  }

  const confirmModify = () => {
    if(!request.checked || 0 === request.checked.size){
      onModifyFail('Select at least one menu item');
      return;
    }
    //puy by order
    var menus = [];
    options.forEach(menu => {
      if(request.checked.has(menu.value)){
        menus.push(menu.value);
      }
    })
    modifyRole(name, menus, onModifySuccess, onModifyFail);
  }

  React.useEffect(()=>{
    if (!name || !open || initialed ){
      return;
    }

    const onGetRoleSuccess = data =>{
      const { menu } = data;
      var updated = new Set();
      menu.forEach(itemValue => {
        updated.add(itemValue);
      })
      setRequest({
        checked: updated,
      })
      setInitialed(true);
    };

    getRole(name, onGetRoleSuccess, onModifyFail);

  }, [initialed, open, name]);

  const handleTagsChanged = e =>{
    const value = e.target.value;
    var checked = e.target.checked;
    var previous = {
      ...request,
    };

    if(checked){
      previous.checked.add(value);
    }else{
      previous.checked.delete(value);
    }
    setRequest(previous);
  };

  //begin render
  let content;
  if (!initialed){
    content = <Skeleton variant="rect" style={{height: '10rem'}}/>;
  }else{
    content = (
      <Grid container>
        <SingleRow>
          <GridItem xs={12} sm={6} md={4}>
            <Box m={0} pt={2}>
              <TextField
                label={texts.name}
                value={name}
                margin="normal"
                disabled
                required
                fullWidth
              />
            </Box>
          </GridItem>
        </SingleRow>
        <SingleRow>
          <GridItem xs={12}>
            <Box m={0} pt={2}>
              <FormControl component="fieldset" fullWidth>
                <FormLabel component="legend">{texts.menu}</FormLabel>
                <FormGroup>
                  <Grid container>
                    {
                        options.map((tag, key) => {
                          const { value, label } = tag;
                          let checked;
                          if (request.checked.has(value)){
                            checked = true;
                          }else{
                            checked = false;
                          }
                          return (
                            <GridItem xs={6} sm={3} key={key}>
                              <FormControlLabel
                                control={<Checkbox checked={checked} onChange={handleTagsChanged} value={value}/>}
                                label={label}
                              />
                            </GridItem>
                          )
                        })
                    }
                  </Grid>
                </FormGroup>
              </FormControl>
            </Box>
          </GridItem>
        </SingleRow>
      </Grid>
    );
  }

  let prompt;
  if (!error || '' === error){
    prompt = <GridItem xs={12}/>;
  }else{
    prompt = (
      <GridItem xs={12}>
        <SnackbarContent message={error} color="danger"/>
      </GridItem>
    );
  }

  return (
    <Dialog
      open={open}
      aria-labelledby={texts.title}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>{texts.title}</DialogTitle>
      <DialogContent>
        <Grid container>
          <GridItem xs={12}>
            {content}
          </GridItem>
          {prompt}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog} color="transparent" autoFocus>
          {texts.cancel}
        </Button>
        <Button onClick={confirmModify} color="info">
          {texts.confirm}
        </Button>
      </DialogActions>
    </Dialog>
  )
};
