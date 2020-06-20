import React from "react";
// @material-ui/core components
import Skeleton from '@material-ui/lab/Skeleton';
import Box from '@material-ui/core/Box';
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from '@material-ui/core/Typography';
import KeyboardHideIcon from '@material-ui/icons/KeyboardHide';
import PowerSettingsNewIcon from '@material-ui/icons/PowerSettingsNew';
import RotateRightIcon from '@material-ui/icons/RotateRight';
import RefreshIcon from '@material-ui/icons/Refresh';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';

// dashboard components
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import Snackbar from "components/Snackbar/Snackbar.js";
import VncDisplay from "views/Instances/VncDisplay.js";
import InsertMediaDialog from "views/Instances/InsertMediaDialog.js";
import { getInstanceConfig, openMonitorChannel, getMonitorURL, ejectMedia,
  stopInstance, restartInstance, resetInstance, writeLog } from "nano_api.js";

const i18n = {
  'en':{
    instance: 'Instance',
    sendKeys: 'Send Ctrl+Alt+Delete',
    stop: 'Stop Instance',
    reboot: 'Reboot Instance',
    reset: 'Reset Instance',
    insertMedia: 'Insert Media',
    ejectMedia: 'Eject Media',
  },
  'cn':{
    instance: '云主机',
    sendKeys: '发送 Ctrl+Alt+Delete',
    stop: '停止云主机',
    reboot: '重启云主机',
    reset: '强制重启云主机',
    insertMedia: '插入光盘镜像',
    ejectMedia: '弹出光盘镜像',
  }
}

export default function ControlInstance(props){
    const instanceID = props.match.params.id;
    const [ channel, setChannel ] = React.useState(null);
    //for dialog
    const [ insertMediaDialogVisible, setInsertMediaDialogVisible ] = React.useState(false);
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

    const showNotifyMessage = (msg) => {
      const notifyDuration = 3000;
      setNotifyColor('info');
      setNotifyMessage(msg);
      writeLog(msg);
      setTimeout(closeNotify, notifyDuration);
    };

    const onMonitorFail = React.useCallback(msg =>{
      showErrorMessage(msg);
    }, [showErrorMessage]);

    //insert media
    const showInsertMediaDialog = () =>{
      setInsertMediaDialogVisible(true);
    }

    const closeInsertMediaDialog = () =>{
      setInsertMediaDialogVisible(false);
    }

    const onInsertMediaSuccess = () =>{
      closeInsertMediaDialog();
      showNotifyMessage('media insert into instance ' + channel.name);
    };

    const handleEjectMedia = () => {
      const onOperateSuccess = () => {
        showNotifyMessage('media of instance ' + channel.name + ' ejected')
      }
      ejectMedia(instanceID, onOperateSuccess, onMonitorFail);
    }

    const handleStopInstance = () =>{
      const onOperateSuccess = () =>{
        showNotifyMessage('instance ' + channel.name + ' stopped');
      }
      stopInstance(instanceID, onOperateSuccess, onMonitorFail);
    }

    const handleRebootInstance = () =>{
      const onOperateSuccess = () =>{
        showNotifyMessage('instance ' + channel.name + ' reboot');
      }
      restartInstance(instanceID, onOperateSuccess, onMonitorFail);
    }

    const handleResetInstance = () =>{
      const onOperateSuccess = () =>{
        showNotifyMessage('instance ' + channel.name + ' reset');
      }
      resetInstance(instanceID, onOperateSuccess, onMonitorFail);
    }

    const handleEmergencyKeys = () =>{
        if(channel&&channel.delegate&&channel.delegate.onEmergency){
          channel.delegate.onEmergency();
        }
    }

    React.useEffect(() =>{
      const onGetInstanceSuccess = status =>{
        const onOpenChannelSuccess = (id, password) =>{
          const channelData = {
            name: status.name,
            pool: status.pool,
            cell: status.cell,
            channel: id,
            password: password,
            delegate: {},
          }
          setChannel(channelData);
        }
        openMonitorChannel(instanceID, onOpenChannelSuccess, onMonitorFail);
      }

      getInstanceConfig(instanceID, onGetInstanceSuccess, onMonitorFail);
    }, [instanceID, onMonitorFail]);


    const { lang } = props;
    const texts = i18n[lang];
    let content, headers;
    if (null === channel){
      content = <Skeleton variant="rect" style={{height: '10rem'}}/>;
      headers = <Box/>;
    }else{
      const url = getMonitorURL(channel.channel);
      content = (
        <VncDisplay
          url={url}
          password={channel.password}
          callback={channel.delegate}
          />
      );
      const operators = [
        {
          tips: texts.sendKeys,
          icon: KeyboardHideIcon,
          handler: handleEmergencyKeys,
        },
        {
          tips: texts.insertMedia,
          icon: ArrowDropDownIcon,
          handler: showInsertMediaDialog,
        },
        {
          tips: texts.ejectMedia,
          icon: ArrowDropUpIcon,
          handler: handleEjectMedia,
        },
        {
          tips: texts.stop,
          icon: PowerSettingsNewIcon,
          handler: handleStopInstance,
        },
        {
          tips: texts.reboot,
          icon: RotateRightIcon,
          handler: handleRebootInstance,
        },
        {
          tips: texts.reset,
          icon: RefreshIcon,
          handler: handleResetInstance,
        },
      ];
      headers = (
        <Box display="flex" alignItems="center">
          <Box flexGrow={1}  fontWeight="fontWeightBold" letterSpacing={10}>
            <Typography component='span'>
              {texts.instance + ': ' + channel.name}
            </Typography>
          </Box>
          {
            operators.map((operator, key) => (
              <Box key={key}>
                <Tooltip
                  title={operator.tips}
                  placement="top"
                  >
                  <IconButton
                    color="inherit"
                    onClick={operator.handler}
                    >
                    {React.createElement(operator.icon)}
                  </IconButton>
                </Tooltip>
              </Box>
            ))
          }
        </Box>
      )
    }

    return (
      <GridContainer>
        <GridItem xs={12} sm={12} md={12}>
          <Card>
            <CardHeader color="primary">
              {headers}
            </CardHeader>
            <CardBody>
              {content}
            </CardBody>
          </Card>
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
        <GridItem>
          <InsertMediaDialog
            lang={lang}
            instanceID={instanceID}
            open={insertMediaDialogVisible}
            onSuccess={onInsertMediaSuccess}
            onCancel={closeInsertMediaDialog}
            />
        </GridItem>
      </GridContainer>
    );
}
