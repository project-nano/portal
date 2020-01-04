import React from "react";
// @material-ui/core components
import Grid from "@material-ui/core/Grid";
import Box from '@material-ui/core/Box';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Skeleton from '@material-ui/lab/Skeleton';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';

// dashboard components
import Button from "components/CustomButtons/Button.js";
import GridItem from "components/Grid/GridItem.js";
import SnackbarContent from "components/Snackbar/SnackbarContent.js";
import { searchUsers, addGroupMember } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Add Group Member ',
    name: 'User',
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  'cn':{
    title: '添加新成员 ',
    name: '用户名',
    cancel: '取消',
    confirm: '确定',
  },
}

export default function AddMemberDialog(props){
  const defaultValues = {
    member: '',
  };
  const { lang, group, open, onSuccess, onCancel } = props;
  const [ initialed, setInitialed ] = React.useState(false);
  const [ error, setError ] = React.useState('');
  const [ request, setRequest ] = React.useState(defaultValues);
  const [ options, setOptions ] = React.useState([]);

  const texts = i18n[lang];
  const onAddFail = (msg) =>{
    setError(msg);
  }
  const resetDialog = () => {
    setError('');
    setRequest(defaultValues);
    setInitialed(false);
  }
  const closeDialog = ()=>{
    resetDialog();
    onCancel();
  }

  const onAddSuccess = member =>{
    resetDialog();
    onSuccess(member, group);
  }

  const confirmAdd = () =>{
    if(!request.member || '' === request.member){
      onAddFail('must select an user');
    }
    addGroupMember(group, request.member, onAddSuccess, onAddFail);
  }

  const handleRequestPropsChanged = name => e =>{
    var value = e.target.value
    setRequest(previous => ({
      ...previous,
      [name]: value,
    }));
  };

  React.useEffect(()=>{
    if (!open || initialed){
      return;
    }

    const onQueryUserSuccess = dataList => {
      if (0 === dataList.length){
        onAddFail('no unallocated users available');
        return;
      }
      setOptions(dataList);
      setInitialed(true);
    };

    searchUsers(null, onQueryUserSuccess, onAddFail);
  }, [initialed, open]);

  //begin render
  let content;
  if (!initialed){
    content = <Skeleton variant="rect" style={{height: '10rem'}}/>;
  }else{
    content = (
      <Grid container>
        <GridItem xs={8}>
          <Box m={1} p={2}>
          <InputLabel htmlFor="member">{texts.name}</InputLabel>
          <Select
            value={request.member}
            onChange={handleRequestPropsChanged('member')}
            inputProps={{
              name: 'member',
              id: 'member',
            }}
            fullWidth
          >
            {
              options.map(username =>(
                <MenuItem value={username} key={username}>{username}</MenuItem>
              ))
            }
          </Select>
          </Box>
        </GridItem>
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
      maxWidth="sm"
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
