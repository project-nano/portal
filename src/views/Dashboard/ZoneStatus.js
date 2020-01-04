import React from "react";
import { Link } from "react-router-dom";
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Box from '@material-ui/core/Box';
import Skeleton from '@material-ui/lab/Skeleton';
import AllOutIcon from '@material-ui/icons/AllOut';

// core components
import Button from "components/CustomButtons/Button.js";
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import PieCard from "views/Dashboard/PieCard.js";
import LineCard from "views/Dashboard/LineCard.js";
import StackedBarCard from "views/Dashboard/StackedBarCard.js";
import MultiBarCard from "views/Dashboard/MultiBarCard.js";

import { getLoggedSession, redirectToLogin, truncateToRadix, bpsToString } from 'utils.js';
import { getZoneStatus } from "nano_api.js";

import {
  primaryColor,
  infoColor,
  successColor,
  warningColor,
  grayColor,
  whiteColor,
} from "assets/jss/material-dashboard-react.js";

const i18n = {
  'en':{
    allButton: "Show All Compute Pools",
    pools: 'Compute Pools Summary',
    cells: 'Compute Cells Summary',
    instances: 'Instances Summary',
    disks: 'Storage Space Summary',
    coreUsage: 'Core Usage',
    memoryUsage: 'Memory Usage',
    ioUsage: 'IO Usage',
    enabled: 'Enabled',
    disabled: 'Disabled',
    online: 'Online',
    offline: 'Offline',
    stopped: 'Stopped',
    running: 'Running',
    lost: 'Lost',
    migrate: 'Migrating',
    used: 'Used',
    available: 'Available',
    coresUsed: 'Cores Used',
    network: 'Network Usage',
    diskIO: 'Disk IO',
    receive: 'Receive',
    send: 'Send',
    write: 'Write',
    read: 'Read',
  },
  'cn':{
    allButton: "查看所有资源池",
    pools: '计算资源池总数',
    cells: '资源节点总数',
    instances: '云主机总数',
    disks: '总磁盘空间',
    coreUsage: 'CPU用量',
    memoryUsage: '内存用量',
    ioUsage: 'IO吞吐量',
    enabled: '启用',
    disabled: '禁用',
    online: '在线',
    offline: '离线',
    stopped: '停止',
    running: '运行',
    lost: '失联',
    migrate: '迁移中',
    used: '已用',
    available: '可用',
    coresUsed: '核心已占用',
    network: '网络流量',
    diskIO: '磁盘IO',
    receive: '接收',
    send: '发送',
    write: '写磁盘',
    read: '读磁盘',
  }
}

const seriesColor1 = infoColor[0];
const seriesColor2 = successColor[0];
const seriesColor3 = warningColor[0];
const seriesColor4 = primaryColor[0];
const disabledColor = grayColor[2];

export default function ZoneStatus(props) {
  const CoreArraySize = 6;
  const MemoryArraySize = 10;
  const NetworkIOArraySize = 10;
  const DiskIOArraySize = 10;
  const [ status, setStatus ] = React.useState(null);
  const { lang } = props;
  const texts = i18n[lang];

  React.useEffect(() =>{
    var mounted = true
    var coreRecords = new Array(CoreArraySize).fill({
      current: 0,
      max: 0,
    });
    var memoryRecords = new Array(MemoryArraySize).fill({
      available: 0,
      used: 0,
    });
    var networkRecords = new Array(NetworkIOArraySize).fill({
      receive: 0,
      send: 0,
    });
    var diskRecords = new Array(DiskIOArraySize).fill({
      write: 0,
      read: 0,
    });

    const queryZoneStatus = () =>{
      const MiB = 1 << 20;
      const onOperateSuccess = s => {
        coreRecords.shift();
        coreRecords.push({
          current: truncateToRadix(s.cpu_usage, 2),
          max: s.max_cpu,
        });
        memoryRecords.shift();
        memoryRecords.push({
          available: truncateToRadix(s.available_memory/MiB, 2),
          used: truncateToRadix((s.max_memory - s.available_memory)/MiB, 2),
        });
        networkRecords.shift();
        networkRecords.push({
          receive: s.receive_speed,
          send: s.send_speed,
          // receive: 100 * MiB * Math.random(),
          // send: 100 * MiB * Math.random(),
        });
        diskRecords.shift();
        diskRecords.push({
          write: s.write_speed,
          read: s.read_speed,
          // write: 10 * MiB * Math.random(),
          // read: 10 * MiB * Math.random(),
        });

        setStatus({
          ...s,
          coreRecords: coreRecords,
          memoryRecords: memoryRecords,
          networkRecords: networkRecords,
          diskRecords: diskRecords,
        });
      }
      getZoneStatus(onOperateSuccess);
    }

    queryZoneStatus();
    const updateInterval = 2 * 1000;
    var timerID = setInterval(()=>{
      if (mounted){
        queryZoneStatus();
      }
    }, updateInterval);
    return () =>{
      mounted = false;
      clearInterval(timerID);
    }
  }, []);

  //reder begin
  var session = getLoggedSession();
  if (null === session){
    return redirectToLogin();
  }

  let content;
  if (!status){
    content = <Skeleton variant="rect" style={{height: '10rem'}}/>;
  }else{
    var startTime = new Date(status.start_time);
    var now = new Date();
    var elapsedSeconds = Math.floor((now.getTime() - startTime.getTime())/1000);
    var elapsedDays = Math.floor(elapsedSeconds/(24*3600));
    elapsedSeconds -= elapsedDays*24*3600;
    var elapsedHours = Math.floor(elapsedSeconds/3600);
    elapsedSeconds -= elapsedHours*3600;
    var elapsedMinutes = Math.floor(elapsedSeconds/60);
    elapsedSeconds -= elapsedMinutes*60;
    let uptimeText;
    if('cn' === lang){
      uptimeText = '系统启动时间 ' + status.start_time + ', 已运行 ' + elapsedDays + ' 天 ' + elapsedHours + ' 小时 ' + elapsedMinutes + ' 分 ' + elapsedSeconds + ' 秒';
    }else{
      uptimeText = 'System start at ' + status['start_time'] + ', Uptime: ' + elapsedDays + ' day, ' + elapsedHours + ' hour, ' + elapsedMinutes + ' min, ' + elapsedSeconds + ' secs';
    }

    const updateTime = (
      <GridItem xs={12} key='uptime'>
        <Box align='center'>
          <Typography component='span' >
            {uptimeText}
          </Typography>
        </Box>
      </GridItem>
    )

    const [ disabledPools, enabledPools ] = status.pools;
    const poolData = [{
      value: disabledPools,
      label: texts.disabled,
      color: disabledColor,
    },{
      value: enabledPools,
      label: texts.enabled,
      color: seriesColor1,
    }];
    const poolChart = (
      <GridItem xs={6} sm={4} md={3} key='pool'>
        <PieCard
          title={texts.pools}
          series={poolData}
          />
      </GridItem>
    )

    const [ offlineCell, onlineCell ] = status.cells;
    const cellData = [{
      value: offlineCell,
      label: texts.offline,
      color: disabledColor,
    },{
      value: onlineCell,
      label: texts.online,
      color: seriesColor2,
    }];
    const cellChart = (
      <GridItem xs={6} sm={4} md={3} key='cell'>
        <PieCard
          title={texts.cells}
          series={cellData}
          />
      </GridItem>
    )

    const [ stoppedInstance, runningInstance, lostInstance, migrateInstance ] = status.instances;
    const instanceData = [{
      value: stoppedInstance,
      label: texts.stopped,
      color: disabledColor,
    },{
      value: runningInstance,
      label: texts.running,
      color: seriesColor1,
    },{
      value: lostInstance,
      label: texts.lost,
      color: seriesColor3,
    },{
      value: migrateInstance,
      label: texts.migrate,
      color: seriesColor4,
    }];
    const instanceChart = (
      <GridItem xs={6} sm={4} md={3} key='instance'>
        <PieCard
          title={texts.instances}
          series={instanceData}
          />
      </GridItem>
    )

    const GiB = 1 << 30;
    const availableDisk = truncateToRadix(status.available_disk / GiB, 2);
    const usedDisk = truncateToRadix((status.max_disk - status.available_disk) /GiB, 2);
    const storageData = [{
      value: availableDisk,
      label: texts.available,
      color: seriesColor1,
    },{
      value: usedDisk,
      label: texts.used,
      color: seriesColor4,
    }];
    const storageChart = (
      <GridItem xs={6} sm={4} md={3} key='disks'>
        <PieCard
          title={texts.disks}
          series={storageData}
          displayValue={value =>{
            if (Number.isInteger(value)){
              return value.toString + ' GB';
            }else{
              return value.toFixed(2) + ' GB';
            }
          }}
          />
      </GridItem>
    )
    //core usage
    var usedCores = {
      label: texts.coresUsed,
      color: whiteColor,
      data: [],
    }

    var maxCores = 0;
    status.coreRecords.forEach( data =>{
      usedCores.data.push(data.current);
      maxCores = Math.max(maxCores, data.max);
    })

    const coresChart = (
      <GridItem xs={8} sm={6} md={4} key='cores-usage'>
        <LineCard
          title={texts.coreUsage}
          series={[usedCores]}
          color='success'
          minTickStep={1}
          maxValue={maxCores}
          />
      </GridItem>
    )
    //memory
    var usedMemory = {
      label: texts.used,
      color: grayColor[4],
      data: [],
    };
    var availableMemory = {
      label: texts.available,
      color: successColor[1],
      data: [],
    };
    status.memoryRecords.forEach( data =>{
      usedMemory.data.push(data.used);
      availableMemory.data.push(data.available)
    })
    const memoryChart = (
      <GridItem xs={8} sm={6} md={4} key='memory-usage'>
        <StackedBarCard
          title={texts.memoryUsage}
          series={[usedMemory, availableMemory]}
          color='info'
          minTickStep={1 << 10}
          displayValue={ mib => {
            const GiB = 1 << 10;
            if (0 === mib){
              return '0';
            }else if (mib >= GiB){
              if (0 === mib % GiB){
                return (mib / GiB).toString() + ' GB';
              }else{
                return (mib / GiB).toFixed(2) + ' GB';
              }
            }else {
              return mib.toString() + ' MB';
            }
          }}
          />
      </GridItem>
    )
    //network
    var networkReceive = {
      label: texts.receive,
      color: infoColor[3],
      data: [],
    };
    var networkSend = {
      label: texts.send,
      color: primaryColor[1],
      data: [],
    };
    status.networkRecords.forEach( data =>{
      networkReceive.data.push(data.receive);
      networkSend.data.push(data.send)
    })
    const networkSeries = [ networkReceive, networkSend ];
    const mbBased = 1 << 20;
    const networkChart = (
      <GridItem xs={8} sm={6} md={4} key='network-usage'>
        <MultiBarCard
          title={texts.network}
          series={networkSeries}
          displayValue={bpsToString}
          minTickStep={mbBased}
          color='warning'
          />
      </GridItem>
    )
    //disk IO
    var diskWrite = {
      label: texts.write,
      color: successColor[1],
      data: [],
    };
    var diskRead = {
      label: texts.read,
      color: infoColor[3],
      data: [],
    };
    status.diskRecords.forEach( data =>{
      diskWrite.data.push(data.write);
      diskRead.data.push(data.read);
    })
    const diskSeries = [ diskWrite, diskRead ];
    const diskIOChart = (
      <GridItem xs={8} sm={6} md={4} key='io-usage'>
        <MultiBarCard
          title={texts.diskIO}
          series={diskSeries}
          displayValue={bpsToString}
          minTickStep={mbBased}
          color='rose'
          />
      </GridItem>
    )
    content = [
      updateTime,
      poolChart,
      cellChart,
      instanceChart,
      storageChart,
      coresChart,
      memoryChart,
      networkChart,
      diskIOChart,
    ];
  }

  return (
      <GridContainer>
        <GridItem xs={12}>
          <GridContainer>
            <GridItem xs={6} sm={4} md={3}>
              <Link to='/admin/dashboard/pools/'>
                <Button size="sm" color="info" round><AllOutIcon />{texts.allButton}</Button>
              </Link>
            </GridItem>
          </GridContainer>
        </GridItem>
        <GridItem xs={12}>
          <Box mt={3} mb={3}>
            <Divider/>
          </Box>
        </GridItem>
        {content}
      </GridContainer>
  )
}
