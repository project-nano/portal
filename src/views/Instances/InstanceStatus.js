import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Link } from "react-router-dom";
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Skeleton from '@material-ui/lab/Skeleton';
import Box from '@material-ui/core/Box';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import StopIcon from '@material-ui/icons/Stop';
import AllInclusiveIcon from '@material-ui/icons/AllInclusive';
import AlbumIcon from '@material-ui/icons/Album';
import Tooltip from "@material-ui/core/Tooltip";

import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import GridItem from "components/Grid/GridItem.js";
import Snackbar from "components/Snackbar/Snackbar.js";
import GridContainer from "components/Grid/GridContainer.js";
import LineChart from "views/Dashboard/LineChart.js";
import StackedBarChart from "views/Dashboard/StackedBarChart.js";
import MultiBarChart from "views/Dashboard/MultiBarChart.js";
import dashboardStyles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";
import fontStyles from "assets/jss/material-dashboard-react/components/typographyStyle.js";

import { truncateToRadix, bytesToString } from 'utils.js';
import { getInstanceStatus, getInstanceConfig } from "nano_api.js";

import {
  primaryColor,
  infoColor,
  successColor,
  warningColor,
  grayColor,
  whiteColor,
  roseColor,
} from "assets/jss/material-dashboard-react.js";

const i18n = {
  'en':{
    title: 'Instance',
    cores: 'Cores',
    memory: 'Memory',
    disks: 'Disk',
    autoStartup: 'Auto Startup',
    internalAddress: 'Internal Address',
    externalAddress: 'External Address',
    ioUsage: 'IO Usage',
    stopped: 'Stopped ',
    running: 'Running ',
    used: 'Used ',
    available: 'Available ',
    coresUsed: 'Cores Used',
    throughput: 'Throughput',
    receive: 'Receive ',
    send: 'Send ',
    write: 'Write ',
    read: 'Read ',
    flags: 'Running Flags',
    mediaAttached: 'Media Attached',
  },
  'cn':{
    title: '云主机',
    cores: '核心数',
    memory: '内存',
    disks: '磁盘',
    autoStartup: '开机启动',
    internalAddress: '内部地址',
    externalAddress: '外部地址',
    ioUsage: 'IO吞吐量',
    stopped: '停止',
    running: '运行',
    used: '已用',
    available: '可用',
    coresUsed: '核心已占用',
    throughput: '吞吐量',
    receive: '接收',
    send: '发送',
    write: '写入',
    read: '读取',
    flags: '运行标志',
    mediaAttached: '已挂载媒体',
  }
}

const shadowChartPanel = {
  borderRadius: "3px",
  marginTop: "-20px",
  // marginLeft: "10px",
  // marginRight: "10px",
  padding: "15px",
};

const styles = {
  ...dashboardStyles,
  ...fontStyles,
  cardWithDivider: {
    borderTop: "1px solid " + grayColor[10],
  },
  coresChart: {
    ...shadowChartPanel,
    background: successColor[0],
  },
  memoryChart: {
    ...shadowChartPanel,
    background: infoColor[0],
  },
  networkChart: {
    ...shadowChartPanel,
    background: warningColor[0],
  },
  diskChart: {
    ...shadowChartPanel,
    background: roseColor[0],
  },
  disableChart: {
    ...shadowChartPanel,
    background: grayColor[5],
  }
}

const useStyles = makeStyles(styles);

const SingleInstanceStatus = props => {
  const { lang, status } = props;
  const classes = useStyles();
  const texts = i18n[lang];
  let title;
  if (!status.running){
    title = (
      <Typography component='span' className={classes.cardTitle}>
        <StopIcon className={classes.mutedText}/>
        {texts.title + ': ' + status.name + ' ( ' + texts.stopped + ' )'}
      </Typography>
    )
  }else{
    //online
    title = (
      <Typography component='span' className={classes.cardTitle}>
        <PlayArrowIcon className={classes.successText}/>
        {texts.title + ': ' + status.name + ' ( ' + texts.running + ' )'}
      </Typography>
    );
  }

  let content, dataLabels;
  if (!status.running){
    content = new Array(4).fill(
      <GridItem xs={8} sm={6} md={3}>
        <Box m={0} p={0} className={classes.disableChart} boxShadow={2}>
        </Box>
      </GridItem>
    );
    dataLabels = [];
  }else{
    const MiB = 1 << 20;

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
      <GridItem xs={8} sm={6} md={3} key='cores-usage'>
        <Box m={0} p={0} className={classes.coresChart} boxShadow={2}>
          <LineChart
            series={[usedCores]}
            minTickStep={1}
            maxValue={100}
            maxTicks={5}
            displayValue={tick => tick.toString() + '%'}
            />
        </Box>
      </GridItem>
    )
    //memory
    var usedMemory = {
      label: texts.used + texts.memory,
      color: grayColor[4],
      data: [],
    };
    var availableMemory = {
      label: texts.available + texts.memory,
      color: successColor[1],
      data: [],
    };
    status.memoryRecords.forEach( data =>{
      usedMemory.data.push(data.used);
      availableMemory.data.push(data.available)
    })
    const memoryChart = (
      <GridItem xs={8} sm={6} md={3} key='memory-usage'>
        <Box m={0} p={0} className={classes.memoryChart} boxShadow={2}>
          <StackedBarChart
            series={[usedMemory, availableMemory]}
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
        </Box>
      </GridItem>
    )
    //network
    var networkReceive = {
      label: texts.receive + texts.throughput,
      color: infoColor[3],
      data: [],
    };
    var networkSend = {
      label: texts.send + texts.throughput,
      color: primaryColor[1],
      data: [],
    };
    status.networkSpeed.forEach( data =>{
      networkReceive.data.push(truncateToRadix(data.receive/ MiB, 2) );
      networkSend.data.push(truncateToRadix(data.send/ MiB, 2));
    })
    const displaySpeedByMB = speed => {
      const gb = 1 << 10;
      if (speed >= gb){
        if (0 === speed % gb){
          return (speed / gb).toString() + ' GB/s';
        }else{
          return (speed / gb).toFixed(2) + ' GB/s';
        }
      }else{
        if (Number.isInteger(speed)){
          return speed.toString() + ' MB/s';
        }else{
          return speed.toFixed(2) + ' MB/s';
        }
      }
    }
    const networkSeries = [ networkReceive, networkSend ];
    const networkChart = (
      <GridItem xs={8} sm={6} md={3} key='network-usage'>
        <Box m={0} p={0} className={classes.networkChart} boxShadow={2}>
          <MultiBarChart
            series={networkSeries}
            displayValue={displaySpeedByMB}
            minTickStep={1}
            />
        </Box>
      </GridItem>
    )
    //disk IO
    var diskWrite = {
      label: texts.write + texts.throughput,
      color: successColor[1],
      data: [],
    };
    var diskRead = {
      label: texts.read + texts.throughput,
      color: infoColor[3],
      data: [],
    };
    status.diskSpeed.forEach( data =>{
      diskWrite.data.push(truncateToRadix(data.write / MiB, 2));
      diskRead.data.push(truncateToRadix(data.read / MiB, 2));
    })
    const diskSeries = [ diskWrite, diskRead ];
    const diskIOChart = (
      <GridItem xs={8} sm={6} md={3} key='io-usage'>
        <Box m={0} p={0} className={classes.diskChart} boxShadow={2}>
          <MultiBarChart
            series={diskSeries}
            displayValue={displaySpeedByMB}
            minTickStep={1}
            />
        </Box>
      </GridItem>
    )
    content = [
      coresChart,
      memoryChart,
      networkChart,
      diskIOChart,
    ];

    const coreLabel = (
      <Box m={1} p={2} key='core-label'>
        <Typography component='span' className={classes.cardTitle}>
          {texts.cores + ': '}
        </Typography>
        <Typography component='span'>
          {status.cores}
        </Typography>
      </Box>
    );
    const memoryLabel = (
      <Box m={1} p={2} key='memory-label'>
        <Typography component='span' className={classes.cardTitle}>
          {texts.memory + ': '}
        </Typography>
        <Typography component='span'>
          {bytesToString(status.memory)}
        </Typography>
      </Box>
    );

    var sizeLabels = [];
    status.disks.forEach(size =>{
      sizeLabels.push(bytesToString(size));
    });
    const diskLabel = (
      <Box m={1} p={2} key='disk-label'>
        <Typography component='span' className={classes.cardTitle}>
          {texts.disks + ': '}
        </Typography>
        <Typography component='span'>
          {sizeLabels.join(' / ')}
        </Typography>
      </Box>
    );

    const internalLabel = (
      <Box m={1} p={2} key='internal-label'>
        <Typography component='span' className={classes.cardTitle}>
          {texts.internalAddress + ': '}
        </Typography>
        <Typography component='span'>
          {status.internal&&status.internal.network_address? status.internal.network_address:''}
        </Typography>
      </Box>
    );

    const externalLabel = (
      <Box m={1} p={2} key='external-label'>
        <Typography component='span' className={classes.cardTitle}>
          {texts.externalAddress + ': '}
        </Typography>
        <Typography component='span'>
          {status.external&&status.external.network_address? status.external.network_address:''}
        </Typography>
      </Box>
    );

    var flags = [];
    if(status.auto_start){
      flags.push(
        <Tooltip
          title={texts.autoStartup}
          placement="top"
          key={texts.autoStartup}
          >
          <AllInclusiveIcon className={classes.infoText}/>
        </Tooltip>
      );
    }
    if(status.media_attached){
      flags.push(
        <Tooltip
          title={texts.mediaAttached}
          placement="top"
          key={texts.mediaAttached}
          >
          <AlbumIcon className={classes.infoText}/>
        </Tooltip>
      );
    }
    const flagLabel = (
      <Box m={1} p={2} key='flag-label'>
        <Typography component='span' className={classes.cardTitle}>
          {texts.flags + ': '}
        </Typography>
        {flags}
      </Box>
    );

    dataLabels = [
      coreLabel,
      memoryLabel,
      diskLabel,
      internalLabel,
      externalLabel,
      flagLabel,
    ];
  }

  return (
    <Card chart>
      <CardHeader>
        <GridContainer>
          {content}
        </GridContainer>
      </CardHeader>
      <CardBody>
        {title}
        <Box m={0} p={0} className={classes.cardWithDivider} display='flex' alignItems='center'>
          {dataLabels}
        </Box>
      </CardBody>
    </Card>
  )
}

export default function InstanceStatus(props) {
  const CoreArraySize = 5;
  const MemoryArraySize = 5;
  const NetworkIOArraySize = 5;
  const DiskIOArraySize = 5;
  const IntervalInSecond = 2;
  const instanceID = props.match.params.id;
  const [ initialed, setInitialed ] = React.useState(false);
  const [ mounted, setMounted ] = React.useState(false);
  const [ instance, setInstance ] = React.useState(null);
  const [ notifyMessage, setNotifyMessage ] = React.useState('');

  const closeNotify = React.useCallback(() => {
    setNotifyMessage("");
  }, [setNotifyMessage]);

  const showErrorMessage = React.useCallback((msg) => {
    if (!mounted){
      return;
    }
    const notifyDuration = 3000;
    setNotifyMessage(msg);
    setTimeout(closeNotify, notifyDuration);
  }, [setNotifyMessage, closeNotify, mounted]);

  React.useEffect(() =>{
    setMounted(true)

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

    var networkSpeed = new Array(NetworkIOArraySize).fill({
      receive: 0,
      send: 0,
    });
    var diskSpeed = new Array(DiskIOArraySize).fill({
      write: 0,
      read: 0,
    });

    var speedReady = false;
    let timerID, poolName, cellName;
    const onGetStatusSuccess = status => {
      if (!mounted){
        return;
      }
      const MiB = 1 << 20;
      coreRecords.shift();
      coreRecords.push({
        current: truncateToRadix(status.cpu_usage, 2),
        max: status.cores,
      });
      let usedMemory, availableMemory;
      if (status.memory_available > status.memory){
        showErrorMessage("abnormal available memory, " + status.memory_available + " > allocated " +  status.memory);
        availableMemory = status.memory;
        usedMemory = 0;
      }else{
        availableMemory = status.memory_available;
        usedMemory = status.memory - status.memory_available;
      }
      memoryRecords.shift();
      memoryRecords.push({
        available: truncateToRadix(availableMemory/MiB, 2),
        used: truncateToRadix( usedMemory/MiB, 2),
      });
      networkRecords.shift();
      networkRecords.push({
        receive: status.bytes_received,
        send: status.bytes_sent,
      });
      diskRecords.shift();
      diskRecords.push({
        write: status.bytes_written,
        read: status.bytes_read,
      });

      if(!speedReady){
        speedReady = true;
      }else{
        const receiveSpeed = (networkRecords[networkRecords.length - 1].receive - networkRecords[networkRecords.length - 2].receive) / IntervalInSecond;
        const sendSpeed = (networkRecords[networkRecords.length - 1].send - networkRecords[networkRecords.length - 2].send) / IntervalInSecond;
        const writeSpeed = (diskRecords[diskRecords.length - 1].write - diskRecords[diskRecords.length - 2].write) / IntervalInSecond;
        const readSpeed = (diskRecords[diskRecords.length - 1].read - diskRecords[diskRecords.length - 2].read) / IntervalInSecond;
        networkSpeed.shift();
        networkSpeed.push({
          receive: receiveSpeed,
          send: sendSpeed,
        });
        diskSpeed.shift();
        diskSpeed.push({
          write: writeSpeed,
          read: readSpeed,
        });
      }

      const updated = {
        ...status,
        pool: poolName,
        cell: cellName,
        coreRecords: coreRecords,
        memoryRecords: memoryRecords,
        networkRecords: networkRecords,
        diskRecords: diskRecords,
        networkSpeed: networkSpeed,
        diskSpeed: diskSpeed,
      };
      setInstance(updated);
      setInitialed(true);
    }

    const onGetConfigSuccess = config =>{
      if (!mounted){
        return;
      }
      poolName = config.pool;
      cellName = config.cell;

      getInstanceStatus(instanceID, onGetStatusSuccess, showErrorMessage);

      const updateInterval = IntervalInSecond * 1000;
      timerID = setInterval(()=>{
        if (!mounted){
          return;
        }
        getInstanceStatus(instanceID, onGetStatusSuccess, showErrorMessage);
      }, updateInterval);
    }

    //get config
    getInstanceConfig(instanceID, onGetConfigSuccess, showErrorMessage)

    return () =>{
      setMounted(false);
      if(timerID){
          clearInterval(timerID);
      }
    }
  }, [instanceID, showErrorMessage, mounted, initialed]);

  let content, headers;
  if (!initialed){
    content = <Skeleton variant="rect" style={{height: '10rem'}}/>;
    headers = <Skeleton variant="rect" style={{height: '10rem'}}/>;
  }else{
    content = (
      <GridItem xs={12}>
        <SingleInstanceStatus status={instance} lang={props.lang}/>
      </GridItem>
    );
    // content = <div/>;
    const breadcrumbs = [
      <Link to={'/admin/instances/range/?pool=' + instance.pool} key={instance.pool}>{instance.pool}</Link>,
      <Link to={'/admin/instances/range/?pool=' + instance.pool + '&cell=' + instance.cell} key={instance.cell}>{instance.cell}</Link>,
      <Typography color="textPrimary" key={instance.name}>{instance.name}</Typography>,
    ];
    headers = (
      <Breadcrumbs separator="›" aria-label="breadcrumb">
        {breadcrumbs}
      </Breadcrumbs>
    )
  }

  return (
      <GridContainer>
        <GridItem xs={12}>
          {headers}
        </GridItem>
        <GridItem xs={12}>
          <Box mt={3} mb={3}>
            <Divider/>
          </Box>
        </GridItem>
        {content}
        <GridItem>
          <Snackbar
            place="tr"
            color="warning"
            message={notifyMessage}
            open={"" !== notifyMessage}
            closeNotification={closeNotify}
            close
          />
        </GridItem>
      </GridContainer>
  )
}
