import React from "react";
// @material-ui/core components
import Skeleton from '@material-ui/lab/Skeleton';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import TableContainer from '@material-ui/core/TableContainer';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Divider from '@material-ui/core/Divider';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import LockIcon from '@material-ui/icons/Lock';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import BuildIcon from '@material-ui/icons/Build';
import ZoomOutMapIcon from '@material-ui/icons/ZoomOutMap';
import SystemUpdateAltIcon from '@material-ui/icons/SystemUpdateAlt';
import AutorenewIcon from '@material-ui/icons/Autorenew';

// dashboard components
import Button from "components/CustomButtons/Button.js";
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import Snackbar from "components/Snackbar/Snackbar.js";
import IconButton from "components/CustomButtons/IconButton";
import ModifyNameDialog from 'views/Instances/ModifyNameDialog';
import ModifyCoresDialog from 'views/Instances/ModifyCoresDialog';
import ModifyMemoryDialog from 'views/Instances/ModifyMemoryDialog';
import ModifyPasswordDialog from 'views/Instances/ModifyPasswordDialog';
import ModifyDiskSizeDialog from 'views/Instances/ModifyDiskSizeDialog';
import ShrinkDiskSizeDialog from 'views/Instances/ShrinkDiskSizeDialog';
import ModifyCPUPriorityDialog from 'views/Instances/ModifyCPUPriorityDialog';
import ModifyDiskIOPSDialog from 'views/Instances/ModifyDiskIOPSDialog';
import ModifyNetworkBandwidthDialog from 'views/Instances/ModifyNetworkBandwidthDialog';
import ResetSecretDialog from "views/Instances/ResetSecretDialog";
import { bytesToString, bpsToString } from 'utils.js';
import { getInstanceConfig, getInstanceAdminPassword, writeLog } from "nano_api.js";

const i18n = {
  'en':{
    title: 'Details of Instance ',
    back: 'Back',
    name: 'Name',
    id: 'ID',
    cores: 'Cores',
    memory: 'Memory',
    adminPassword: 'Admin Password',
    monitorAddress: 'Monitor Address',
    monitorSecret: 'Monitor Secret',
    systemDisk: 'System Disk',
    dataDisk: 'Data Disk',
    ethernetAddress: 'Ethernet Address',
    internalAddress: 'Internal Address',
    allocatedAddress: 'Allocated Address',
    externalAddress: 'External Address',
    operatingSystem: 'Operating System',
    autoStartup: 'Auto Startup',
    on: 'On',
    off: 'Off',
    pool: 'Host Pool',
    cell: 'Host Cell',
    owner: 'Owner',
    group: 'Group',
    cpuPriority: 'CPU Priority',
    iops: 'Disk IOPS',
    bandwidth: 'Inbound/Outbound Bandwidth',
    noLimit: 'No Limit',
    cpuPriorityHigh: 'High',
    cpuPriorityMedium: 'Medium',
    cpuPriorityLow: 'Low',
    createdTime: 'Created Time',
    disabledWhenRunning: 'Disabled When Running',
    disabledWhenStopped: 'Disabled When Stopped',
    status: 'Status',
    running: 'Running',
    stopped: 'Stopped',
    display: 'Display',
    hide: 'Hide',
    modify: 'Modify',
    extendDisk: 'Extend Disk Size',
    shrinkDisk: 'Shrink Disk Size',
    resetSecret: "Reset Monitor Secret",
  },
  'cn':{
    title: '云主机详情 ',
    back: '返回',
    name: '主机名',
    id: 'ID',
    cores: '核心数',
    memory: '内存',
    adminPassword: '管理员密码',
    monitorAddress: '监控地址',
    monitorSecret: '监控密码',
    systemDisk: '系统磁盘',
    dataDisk: '数据磁盘',
    ethernetAddress: 'MAC地址',
    internalAddress: '内部地址',
    allocatedAddress: '已分配地址',
    externalAddress: '外部地址',
    operatingSystem: '操作系统',
    autoStartup: '开机启动',
    on: '打开',
    off: '关闭',
    pool: '所属资源池',
    cell: '承载资源节点',
    owner: '所属用户',
    group: '所属用户组',
    cpuPriority: 'CPU优先级',
    iops: '磁盘 IOPS',
    bandwidth: '下/上行带宽',
    noLimit: '无限制',
    cpuPriorityHigh: '高',
    cpuPriorityMedium: '中',
    cpuPriorityLow: '低',
    createdTime: '创建时间',
    disabledWhenRunning: '运行时禁用',
    disabledWhenStopped: '停机时禁用',
    status: '状态',
    running: '运行中',
    stopped: '已停机',
    display: '显示',
    hide: '隐藏',
    modify: '修改',
    extendDisk: '扩展磁盘容量',
    shrinkDisk: '缩减磁盘空间',
    resetSecret: "重置监控密码",
  }
}

export default function Details(props){
    const guestID = props.match.params.id;
    const [ guest, setGuest] = React.useState(null);
    const [ adminPassword, setAdminPassword ] = React.useState(null);
    const [ secretVisiable, setSecretVisiable ] = React.useState(false);

    //for dialog
    const [ modifyNameVisiable, setModifyNameVisible ] = React.useState(false);
    const [ modifyCoresVisiable, setModifyCoresVisible ] = React.useState(false);
    const [ modifyMemoryVisiable, setModifyMemoryVisible ] = React.useState(false);
    const [ modifyPasswordVisiable, setModifyPasswordVisible ] = React.useState(false);
    const [ modifyDiskSizeVisiable, setModifyDiskSizeVisible ] = React.useState(false);
    const [ shrinkDiskSizeVisiable, setShrinkDiskSizeVisible ] = React.useState(false);
    const [ modifyCPUPriorityVisiable, setModifyCPUPriorityVisible ] = React.useState(false);
    const [ modifyDiskIOPSVisiable, setModifyDiskIOPSVisible ] = React.useState(false);
    const [ modifyNetworkBandwidthVisiable, setModifyNetworkBandwidthVisible ] = React.useState(false);
    const [ resetSecretVisiable, setResetSecretVisible ] = React.useState(false);
    const [ diskIndex, setDiskIndex ] = React.useState(0);
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

    const onFail = React.useCallback(msg =>{
      showErrorMessage(msg);
    }, [showErrorMessage]);

    const reloadGuestConfig = React.useCallback(() => {
      const onGetConfigSuccess = data =>{
        setGuest(data);
      }

      getInstanceConfig(guestID, onGetConfigSuccess, onFail);

    }, [guestID, onFail]);

    //modify name
    const showModifyNameDialog = () =>{
      setModifyNameVisible(true);
    };

    const closeModifyNameDialog = () =>{
      setModifyNameVisible(false);
    }

    const onModifyNameSuccess = newName =>{
      closeModifyNameDialog();
      showNotifyMessage('name of '+ guestID + ' changed to ' + newName);
      reloadGuestConfig();
    };

    //modify cores
    const showModifyCoresDialog = () =>{
      setModifyCoresVisible(true);
    };

    const closeModifyCoresDialog = () =>{
      setModifyCoresVisible(false);
    }

    const onModifyCoresSuccess = newCores =>{
      closeModifyCoresDialog();
      showNotifyMessage('cores of '+ guestID + ' changed to ' + newCores);
      reloadGuestConfig();
    };

    //modify memory
    const showModifyMemoryDialog = () =>{
      setModifyMemoryVisible(true);
    };

    const closeModifyMemoryDialog = () =>{
      setModifyMemoryVisible(false);
    }

    const onModifyMemorySuccess = newMemory =>{
      closeModifyMemoryDialog();
      showNotifyMessage('memory of '+ guestID + ' changed to ' + bytesToString(newMemory));
      reloadGuestConfig();
    };

    //modify memory
    const showModifyPasswordDialog = () =>{
      setModifyPasswordVisible(true);
    };

    const closeModifyPasswordDialog = () =>{
      setModifyPasswordVisible(false);
    }

    const onModifyPasswordSuccess = adminName =>{
      closeModifyPasswordDialog();
      showNotifyMessage('password of '+ adminName + ' modified');
      reloadGuestConfig();
    };

    //modify disk Size
    const showModifyDiskSizeDialog = index =>{
      setModifyDiskSizeVisible(true);
      setDiskIndex(index);
    };

    const closeModifyDiskSizeDialog = () =>{
      setModifyDiskSizeVisible(false);
    }

    const onModifyDiskSizeSuccess = (index, size) =>{
      closeModifyDiskSizeDialog();
      showNotifyMessage('size of disk '+ index + ' changed to ' + bytesToString(size));
      reloadGuestConfig();
    };

    //shrink disk Size
    const showShrinkDiskSizeDialog = index =>{
      setShrinkDiskSizeVisible(true);
      setDiskIndex(index);
    };

    const closeShrinkDiskSizeDialog = () =>{
      setShrinkDiskSizeVisible(false);
    }

    const onShrinkDiskSizeSuccess = index =>{
      closeShrinkDiskSizeDialog();
      showNotifyMessage('size of disk '+ index + ' shrunk');
      reloadGuestConfig();
    };

    //modify CPU priority
    const showModifyCPUPriorityDialog = () =>{
      setModifyCPUPriorityVisible(true);
    };

    const closeModifyCPUPriorityDialog = () =>{
      setModifyCPUPriorityVisible(false);
    }

    const onModifyCPUPrioritySuccess = priority =>{
      closeModifyCPUPriorityDialog();
      showNotifyMessage('CPU priority changed to '+ priority);
      reloadGuestConfig();
    };

    //modify disk IOPS
    const showModifyDiskIOPSDialog = () =>{
      setModifyDiskIOPSVisible(true);
    };

    const closeModifyDiskIOPSDialog = () =>{
      setModifyDiskIOPSVisible(false);
    }

    const onModifyDiskIOPSSuccess = iops =>{
      closeModifyDiskIOPSDialog();
      showNotifyMessage('Disk IOPS changed to '+ iops);
      reloadGuestConfig();
    };

    //modify network bandwidth
    const showModifyNetworkBandwidthDialog = () =>{
      setModifyNetworkBandwidthVisible(true);
    };

    const closeModifyNetworkBandwidthDialog = () =>{
      setModifyNetworkBandwidthVisible(false);
    }

    const onModifyNetworkBandwidthSuccess = (inbound, outbound) =>{
      closeModifyNetworkBandwidthDialog();
      var value = [bpsToString(inbound), bpsToString(outbound)].join('/');
      showNotifyMessage('network bandwidth changed to ' + value);
      reloadGuestConfig();
    };

    //reset monitor secret
    const showResetSecretDialog = () =>{
      setResetSecretVisible(true);
    };

    const closeResetSecretDialog = () =>{
      setResetSecretVisible(false);
    }

    const onResetSecretSuccess = () =>{
      closeResetSecretDialog();
      showNotifyMessage("monitor secret reset");
      reloadGuestConfig();
    };

    React.useEffect(() =>{
      reloadGuestConfig();
    }, [reloadGuestConfig]);

    const { lang } = props;
    const texts = i18n[lang];
    let content, title;
    var buttons = [];
    if (null === guest){
      content = <Skeleton variant="rect" style={{height: '10rem'}}/>;
      title = '';
    }else{
      const disabledWhenRunningIcon = {
        label: texts.disabledWhenRunning,
        icon: LockIcon,
      };
      const disabledWhenStoppedIcon = {
        label: texts.disabledWhenStopped,
        icon: LockIcon,
      };

      let monitorAddress;
      if(guest.display_protocol){
        monitorAddress = guest.display_protocol + '://' + guest.internal.display_address;
      }else{
        monitorAddress = 'vnc://' + guest.internal.display_address
      }
      let inbound, outbound;
      if (guest.qos&&guest.qos.send_speed&& 0 !== guest.qos.receive_speed){
        inbound = bpsToString(guest.qos.receive_speed);
      }else{
        inbound = texts.noLimit;
      }

      if (guest.qos&&guest.qos.receive_speed&& 0 !== guest.qos.send_speed){
        outbound = bpsToString(guest.qos.send_speed);
      }else{
        outbound = texts.noLimit;
      }

      const bandwidthLabel = [inbound, outbound].join(' / ');
      const hideAdminPassword = () => setAdminPassword(null);
      const showAdminPassword = () => {
        const onQuerySuccess = (user, password) =>{
          if(password){
            setAdminPassword(password);
          }else{
            setAdminPassword('no password configured for user "' + user + '"');
          }
        }
        getInstanceAdminPassword(guestID, onQuerySuccess, onFail);
      };

      var adminPasswordOperators = [];
      if (adminPassword){
        adminPasswordOperators.push({label:texts.hide, icon: VisibilityOffIcon, onClick: hideAdminPassword});
      }else{
        adminPasswordOperators.push({label:texts.display, icon: VisibilityIcon, onClick: showAdminPassword});
      }
      if (guest.running){
        adminPasswordOperators.push({label:texts.modify, icon:BuildIcon, onClick:showModifyPasswordDialog});
      }else{
        adminPasswordOperators.push(disabledWhenStoppedIcon);
      }

      var tableData = [
        {
          title: texts.name,
          value: guest.name,
          operators: guest.running ? [disabledWhenRunningIcon] :
            [{label:texts.modify, icon:BuildIcon, onClick:showModifyNameDialog}],
        },
        {
          title: texts.id,
          value: guestID,
        },
        {
          title: texts.cores,
          value: guest.cores,
          operators: guest.running ? [disabledWhenRunningIcon] :
            [{label:texts.modify, icon:BuildIcon, onClick:showModifyCoresDialog}],
        },
        {
          title: texts.memory,
          value: bytesToString(guest.memory),
          operators: guest.running ? [disabledWhenRunningIcon] :
            [{label:texts.modify, icon:BuildIcon, onClick:showModifyMemoryDialog}],
        },
        {
          title: texts.status,
          value: guest.running? texts.running : texts.stopped,
        },
        {
          title: texts.ethernetAddress,
          value: guest.ethernet_address,
        },

        {
          title: texts.createdTime,
          value: guest.create_time,
        },
        {
          title: texts.adminPassword,
          value: adminPassword ? adminPassword : '****************',
          operators: adminPasswordOperators,
        },
        {
          title: texts.monitorAddress,
          value: guest.internal? monitorAddress : '',
        },
        {
          title: texts.monitorSecret,
          value: secretVisiable? guest.monitor_secret : new Array(guest.monitor_secret.length).fill('*'),
          operators: secretVisiable? [
            {label:texts.hide, icon:VisibilityOffIcon, onClick:() => setSecretVisiable(false)},
            {label:texts.resetSecret, icon:AutorenewIcon, onClick:showResetSecretDialog}
          ] : [
            {label:texts.display, icon:VisibilityIcon, onClick:() => setSecretVisiable(true)},
            {label:texts.resetSecret, icon:AutorenewIcon, onClick:showResetSecretDialog}
          ],
        },
        {
          title: texts.systemDisk,
          value: bytesToString(guest.disks[0]),
          operators: guest.running ? [disabledWhenRunningIcon] : [
            {label:texts.extendDisk, icon:ZoomOutMapIcon, onClick:() => showModifyDiskSizeDialog(0)},
            {label:texts.shrinkDisk, icon:SystemUpdateAltIcon, onClick:() => showShrinkDiskSizeDialog(0)},
          ],
        },
      ];

      if (guest.disks.length > 1){
        for(var index = 1; index < guest.disks.length; index++){
          const currentIndex = index;
          tableData.push({
            title: texts.dataDisk + index.toString(),
            value: bytesToString(guest.disks[index]),
            operators: guest.running ? [disabledWhenRunningIcon] : [
              {label:texts.extendDisk, icon:ZoomOutMapIcon, onClick:() => showModifyDiskSizeDialog(currentIndex)},
              {label:texts.shrinkDisk, icon:SystemUpdateAltIcon, onClick:() => showShrinkDiskSizeDialog(currentIndex)},
            ],
          })
        }
      }

      let priorityLabel;
      if (guest.qos&&guest.qos.cpu_priority){
        switch (guest.qos.cpu_priority) {
          case 'high':
            priorityLabel = texts.cpuPriorityHigh;
            break;
          case 'medium':
            priorityLabel = texts.cpuPriorityMedium;
            break;
          case 'low':
            priorityLabel = texts.cpuPriorityLow;
            break;
          default:
            priorityLabel = 'invalid priority ' + guest.qos.cpu_priority;
        }
      }else{
        priorityLabel = texts.noLimit;
      }


      tableData = tableData.concat([
        {
          title: texts.internalAddress,
          value: guest.internal&&guest.internal.network_address? guest.internal.network_address : '',
        },
        {
          title: texts.allocatedAddress,
          value: guest.internal&&guest.internal.allocated_address? guest.internal.allocated_address : '',
        },
        {
          title: texts.externalAddress,
          value: guest.external&&guest.external.network_address? guest.external.network_address : '',
        },
        {
          title: texts.operatingSystem,
          value: guest.system,
        },
        {
          title: texts.autoStartup,
          value: guest.auto_start ? texts.on : texts.off,
        },
        {
          title: texts.pool,
          value: guest.pool,
        },
        {
          title: texts.cell,
          value: guest.cell,
        },
        {
          title: texts.cpuPriority,
          value: priorityLabel,
          operators: [{label:texts.modify, icon:BuildIcon, onClick:showModifyCPUPriorityDialog}],
        },
        {
          title: texts.iops,
          value: guest.qos&&guest.qos.write_iops ? guest.qos.write_iops : texts.noLimit,
          operators: guest.running ? [disabledWhenRunningIcon] : [
            {label:texts.modify, icon:BuildIcon, onClick:showModifyDiskIOPSDialog},
          ],
        },
        {
          title: texts.bandwidth,
          value: bandwidthLabel,
          operators: [{label:texts.modify, icon:BuildIcon, onClick:showModifyNetworkBandwidthDialog}]
        },
      ]);
      content = (
        <Container maxWidth='md'>
        <TableContainer component={Paper}>
          <Table>
            <TableBody>
              {
                tableData.map((row, key) => (
                  <TableRow key={key}>
                    <TableCell component='th' scope='row'>
                      {row.title}
                    </TableCell>
                    <TableCell>
                      {row.value}
                    </TableCell>
                    <TableCell>
                      {
                        row.operators?
                        row.operators.map(({ label, icon, onClick }, key) => (
                            <IconButton key={key} label={label} icon={icon} onClick={onClick}/>
                        ))
                        : ''
                      }
                    </TableCell>
                  </TableRow>
                ))
              }
            </TableBody>
          </Table>
        </TableContainer>
        </Container>
      )

      title = texts.title + guest.name;
      buttons = [
        <Button size="sm" color="info" round onClick={() =>{
          props.history.goBack();
          }}>
          <NavigateBeforeIcon />{texts.back}
        </Button>,
      ];
    }

    return (
      <GridContainer>
        <GridItem xs={12}>
          <Box display='flex'>
          {
            buttons.map((button, key) => (
              <Box key={key} pl={2} pr={2}>
                {button}
              </Box>
            ))
          }
          </Box>
        </GridItem>
        <GridItem xs={12}>
          <Box mt={3} mb={3}>
            <Divider/>
          </Box>
        </GridItem>
        <GridItem xs={12} sm={12} md={12}>
          <Card>
            <CardHeader color="primary">
              {title}
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
          <ModifyNameDialog
            lang={lang}
            open={modifyNameVisiable}
            instanceID={guestID}
            current={guest}
            onSuccess={onModifyNameSuccess}
            onCancel={closeModifyNameDialog}
            />
        </GridItem>
        <GridItem>
          <ModifyCoresDialog
            lang={lang}
            open={modifyCoresVisiable}
            instanceID={guestID}
            current={guest}
            onSuccess={onModifyCoresSuccess}
            onCancel={closeModifyCoresDialog}
            />
        </GridItem>
        <GridItem>
          <ModifyMemoryDialog
            lang={lang}
            open={modifyMemoryVisiable}
            instanceID={guestID}
            current={guest}
            onSuccess={onModifyMemorySuccess}
            onCancel={closeModifyMemoryDialog}
            />
        </GridItem>
        <GridItem>
          <ModifyPasswordDialog
            lang={lang}
            open={modifyPasswordVisiable}
            instanceID={guestID}
            onSuccess={onModifyPasswordSuccess}
            onCancel={closeModifyPasswordDialog}
            />
        </GridItem>
        <GridItem>
          <ModifyDiskSizeDialog
            lang={lang}
            open={modifyDiskSizeVisiable}
            instanceID={guestID}
            current={guest}
            index={diskIndex}
            onSuccess={onModifyDiskSizeSuccess}
            onCancel={closeModifyDiskSizeDialog}
            />
        </GridItem>
        <GridItem>
          <ShrinkDiskSizeDialog
            lang={lang}
            open={shrinkDiskSizeVisiable}
            instanceID={guestID}
            current={guest}
            index={diskIndex}
            onSuccess={onShrinkDiskSizeSuccess}
            onCancel={closeShrinkDiskSizeDialog}
            />
        </GridItem>
        <GridItem>
          <ModifyCPUPriorityDialog
            lang={lang}
            open={modifyCPUPriorityVisiable}
            instanceID={guestID}
            current={guest}
            onSuccess={onModifyCPUPrioritySuccess}
            onCancel={closeModifyCPUPriorityDialog}
            />
        </GridItem>
        <GridItem>
          <ModifyDiskIOPSDialog
            lang={lang}
            open={modifyDiskIOPSVisiable}
            instanceID={guestID}
            current={guest}
            onSuccess={onModifyDiskIOPSSuccess}
            onCancel={closeModifyDiskIOPSDialog}
            />
        </GridItem>
        <GridItem>
          <ModifyNetworkBandwidthDialog
            lang={lang}
            open={modifyNetworkBandwidthVisiable}
            instanceID={guestID}
            current={guest}
            onSuccess={onModifyNetworkBandwidthSuccess}
            onCancel={closeModifyNetworkBandwidthDialog}
            />
        </GridItem>
        <ResetSecretDialog
          lang={lang}
          open={resetSecretVisiable}
          guestID={guestID}
          guestName={guest? guest.name : ""}
          onSuccess={onResetSecretSuccess}
          onCancel={closeResetSecretDialog}
          />
      </GridContainer>
    );
}
