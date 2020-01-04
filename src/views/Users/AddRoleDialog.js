import React from "react";
// @material-ui/core components
import Grid from "@material-ui/core/Grid";
import Box from '@material-ui/core/Box';
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
import { addRole, getAllMenus } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Add Role',
    name: 'Name',
    menu: 'Menus',
    dashboard: 'Dashboard',
    computePool: 'Compute Pools',
    addressPool: 'Address Pools',
    storagePool: 'Storage Pools',
    instance: 'Instances',
    diskImage: 'Disk Image',
    mediaImage: 'Media Image',
    user: 'Users',
    log: 'Logs',
    visibility: 'Resource Visibility',
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  'cn':{
    title: '新增角色',
    name: '名称',
    menu: '可用菜单',
    dashboard: '仪表盘',
    computePool: '计算资源池',
    addressPool: '地址资源池',
    storagePool: '存储资源池',
    instance: '云主机实例',
    diskImage: '磁盘镜像',
    mediaImage: '光盘镜像',
    user: '用户',
    log: '日志',
    visibility: '资源可见性',
    cancel: '取消',
    confirm: '确定',
  },
}

export default function AddRoleDialog(props){
  const defaultValues = {
    name: '',
    checked: new Set(),
  };
  const { lang, open, onSuccess, onCancel } = props;
  const texts = i18n[lang];
  const options = getAllMenus(lang);
  const [ error, setError ] = React.useState('');
  const [ request, setRequest ] = React.useState(defaultValues);

  const onAddFail = (msg) =>{
    setError(msg);
  }
  const resetDialog = () =>{
    setError('');
    setRequest(defaultValues);
  };

  const closeDialog = ()=>{
    resetDialog();
    onCancel();
  }

  const onAddSuccess = rolename =>{
    resetDialog();
    onSuccess(rolename);
  }

  const confirmAdd = () =>{
    if(!request.name){
      onAddFail('must specify role name');
      return;
    }

    if(!request.checked || 0 === request.checked.size){
      onAddFail('Select at least one menu item');
      return;
    }
    //puy by order
    var menus = [];
    options.forEach(menu => {
      if(request.checked.has(menu.value)){
        menus.push(menu.value);
      }
    })
    addRole(request.name, menus, onAddSuccess, onAddFail);
  }

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
  const content = (
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
