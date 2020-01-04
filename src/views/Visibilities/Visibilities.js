import React from "react";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import Skeleton from '@material-ui/lab/Skeleton';
import BuildIcon from '@material-ui/icons/Build';
import Box from '@material-ui/core/Box';
import Checkbox from '@material-ui/core/Checkbox';

// dashboard components
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Snackbar from "components/Snackbar/Snackbar.js";
import Button from "components/CustomButtons/Button.js";
import OperableTable from "components/Table/OperableTable.js";
import tableStyles from "assets/jss/material-dashboard-react/components/tableStyle.js";
import { getLoggedSession, redirectToLogin } from 'utils.js';
import { getVisibilities, setVisiblities, writeLog } from "nano_api.js";

const styles = {
  ...tableStyles,
};

const useStyles = makeStyles(styles);

const i18n = {
  'en':{
    modify: 'Modify',
    visibility: 'Group Resource Visibility',
    description: 'Description',
    instance: 'Instances Visible',
    instanceDescription: 'User can browse instances created by other users in the same group when enabled. Otherwise, an instance is only visible to its creator by default.',
    disk: 'Disk Images Visible',
    diskDescription: 'User can browse disk images created by other users in the same group when enabled. Otherwise, an image is only visible to its creator by default.',
    media: 'Media Images Visible',
    mediaDescription: 'User can browse media images created by other users in the same group when enabled. Otherwise, an image is only visible to its creator by default.',
  },
  'cn':{
    modify: '修改',
    visibility: '组资源可见性',
    description: '描述',
    instance: '云主机实例组内可见',
    instanceDescription: '勾选后，用户可以查看同一组内其他用户创建的云主机实例(默认仅对创建者可见)',
    disk: '磁盘镜像组内可见',
    diskDescription: '勾选后，用户可以查看同一组内其他用户创建的磁盘镜像(默认仅对创建者可见)',
    media: '光盘镜像组内可见',
    mediaDescription: '勾选后，用户可以查看同一组内其他用户创建的光盘镜像(默认仅对创建者可见)',
  }
}

const VisibilityRow = props => {
  const { checked, onChange, label, description, classes } = props;
  return (
    <TableRow className={classes.tableBodyRow}>
      <TableCell className={classes.tableCell}>
        <Box display='flex' alignItems="center">
          <Box>
            <Checkbox
              checked={checked}
              onChange={onChange}
              />
          </Box>
          <Box>
            {label}
          </Box>
        </Box>
      </TableCell>
      <TableCell className={classes.tableCell}>
        {description}
      </TableCell>
    </TableRow>
  );
}

export default function Visibilities(props){
    const defaultValues = {
      instanceVisible: false,
      diskImageVisible: false,
      mediaImageVisible: false,
    }
    const { lang } = props;
    const texts = i18n[lang];
    const classes = useStyles();
    const [ initialed, setInitialed ] = React.useState(false);
    const [ request, setRequest ] = React.useState(defaultValues);
    const [ notifyColor, setNotifyColor ] = React.useState('warning');
    const [ notifyMessage, setNotifyMessage ] = React.useState("");

    const closeNotify = () => {
      setNotifyMessage("");
    }

    const showErrorMessage = React.useCallback((msg) => {
      const notifyDuration = 3000;
      setNotifyColor('warning');
      setNotifyMessage(msg);
      setTimeout(closeNotify, notifyDuration);
    }, [setNotifyColor, setNotifyMessage]);

    const reloadVisibility = React.useCallback(() => {
      const onLoadFail = (err) =>{
        showErrorMessage(err);
      }
      const onLoadSuccess = data => {
        var updated = {
        }
        if(data.instance_visible){
          updated.instanceVisible = true;
        }
        if(data.disk_image_visible){
          updated.diskImageVisible = true;
        }
        if(data.media_image_visible){
          updated.mediaImageVisible = true;
        }
        setRequest(updated);
        setInitialed(true);
      }
      getVisibilities(onLoadSuccess, onLoadFail);
    }, [showErrorMessage]);

    const showNotifyMessage = (msg) => {
      const notifyDuration = 3000;
      setNotifyColor('info');
      setNotifyMessage(msg);
      setTimeout(closeNotify, notifyDuration);
    };

    const handleRequestPropsChanged = name => e =>{
      var checked = e.target.checked
      setRequest(previous => ({
        ...previous,
        [name]: checked,
      }));
    };

    const modify = () =>{
      const onOperateSuccess = () =>{
        showNotifyMessage('Visibilities updated');
        writeLog('Visibilities updated');
      }
      setVisiblities(request.instanceVisible, request.diskImageVisible, request.mediaImageVisible, onOperateSuccess, showErrorMessage);
    }

    React.useEffect(() =>{
      reloadVisibility();
    }, [reloadVisibility]);


    //reder begin
    var session = getLoggedSession();
    if (null === session){
      return redirectToLogin();
    }
    let content;
    if (!initialed){
      content = <Skeleton variant="rect" style={{height: '10rem'}}/>;
    }else{
      content = (
        <OperableTable
          color="primary"
          headers={[texts.visibility, texts.visibility]}
          rows={[
            <VisibilityRow key='instance'
              checked={request.instanceVisible}
              onChange={handleRequestPropsChanged('instanceVisible')}
              label={texts.instance}
              description={texts.instanceDescription}
              classes={classes}/>
            ,
            <VisibilityRow key='disk'
              checked={request.diskImageVisible}
              onChange={handleRequestPropsChanged('diskImageVisible')}
              label={texts.disk}
              description={texts.diskDescription}
              classes={classes}/>
            ,
            <VisibilityRow key='media'
              checked={request.mediaImageVisible}
              onChange={handleRequestPropsChanged('mediaImageVisible')}
              label={texts.media}
              description={texts.mediaDescription}
              classes={classes}/>
            ,
          ]}
          />
      );
    }

    const buttons = [
      <Button key='modify' color="info" onClick={modify}>
        <BuildIcon />{texts.modify}
      </Button>,
    ];

    return (
      <GridContainer>
        <GridItem xs={12}>
          {content}
        </GridItem>
        <GridItem xs={12}>
          <Box display='flex'>
            {
              buttons.map((button, key) =>(
                <Box key={key} m={1}>
                  {button}
                </Box>
              ))
            }
          </Box>
        </GridItem>
        <GridItem>
          <Snackbar
            place="tr"
            color={notifyColor}
            message={notifyMessage}
            open={"" !== notifyMessage}
            closeNotification={closeNotify}
            close
          />
        </GridItem>
      </GridContainer>
    );
}
