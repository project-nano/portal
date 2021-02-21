import React from "react";
import { Link } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import Checkbox from '@material-ui/core/Checkbox';
import Box from '@material-ui/core/Box';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import StopIcon from '@material-ui/icons/Stop';
import PlayCircleOutlineIcon from '@material-ui/icons/PlayCircleOutline';
import CameraAltIcon from '@material-ui/icons/CameraAlt';
import ReplayIcon from '@material-ui/icons/Replay';
import ShowChartIcon from '@material-ui/icons/ShowChart';
import BackupIcon from '@material-ui/icons/Backup';
import SecurityIcon from '@material-ui/icons/Security';

import DesktopWindowsIcon from '@material-ui/icons/DesktopWindows';
import PowerSettingsNewIcon from '@material-ui/icons/PowerSettingsNew';
import PowerIcon from '@material-ui/icons/Power';
import RotateRightIcon from '@material-ui/icons/RotateRight';
import RefreshIcon from '@material-ui/icons/Refresh';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import AllInclusiveIcon from '@material-ui/icons/AllInclusive';
import AlbumIcon from '@material-ui/icons/Album';

import DeleteIcon from '@material-ui/icons/Delete';
import SettingsIcon from '@material-ui/icons/Settings';
import LocalShippingRoundedIcon from '@material-ui/icons/LocalShippingRounded';

import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import tableStyles from "assets/jss/material-dashboard-react/components/tableStyle.js";
import fontStyles from "assets/jss/material-dashboard-react/components/typographyStyle.js";
import { startInstance, stopInstance, forceStopInstance,
  restartInstance, resetInstance, ejectMedia } from "nano_api";

const i18n = {
  'en':{
    running: 'Running',
    stopped: 'Stopped',
    start: 'Start Instance',
    startWithMedia: 'Start Instance With Media',
    snapshot: 'Snapshot',
    createImage: 'Create Disk Image',
    resetSystem: 'Reset System',
    delete: 'Delete Instance',
    migrate: 'Migrate Instance',
    monitor: 'Monitor Resource Usage',
    detail: 'Instance Detail',
    security: 'Security Policies',
    remoteControl: 'Remote Control',
    stop: 'Stop Instance',
    forceStop: 'Force Stop Instance',
    reboot: 'Reboot Instance',
    reset: 'Reset Instance',
    insertMedia: 'Insert Media',
    ejectMedia: 'Eject Media',
    autoStartup: 'Auto Startup',
    mediaAttached: 'Media Attached',
  },
  'cn':{
    running: '运行中',
    stopped: '已停止',
    start: '启动云主机',
    startWithMedia: '从光盘镜像启动云主机',
    snapshot: '快照',
    createImage: '创建磁盘镜像',
    resetSystem: '重置系统',
    delete: '删除云主机',
    migrate: '迁移云主机',
    monitor: '监控资源用量',
    detail: '实例详情',
    security: '安全策略',
    remoteControl: '远程监控',
    stop: '停止云主机',
    forceStop: '强制终止云主机',
    reboot: '重启云主机',
    reset: '强制重启云主机',
    insertMedia: '插入光盘镜像',
    ejectMedia: '弹出光盘镜像',
    autoStartup: '开机启动',
    mediaAttached: '媒体已加载',
  },
};

export default function InstanceRow(props){
  const tableClasses = makeStyles(tableStyles)();
  const fontClasses = makeStyles(fontStyles)();
  const { lang, instance, onNotify, onError, onDelete,
    onStatusChange, onMediaStart, onInsertMedia, onResetSystem,
    onBuildImage, onMigrateInstance,
    checked, checkable, onCheckStatusChanged} = props;
  const texts = i18n[lang];
  const onStartInstance = (id) =>{
    const onSuccess = (id) =>{
      onNotify('instance ' + id + ' started');
      onStatusChange();
    }
    const onFail = (msg) =>{
      onError('start instance ' + id + ' fail: ' + msg);
    }
    startInstance(id, onSuccess, onFail);
  }

  const onStopInstance = (id) =>{
    const onSuccess = (id) =>{
      onNotify('instance ' + id + ' stopped');
      onStatusChange();
    }
    const onFail = (msg) =>{
      onError('stop instance ' + id + ' fail: ' + msg);
    }
    stopInstance(id, onSuccess, onFail);
  }

  const onForceStopInstance = (id) =>{
    const onSuccess = (id) =>{
      onNotify('instance ' + id + ' force stopped');
      onStatusChange();
    }
    const onFail = (msg) =>{
      onError('force stop instance ' + id + ' fail: ' + msg);
    }
    forceStopInstance(id, onSuccess, onFail);
  }

  const onRebootInstance = (id) =>{
    const onSuccess = (id) =>{
      onNotify('instance ' + id + ' reboot');
      onStatusChange();
    }
    const onFail = (msg) =>{
      onError('reboot instance ' + id + ' fail: ' + msg);
    }
    restartInstance(id, onSuccess, onFail);
  }

  const onResetInstance = (id) =>{
    const onSuccess = (id) =>{
      onNotify('instance ' + id + ' reset');
      onStatusChange();
    }
    const onFail = (msg) =>{
      onError('reset instance ' + id + ' fail: ' + msg);
    }
   resetInstance(id, onSuccess, onFail);
  }

  const onEjectMedia = (id) =>{
    const onSuccess = (id) =>{
      onNotify('media ejected from instance ' + id);
      onStatusChange();
    }
    const onFail = (msg) =>{
      onError('eject media from instance ' + id + ' fail: ' + msg);
    }
   ejectMedia(id, onSuccess, onFail);
  }

  const handleMigrateInstance = (id) => {
    onMigrateInstance(id, instance.pool, instance.cell);
  }

  const handleCheckChanged = e => {
    const isChecked = e.target.checked;
    onCheckStatusChanged(isChecked, instance.id);
  }

  const startOperator = {
    tips: texts.start,
    icon: PlayArrowIcon,
    handler: onStartInstance,
  };
  const startWithMediaOperator = {
    tips: texts.startWithMedia,
    icon: PlayCircleOutlineIcon,
    handler: onMediaStart,
  };
  const snapshotOperator = {
    tips: texts.snapshot,
    icon: CameraAltIcon,
    href: '/admin/instances/snapshots/' + instance.id,
  };
  const createImageOperator = {
    tips: texts.createImage,
    icon: BackupIcon,
    handler: onBuildImage,
  };
  const resetSystemOperator = {
    tips: texts.resetSystem,
    icon: ReplayIcon,
    handler: onResetSystem,
  };

  const deleteOperator = {
    tips: texts.delete,
    icon: DeleteIcon,
    handler: onDelete,
  };
  const migrateOperator = {
    tips: texts.migrate,
    icon: LocalShippingRoundedIcon,
    handler: handleMigrateInstance,
  };

  const monitorOperator = {
    tips: texts.monitor,
    icon: ShowChartIcon,
    href: '/admin/instances/status/' + instance.id,
    target: '_blank',
  };

  const detailOperator = {
    tips: texts.detail,
    icon: SettingsIcon,
    href: '/admin/instances/details/' + instance.id,
    target: '_blank',
  };
  const securityOperator = {
    tips: texts.security,
    icon: SecurityIcon,
    href: '/admin/instances/policies/' + instance.id,
  };


  //for running instance
  const controllOperator = {
    tips: texts.remoteControl,
    icon: DesktopWindowsIcon,
    href: '/monitor/' + instance.id,
    target: '_blank',
  };
  const stopOperator = {
    tips: texts.stop,
    icon: PowerSettingsNewIcon,
    handler: onStopInstance,
  };
  const forceStopOperator = {
    tips: texts.forceStop,
    icon: PowerIcon,
    handler: onForceStopInstance,
  };
  const rebootOperator = {
    tips: texts.reboot,
    icon: RotateRightIcon,
    handler: onRebootInstance,
  };
  const resetOperator = {
    tips: texts.reset,
    icon: RefreshIcon,
    handler: onResetInstance,
  };
  const insertMediaOperator = {
    tips: texts.insertMedia,
    icon: ArrowDropDownIcon,
    handler: onInsertMedia,
  };
  const ejectMediaOperator = {
    tips: texts.ejectMedia,
    icon: ArrowDropUpIcon,
    handler: onEjectMedia,
  };

  let statusIcon;
  var operators = [];
  if (instance.running){
    const runningIcon = (
      <Tooltip
        title={texts.running}
        placement="top"
        key={texts.running}
        >
        <PlayArrowIcon className={fontClasses.successText}/>
      </Tooltip>
    );
    statusIcon = [runningIcon];
    operators = [ controllOperator, stopOperator, forceStopOperator,
      rebootOperator, resetOperator];
    if (instance.auto_start){
      statusIcon.push((
        <Tooltip
          title={texts.autoStartup}
          placement="top"
          key={texts.autoStartup}
          >
          <AllInclusiveIcon className={fontClasses.infoText}/>
        </Tooltip>
      ));
    }
    if (instance.media_attached){
      statusIcon.push((
        <Tooltip
          title={texts.mediaAttached}
          placement="top"
          key={texts.mediaAttached}
          >
          <AlbumIcon className={fontClasses.infoText}/>
        </Tooltip>
      ));
      operators.push(ejectMediaOperator);
    }else{
      operators.push(insertMediaOperator);
    }
    operators = operators.concat([monitorOperator, detailOperator, securityOperator]);
  }else{
    const stoppedIcon = (
      <Tooltip
        title={texts.stopped}
        placement="top"
        key={texts.stopped}
        >
        <StopIcon className={fontClasses.dangerText}/>
      </Tooltip>
    );
    statusIcon = [stoppedIcon];
    if (instance.auto_start){
      statusIcon.push((
        <Tooltip
          title={texts.autoStartup}
          placement="top"
          key={texts.autoStartup}
          >
          <AllInclusiveIcon className={fontClasses.infoText}/>
        </Tooltip>
      ));
    }
    operators = [startOperator, startWithMediaOperator, snapshotOperator,
      createImageOperator, resetSystemOperator, deleteOperator,
      migrateOperator, monitorOperator, detailOperator, securityOperator];
  }
  var addressLabel = '';
  if (instance.internal && instance.internal.network_address){
    addressLabel = instance.internal.network_address;
  }
  if (instance.external && instance.external.network_address){
    addressLabel += '/' + instance.external.network_address;
  }
  const GiB = 1 << 30;
  const MiB = 1 << 20;
  var memoryLabel;
  if (instance.memory >= GiB ){
    memoryLabel = (instance.memory / GiB) + ' GB';
  }else{
    memoryLabel = (instance.memory / MiB) + ' MB';
  }

  var disks = [];
  instance.disks.forEach(size => {
    disks.push((size / GiB).toFixed(2).toString());
  });
  var diskLabel = disks.join('/') + ' GB';

  let rowHeader;
  if(checkable){
    rowHeader = (
      <Box display='flex' alignItems="center">
        <Box>
          <Checkbox
            checked={checked}
            onChange={ e => handleCheckChanged(e)}
            value={instance.id}
            />
        </Box>
        <Box>
          {instance.name}
        </Box>
      </Box>
    );
  }else{
    rowHeader = instance.name;
  }

  return (
    <TableRow className={tableClasses.tableBodyRow}>
      <TableCell className={tableClasses.tableCell}>
        {rowHeader}
      </TableCell>
      <TableCell className={tableClasses.tableCell}>
        {instance.host? instance.host: instance.cell}
      </TableCell>
      <TableCell className={tableClasses.tableCell}>
        {addressLabel}
      </TableCell>
      <TableCell className={tableClasses.tableCell}>
        {instance.cores}
      </TableCell>
      <TableCell className={tableClasses.tableCell}>
        {memoryLabel}
      </TableCell>
      <TableCell className={tableClasses.tableCell}>
        {diskLabel}
      </TableCell>
      <TableCell className={tableClasses.tableCell}>
        {statusIcon}
      </TableCell>
      <TableCell className={tableClasses.tableCell}>
      {
        operators.map((operator, key) => {
          var icon = React.createElement(operator.icon);
          let button;
          if (operator.href){
            button = (
              <Link to={operator.href} target={operator.target}>
                <IconButton
                  color="inherit"
                  >
                  {icon}
                </IconButton>
              </Link>
            );
          }else{
            button = (
              <IconButton
                color="inherit"
                onClick={()=>{
                  if(null !== operator.handler){
                    operator.handler(instance.id);
                  }
                }}
                >
                {icon}
              </IconButton>
            );
          }
          return (
            <Tooltip
              title={operator.tips}
              placement="top"
              key={key}
              >
              {button}
            </Tooltip>
          )
        })
      }
      </TableCell>
    </TableRow>
  )
}
