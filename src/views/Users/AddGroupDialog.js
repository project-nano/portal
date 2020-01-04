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
import { addGroup, queryAllRoles } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Add Group',
    name: 'Group Name',
    display: 'Display Name',
    role: 'Roles',
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  'cn':{
    title: '添加用户组',
    name: '组名称',
    display: '显示名称',
    role: '角色清单',
    cancel: '取消',
    confirm: '确定',
  },
}

export default function AddGroupDialog(props){
  const defaultValues = {
    name: '',
    display: '',
    checked: new Set(),
  };
  const { lang, open, onSuccess, onCancel } = props;
  const texts = i18n[lang];
  const [ options, setOptions]  = React.useState([]);
  const [ initialed, setInitialed ] = React.useState(false);
  const [ error, setError ] = React.useState('');
  const [ request, setRequest ] = React.useState(defaultValues);

  const onAddFail = (msg) =>{
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

  const onAddSuccess = name =>{
    resetDialog();
    onSuccess(name);
  }

  const confirmAdd = () => {
    if(!request.name){
      onAddFail('Group name required');
      return;
    }
    if(!request.display){
      onAddFail('Display name required');
      return;
    }
    if(!request.checked || 0 === request.checked.size){
      onAddFail('Select at least one role');
      return;
    }

    //push by order
    var roles = [];
    options.forEach(rolename => {
      if(request.checked.has(rolename)){
        roles.push(rolename);
      }
    })
    addGroup(request.name, request.display, roles, onAddSuccess, onAddFail);
  }

  React.useEffect(()=>{
    if (!open || initialed ){
      return;
    }

    const onQueryRolesSuccess = dataList => {
      setOptions(dataList);
      setInitialed(true);
    }

    queryAllRoles(onQueryRolesSuccess, onAddFail);

  }, [initialed, open]);

  const handleRequestPropsChanged = name => e =>{
    var value = e.target.value
    setRequest(previous => ({
      ...previous,
      [name]: value,
    }));
  };

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
                onChange={handleRequestPropsChanged('name')}
                value={request.name}
                margin="normal"
                required
                fullWidth
              />
            </Box>
          </GridItem>
        </SingleRow>
        <SingleRow>
          <GridItem xs={12} sm={10} md={8}>
            <Box m={0} pt={2}>
              <TextField
                label={texts.display}
                onChange={handleRequestPropsChanged('display')}
                value={request.display}
                margin="normal"
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
                <FormLabel component="legend">{texts.role}</FormLabel>
                <FormGroup>
                  <Grid container>
                    {
                        options.map((rolename, key) => {
                          let checked;
                          if (request.checked.has(rolename)){
                            checked = true;
                          }else{
                            checked = false;
                          }
                          return (
                            <GridItem xs={6} sm={3} key={key}>
                              <FormControlLabel
                                control={<Checkbox checked={checked} onChange={handleTagsChanged} value={rolename}/>}
                                label={rolename}
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
        <Button onClick={confirmAdd} color="info">
          {texts.confirm}
        </Button>
      </DialogActions>
    </Dialog>
  )
};
