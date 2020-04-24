import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Link } from "react-router-dom";
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Skeleton from '@material-ui/lab/Skeleton';
import Box from '@material-ui/core/Box';
import WifiIcon from '@material-ui/icons/Wifi';
import BlockIcon from '@material-ui/icons/Block';
import WifiOffIcon from '@material-ui/icons/WifiOff';
import AllOutIcon from '@material-ui/icons/AllOut';

// core components
import Button from "components/CustomButtons/Button.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import LineChart from "views/Dashboard/LineChart.js";
import StackedBarChart from "views/Dashboard/StackedBarChart.js";
import MultiBarChart from "views/Dashboard/MultiBarChart.js";
import SeriesLabels from "views/Dashboard/SeriesLabels.js";
import dashboardStyles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";
import fontStyles from "assets/jss/material-dashboard-react/components/typographyStyle.js";

import { getLoggedSession, redirectToLogin, truncateToRadix } from 'utils.js';
import { queryComputeCellStatus } from "nano_api.js";

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
    viewButton: "View Instances",
    zone: "Zone Status",
    title: 'Compute Cell',
    pools: 'All Compute Pools',
    cells: 'Compute Cells',
    instances: 'Instances',
    disks: 'Storage(GB)',
    memory: 'Memory',
    ioUsage: 'IO Usage',
    enabled: 'Enabled',
    disabled: 'Disabled',
    online: 'Online',
    offline: 'Offline',
    stopped: 'Stopped ',
    running: 'Running ',
    lost: 'Lost ',
    migrate: 'Migrating ',
    used: 'Used ',
    available: 'Available ',
    coresUsed: 'Cores Used',
    throughput: 'Throughput',
    receive: 'Receive ',
    send: 'Send ',
    write: 'Write ',
    read: 'Read ',
  },
  'cn':{
    viewButton: "查看承载云主机",
    zone: "全域状态",
    title: '计算资源节点',
    pools: '所有计算资源池',
    cells: '资源节点',
    instances: '云主机实例',
    disks: '磁盘空间(GB)',
    memory: '内存',
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
    throughput: '吞吐量',
    receive: '接收',
    send: '发送',
    write: '写入',
    read: '读取',
  }
}

const seriesColor1 = infoColor[0];
// const seriesColor2 = successColor[0];
const seriesColor3 = warningColor[0];
const seriesColor4 = primaryColor[0];
const disabledColor = grayColor[2];

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

const SingleCellStatus = props => {
  const { lang, status, cellName, poolName } = props;
  const classes = useStyles();
  const texts = i18n[lang];
  let title;
  if (!status.alive){
    title = (
      <Typography component='span' className={classes.cardTitle}>
        <WifiOffIcon className={classes.mutedText}/>
        {texts.title + ': ' + cellName + ' ( ' + texts.offline + ' )'}
      </Typography>
    )
  }else if (!status.enabled){
    //disabled
    title = (
      <Typography component='span' className={classes.cardTitle}>
        <BlockIcon className={classes.mutedText}/>
        {texts.title + ': ' + cellName + ' ( ' + texts.disabled + ' )'}
      </Typography>
    );
  }else{
    //online
    title = (
      <Typography component='span' className={classes.cardTitle}>
        <WifiIcon className={classes.successText}/>
        {texts.title + ': ' + cellName + ' ( ' + texts.online + ' )'}
      </Typography>
    );
  }

  let content, dataLabels, operators;
  if (!status.alive){
    content = ["core-usage", "memory-usage", "disk-io", "network-io"].map(label=>(
      <GridItem xs={12} sm={6} md={3} key={label}>
        <Box m={0} p={0} className={classes.disableChart} boxShadow={2}/>
      </GridItem>
    ));
    dataLabels = [];
    operators = [];
  }else{
    operators = [
      (
        <GridItem xs={6} sm={4} md={3} key='view'>
          <Link to={'/admin/instances/?pool=' + poolName + '&cell=' + cellName}>
            <Button size="sm" color="info" round><AllOutIcon />{texts.viewButton}</Button>
          </Link>
        </GridItem>
      ),
    ];
    const GiB = 1 << 30;
    const MiB = 1 << 20;

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
    const instancesLabel = <SeriesLabels key="instances-labels" title={texts.instances} series={instanceData} valueName='value' colorName='color' labelName='label' baseClass={dashboardStyles.cardCategory}/>;

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
    const storageLabel = <SeriesLabels key="storage-labels" title={texts.disks} series={storageData} valueName='value' colorName='color' labelName='label' baseClass={dashboardStyles.cardCategory}/>;
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
      <GridItem xs={12} sm={6} md={3} key='cores-usage'>
        <Box m={0} p={0} className={classes.coresChart} boxShadow={2}>
          <LineChart
            series={[usedCores]}
            minTickStep={1}
            maxValue={maxCores}
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
      <GridItem xs={12} sm={6} md={3} key='memory-usage'>
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
    status.networkRecords.forEach( data =>{
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
      <GridItem xs={12} sm={6} md={3} key='network-usage'>
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
    status.diskRecords.forEach( data =>{
      diskWrite.data.push(truncateToRadix(data.write / MiB, 2));
      diskRead.data.push(truncateToRadix(data.read / MiB, 2));
    })
    const diskSeries = [ diskWrite, diskRead ];
    const diskIOChart = (
      <GridItem xs={12} sm={6} md={3} key='io-usage'>
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
    dataLabels = [
      instancesLabel,
      storageLabel,
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
        {dataLabels}
        <Box m={0} p={2} className={classes.cardWithDivider}>
          <GridContainer>
            {operators}
          </GridContainer>
        </Box>
      </CardBody>
    </Card>
  )
}

export default function CellStatus(props) {
  const CoreArraySize = 5;
  const MemoryArraySize = 5;
  const NetworkIOArraySize = 5;
  const DiskIOArraySize = 5;
  const poolName = props.match.params.pool;
  const [ allStatus, setAllStatus ] = React.useState(null);

  const texts = i18n[props.lang];

  React.useEffect(() =>{
    var mounted = true
    var statusMap = new Map();

    const queryCellsStatus = () =>{
      const MiB = 1 << 20;
      const onOperateSuccess = dataList => {
        dataList.forEach(status =>{
          const cellName = status.name;
          let coreRecords, memoryRecords, networkRecords, diskRecords;
          if(!statusMap.has(cellName)){
            //append & update for exists
            coreRecords = new Array(CoreArraySize - 1).fill({
              current: 0,
              max: 0,
            });
            memoryRecords = new Array(MemoryArraySize - 1).fill({
              available: 0,
              used: 0,
            });
            networkRecords = new Array(NetworkIOArraySize - 1).fill({
              receive: 0,
              send: 0,
            });
            diskRecords = new Array(DiskIOArraySize - 1).fill({
              write: 0,
              read: 0,
            });
          }else{
            //new pool
            const current = statusMap.get(cellName);
            coreRecords = current.coreRecords;
            coreRecords.shift();
            memoryRecords = current.memoryRecords;
            memoryRecords.shift();
            networkRecords = current.networkRecords;
            networkRecords.shift();
            diskRecords = current.diskRecords;
            diskRecords.shift();
          }
          coreRecords.push({
            current: truncateToRadix(status.cpu_usage, 2),
            max: status.max_cpu,
          });
          memoryRecords.push({
            available: truncateToRadix(status.available_memory/MiB, 2),
            used: truncateToRadix((status.max_memory - status.available_memory)/MiB, 2),
          });
          networkRecords.push({
            receive: status.receive_speed,
            send: status.send_speed,
            // receive: 100 * MiB * Math.random(),
            // send: 100 * MiB * Math.random(),
          });
          diskRecords.push({
            write: status.write_speed,
            read: status.read_speed,
            // write: 10 * MiB * Math.random(),
            // read: 10 * MiB * Math.random(),
          });

          const updated = {
            ...status,
            coreRecords: coreRecords,
            memoryRecords: memoryRecords,
            networkRecords: networkRecords,
            diskRecords: diskRecords,
          };
          statusMap.set(cellName, updated);
        });
        var newStatus = new Map();
        statusMap.forEach((value, key) =>{
          newStatus.set(key, value);
        })
        setAllStatus(newStatus);
      }
      queryComputeCellStatus(poolName, onOperateSuccess);
    }

    queryCellsStatus();
    const updateInterval = 2 * 1000;
    var timerID = setInterval(()=>{
      if (mounted){
        queryCellsStatus();
      }
    }, updateInterval);
    return () =>{
      mounted = false;
      clearInterval(timerID);
    }
  }, [poolName]);

  //reder begin
  var session = getLoggedSession();
  if (null === session){
    return redirectToLogin();
  }

  let content;
  if (!allStatus){
    content = <Skeleton variant="rect" style={{height: '10rem'}}/>;
  }else{
    var nameList = [];
    allStatus.forEach( (value, key) =>{
      nameList.push(key);
    });
    nameList.sort();
    content = [];
    nameList.forEach(cellName =>{
      var status = allStatus.get(cellName);
      content.push(
        <GridItem xs={12} key={cellName}>
          <SingleCellStatus status={status} lang={props.lang} cellName={cellName} poolName={poolName}/>
        </GridItem>
      );
    });

  }

  const breadcrumbs = [
    <Link to='/admin/dashboard/' key={texts.zone}>{texts.zone}</Link>,
    <Link to='/admin/dashboard/pools/' key={texts.pools}>{texts.pools}</Link>,
    <Typography color="textPrimary" key={poolName}>{poolName}</Typography>,
  ];

  return (
      <GridContainer>
        <GridItem xs={12}>
          <Breadcrumbs separator="›" aria-label="breadcrumb">
            {breadcrumbs}
          </Breadcrumbs>
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
