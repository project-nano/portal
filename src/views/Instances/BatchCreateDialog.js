import React from "react";
// @material-ui/core components
import Grid from "@material-ui/core/Grid";
import Box from '@material-ui/core/Box';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import TableHead from '@material-ui/core/TableHead';
import TableContainer from '@material-ui/core/TableContainer';
import Paper from '@material-ui/core/Paper';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Skeleton from '@material-ui/lab/Skeleton';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import Switch from '@material-ui/core/Switch';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
// import FormHelperText from '@material-ui/core/FormHelperText';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import FormGroup from '@material-ui/core/FormGroup';
import Checkbox from '@material-ui/core/Checkbox';
import Slider from '@material-ui/core/Slider';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';

// dashboard components
import Button from "components/CustomButtons/Button.js";
import GridItem from "components/Grid/GridItem.js";
import SingleRow from "components/Grid/SingleRow.js";
import SnackbarContent from "components/Snackbar/SnackbarContent.js";
import { getAllComputePools, searchDiskImages, batchCreatingGuests, checkBatchCreatingStatus } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Batch Creating Instances',
    rule: 'Name Rule',
    ruleOrder: 'By Order',
    ruleMAC: 'By MAC',
    ruleAddress: 'By Guest Address',
    prefix: 'Prefix',
    count: 'Create Quantity',
    resourcePool: 'Resource Pool',
    core: 'Core',
    memory: 'Memory',
    systemDisk: 'System Disk Size',
    dataDisk: 'Data Disk Size',
    autoStartup: 'Automatic Startup',
    systemVersion: 'System Version',
    sourceImage: 'Source Image',
    blankSystem: 'Blank System',
    qos: 'QoS Options (Optional)',
    cpuPriority: 'CPU Priority',
    iops: 'IOPS',
    outbound: 'Outband Bandwidth',
    inbound: 'Inbound Bandwidth',
    noDataDisk: "Don't use data disk",
    noLimit: 'No Limit',
    cpuPriorityHigh: 'High',
    cpuPriorityMedium: 'Medium',
    cpuPriorityLow: 'Low',
    modules: 'Pre-Installed Modules',
    adminName: 'Admin Name',
    adminPassword: 'Admin Password',
    blankHelper: 'Leave blank to generate',
    dataPath: 'Data Path',
    off: 'Off',
    on: 'On',
    cancel: 'Cancel',
    confirm: 'Confirm',
    finish: 'Finish',
    fail: 'Fail',
    complete: 'Created',
    processing: 'Creating',
    instance: 'Instance',
    result: 'Result',
  },
  'cn':{
    title: '批量创建云主机',
    rule: '实例命名规则',
    ruleOrder: '顺序递增',
    ruleMAC: '按MAC地址',
    ruleAddress: '按实例地址',
    prefix: '实例名前缀',
    count: '创建数量',
    resourcePool: '计算资源池',
    core: '核心数',
    memory: '内存',
    systemDisk: '系统磁盘容量',
    dataDisk: '数据磁盘容量',
    autoStartup: '自动启动',
    systemVersion: '系统版本',
    sourceImage: '来源镜像',
    blankSystem: '空白系统',
    qos: 'QoS选项 (可选)',
    cpuPriority: 'CPU优先级',
    iops: '磁盘读写限制',
    outbound: '上行带宽',
    inbound: '下行带宽',
    noDataDisk: "不使用数据磁盘",
    noLimit: '无限制',
    cpuPriorityHigh: '高',
    cpuPriorityMedium: '中',
    cpuPriorityLow: '低',
    modules: '预装模块',
    adminName: '管理员账号',
    adminPassword: '管理员密码',
    blankHelper: '留空则自动生成新密码',
    dataPath: '挂载数据路径',
    off: '关闭',
    on: '开启',
    cancel: '取消',
    confirm: '确定',
    finish: '完成',
    fail: '失败',
    complete: '创建完成',
    processing: '创建中',
    instance: '云主机',
    result: '处理结果',
  },
};

export default function CreateDialog(props){
  const StageEnum = {
    initial: 0,
    processing: 1,
    finish: 2,
  };
  const RuleEmum = {
    order: 'order',
    MAC: 'MAC',
    address: 'address',
  };
  const defaultOption = '__default';
  const ciModuleName = 'cloud-init';
  const checkInterval = 1000;
  const { lang, open, onSuccess, onCancel } = props;

  const defaultValues = {
    rule: RuleEmum.order,
    prefix: '',
    count: 1,
    name: '',
    pool: '',
    cores: (1).toString(),
    memory: (1 << 30).toString(), //1 G
    system_disk: 5,
    data_disk: 0,
    auto_start: false,
    system_version: 'centos7',
    from_image: defaultOption,
    modules: new Map(),
    module_cloud_init_admin_name: 'root',
    module_cloud_init_admin_password: '',
    module_cloud_init_data_path: '/opt/data',
    priority: 'medium',
    iops: 0,
    inbound: 0,
    outbound: 0,
  };
  const [ initialed, setInitialed ] = React.useState(false);
  const [ stage, setStage ] = React.useState(StageEnum.initial);
  const [ resultList, setResultList ] = React.useState(null);
  const [ error, setError ] = React.useState('');
  const [ request, setRequest ] = React.useState(defaultValues);
  const [ options, setOptions ] = React.useState({
    pools: [],
    images: [],
    versions: [],
  });
  const texts = i18n[lang];
  const onCreateFail = (msg) =>{
    setError(msg);
  }
  const resetDialog = () => {
    setError('');
    setRequest(defaultValues);
    setInitialed(false);
    setStage(StageEnum.initial);
  }

  const closeDialog = ()=>{
    resetDialog();
    onCancel();
  }

  const onCreateSuccess = () =>{
    resetDialog();
    onSuccess();
  }

  const onAccept = batchID => {
    setError('');
    if(StageEnum.initial === stage){
      setStage(StageEnum.processing);
    }
    checkBatchCreatingStatus(batchID, onProcessing(batchID), onComplete(batchID), onCreateFail);
  }

  const onProcessing = batchID => dataList =>{
    setResultList(dataList);
    setTimeout(() => {
      checkBatchCreatingStatus(batchID, onProcessing(batchID), onComplete(batchID), onCreateFail);
    }, checkInterval);
  }

  const onComplete = batchID => dataList =>{
    setResultList(dataList);
    if(StageEnum.finish !== stage){
      setStage(StageEnum.finish);
    }
  }

  const confirmCreate = () =>{
    if (!request.prefix){
      onCreateFail('prefix required');
      return;
    }
    var count = Number.parseInt(request.count);
    if(Number.isNaN(count)){
      onCreateFail('invalid count: ' + request.count);
      return;
    }

    if (!request.pool){
      onCreateFail('must specify target pool');
      return;
    }
    var cores = Number.parseInt(request.cores);
    if(Number.isNaN(cores)){
      onCreateFail('invalid cores: ' + request.cores);
      return;
    }
    var memory = Number.parseInt(request.memory);
    if(Number.isNaN(memory)){
      onCreateFail('invalid memory: ' + request.memory);
      return;
    }
    const GiB = 1 << 30;
    var disks = [request.system_disk * GiB];
    if (0 !== request.data_disk){
      disks.push(request.data_disk * GiB);
    }
    var systemVersion = request.system_version;
    let fromImage;
    if (defaultOption === request.from_image){
      fromImage = '';
    }else{
      fromImage = request.from_image;
    }
    var modules = [];
    var ciEnabled = false;
    request.modules.forEach( (checked, name) =>{
      if(checked){
        modules.push(name);
        if (ciModuleName === name){
          ciEnabled = true;
        }
      }
    });
    var cloudInit = null;
    if(ciEnabled){
      cloudInit = {
        admin_name: request.module_cloud_init_admin_name,
        admin_secret: request.module_cloud_init_admin_password,
        data_path: request.module_cloud_init_data_path,
      };
    }
    const Mbit = 1 << (20 - 3);
    var qos = {
      cpu_priority: request.priority,
      write_iops: request.iops,
      read_iops: request.iops,
      receive_speed: request.inbound * Mbit,
      send_speed: request.outbound * Mbit,
    };
    batchCreatingGuests(request.rule, request.prefix, count, request.pool, cores, memory, disks,
      request.auto_start, fromImage, systemVersion, modules,
      cloudInit, qos, onAccept, onCreateFail);
  }

  const handleRequestPropsChanged = name => e =>{
    var value = e.target.value
    setRequest(previous => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSliderValueChanged = name => (e, value) =>{
    setRequest(previous => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCheckedValueChanged = name => e =>{
    var value = e.target.checked
    setRequest(previous => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCheckedGroupChanged = (groupName, propertyName) => e =>{
    var checked = e.target.checked
    setRequest(previous => ({
      ...previous,
      [groupName]: previous[groupName].set(propertyName, checked),
    }));
  };

  React.useEffect(()=>{
    if (!open || initialed){
      return;
    }
    var poolList = [];
    var imageList = [{
      name: texts.blankSystem,
      value: defaultOption,
    }];
    const availableVersions = [
      {
        name: 'centos7',
        label: 'CentOS 7 or Later',
        allowCI: true,
      },
      {
        name: 'centos6',
        label: 'CentOS 6',
        allowCI: true,
      },
      {
        name: 'win2012',
        label: 'Windows Server 2012',
        allowCI: false,
      },
      {
        name: 'legacy',
        label: 'Legacy system',
        allowCI: true,
      },
      {
        name: 'general',
        label: 'Other General System',
        allowCI: true,
      },
    ];

    const onQueryImageSuccess = (dataList) =>{
        dataList.forEach((image)=>{
          var item = {
            name: image.name,
            value: image.id,
          }
          imageList.push(item);
        })
        setOptions({
          pools: poolList,
          images: imageList,
          versions: availableVersions,
        });
        setInitialed(true);
    };

    const onQueryPoolSuccess = (dataList) =>{
      dataList.forEach((pool)=>{
        poolList.push(pool.name);
      })

      searchDiskImages(onQueryImageSuccess, onCreateFail);
    };

    getAllComputePools(onQueryPoolSuccess, onCreateFail);

  }, [initialed, open, texts.blankSystem]);


  const resultToTable = dataList => {
    var rows = [];
    if(!dataList){
      return <div/>;
    }
    dataList.forEach((result, index) =>{
      let content;
      if('fail' === result.status){
        content = texts.fail + ':' + result.error;
      }else if ('created' === result.status){
        content = texts.complete;
      }else{
        //stopping
        const progress = result.progress;
        content = (
          <Grid container>
            <GridItem xs={8} sm={9} md={10}>
              <LinearProgress variant="determinate" value={progress}/>
            </GridItem>
            <GridItem xs={4} sm={3} md={2}>
              <Typography align="center">
                {progress.toFixed(2) + '%'}
              </Typography>
            </GridItem>
          </Grid>
        )
      }
      rows.push({
        name: result.name,
        content: content,
      });
    });

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{texts.instance}</TableCell>
              <TableCell>{texts.result}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {
              rows.map(row => (
                <TableRow key={row.name}>
                  <TableCell component='th' scope='row'>
                    {row.name}
                  </TableCell>
                  <TableCell>
                    {row.content}
                  </TableCell>
                </TableRow>
              ))
            }
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  //begin render
  let title;
  if (!error || '' === error){
    title = texts.title;
  }else{
    title = (
      <GridItem xs={12}>
        {texts.title}
        <SnackbarContent message={error} color="danger"/>
      </GridItem>
    );
  }
  const cancelButton = (
    <Button onClick={closeDialog} color="transparent" key='cancel'>
      {texts.cancel}
    </Button>
  );
  const confirmButton = (
    <Button onClick={confirmCreate} color="info" key='confirm'>
      {texts.confirm}
    </Button>
  );
  const finishButton = (
    <Button onClick={onCreateSuccess} color="info" key='finish'>
      {texts.finish}
    </Button>
  );

  let content, buttons;
  if (!initialed){
    content = <Skeleton variant="rect" style={{height: '10rem'}}/>;
    buttons = [cancelButton, confirmButton];
  }else{
    switch (stage) {
      case StageEnum.processing:
        content = resultToTable(resultList);
        if(error){
          buttons = [cancelButton];
        }else{
          buttons = [];
        }
        break;
      case StageEnum.finish:
        content = resultToTable(resultList);
        buttons = [finishButton];
        break;
      default:
        //initial
        buttons = [cancelButton, confirmButton];
        const coresOptions = [];
        [1, 2, 4, 8, 16].forEach( core =>{
          coresOptions.push(core.toString());
        });
        const memoryOptionsRates = [1, 2, 4, 8, 16, 32];
        const memoryBase = 512;
        const MiB = 1 << 20;
        const GiB = 1 << 30;
        var memoryOptions = [];
        memoryOptionsRates.forEach(rate => {
          var value = memoryBase * rate * MiB;
          let name;
          if (value >= GiB){
            name = value / GiB + ' GB';
          }else{
            name = value / MiB + ' MB';
          }
          memoryOptions.push({
            name: name,
            value: value.toString(),
          });
        });
        //system disk slider
        let systemDiskSlider;
        {
          const minRange = 5;
          const maxRange = 60;
          const step = 1;
          const markValues = [minRange, maxRange, 30];
          var systemMarks = [];
          markValues.forEach(value =>{
            systemMarks.push({
              value: value,
              label: value + ' GB',
            })
          });
          systemDiskSlider = (
            <Slider
              color="secondary"
              value={request.system_disk}
              max={maxRange}
              min={minRange}
              step={step}
              valueLabelDisplay="auto"
              marks={systemMarks}
              onChange={handleSliderValueChanged('system_disk')}
            />
          );
        }
        //disk slider
        let dataDiskSlider;
        {
          const minRange = 0;
          const maxRange = 20;
          const step = 2;
          var dataMarks = [{
            value: 0,
            label: texts.noDataDisk,
          },{
            value: 10,
            label: '10 GB',
          },{
            value: 20,
            label: '20 GB',
          },
          ];
          dataDiskSlider = (
            <Slider
              color="secondary"
              value={request.data_disk}
              max={maxRange}
              min={minRange}
              step={step}
              valueLabelDisplay="auto"
              marks={dataMarks}
              onChange={handleSliderValueChanged('data_disk')}
            />
          );
        }

        let moduleOption;
        if (request.system_version && defaultOption !== request.from_image){
          var allowCloudInit = true;
          const currentVersion = request.system_version;
          options.versions.some(version =>{
            if(currentVersion === version.name){
              allowCloudInit = version.allowCI;
              return true;
            }
            return false;
          });
          var modules = [{
            value: 'qemu',
            label: 'QEMU-Guest-Agent',
          }];
          if (allowCloudInit){
            modules.push({
              value: ciModuleName,
              label: 'CloudInit',
            });
          }
          let ciOptions;
          if (request.modules.get(ciModuleName)){
            //ci checked
            ciOptions = (
              <GridItem xs={12} sm={8} md={6}>
                <Box m={0} pt={2}>
                  <FormControl component="fieldset" fullWidth>
                    <FormLabel component="legend">Cloud Init Options</FormLabel>
                    <SingleRow>
                      <TextField
                        label={texts.adminName}
                        onChange={handleRequestPropsChanged('module_cloud_init_admin_name')}
                        value={request.module_cloud_init_admin_name}
                        margin="normal"
                        fullWidth
                      />
                    </SingleRow>
                    <SingleRow>
                      <TextField
                        label={texts.adminPassword}
                        onChange={handleRequestPropsChanged('module_cloud_init_admin_password')}
                        helperText={texts.blankHelper}
                        margin="normal"
                        fullWidth
                      />
                    </SingleRow>
                    <SingleRow>
                      <TextField
                        label={texts.dataPath}
                        onChange={handleRequestPropsChanged('module_cloud_init_data_path')}
                        value={request.module_cloud_init_data_path}
                        margin="normal"
                        disabled
                        fullWidth
                      />
                    </SingleRow>
                  </FormControl>
                </Box>
              </GridItem>
            )
          }else{
            ciOptions = <GridItem/>;
          }

          moduleOption = (
            <SingleRow>
              <GridItem xs={12}>
                <Box m={0} pt={2}>
                  <FormControl component="fieldset" fullWidth>
                    <FormLabel component="legend">{texts.modules}</FormLabel>
                    <FormGroup>
                      <Grid container>
                        {
                            modules.map(module => {
                              let checked;
                              if (request.modules.has(module.value)){
                                checked = request.modules.get(module.value);
                              }else{
                                checked = false;
                              }
                              return (
                                <GridItem xs={12} sm={6} md={4} key={module.value}>
                                  <FormControlLabel
                                    control={<Checkbox checked={checked} onChange={handleCheckedGroupChanged('modules', module.value)} value={module.value}/>}
                                    label={module.label}
                                  />
                                </GridItem>
                              );
                            })
                        }
                      </Grid>
                    </FormGroup>
                  </FormControl>
                </Box>
              </GridItem>
              {ciOptions}
            </SingleRow>
          )

        }else{
          moduleOption = <GridItem/>;
        }


        content = (
          <Grid container>
            <SingleRow>
              <GridItem xs={12}>
                <Box m={0} pt={2}>
                  <FormControl component="fieldset" fullWidth>
                    <FormLabel component="legend">{texts.rule}</FormLabel>
                    <RadioGroup aria-label={texts.rule} name="rule" value={request.rule} onChange={handleRequestPropsChanged('rule')} row>
                      <Box display='flex'>
                        <Box>
                          <FormControlLabel value={RuleEmum.order} control={<Radio />} label={texts.ruleOrder}/>
                        </Box>
                        <Box>
                          <FormControlLabel value={RuleEmum.MAC} control={<Radio disabled/>} label={texts.ruleMAC}/>
                        </Box>
                        <Box>
                          <FormControlLabel value={RuleEmum.address} control={<Radio disabled/>} label={texts.ruleAddress}/>
                        </Box>
                      </Box>
                    </RadioGroup>
                  </FormControl>
                </Box>
              </GridItem>
            </SingleRow>
            <SingleRow>
              <GridItem xs={6}>
                <Box m={0} pt={2}>
                    <FormLabel component="legend">{texts.count}</FormLabel>
                    <Slider
                      color="secondary"
                      value={request.count}
                      max={20}
                      min={1}
                      step={1}
                      valueLabelDisplay="auto"
                      marks={[{value: 1, label: '1'}, {value: 10, label: '10'}, {value: 20, label: '20'}]}
                      onChange={handleSliderValueChanged('count')}
                    />
                </Box>
              </GridItem>
            </SingleRow>
            <SingleRow>
              <GridItem xs={12} sm={6} md={4}>
                <Box m={0} pt={2}>
                  <TextField
                    label={texts.prefix}
                    onChange={handleRequestPropsChanged('prefix')}
                    value={request.prefix}
                    margin="normal"
                    required
                    fullWidth
                  />
                </Box>
              </GridItem>
            </SingleRow>
            <SingleRow>
              <GridItem xs={10} sm={4} md={3}>
                <Box m={0} pt={2}>
                  <InputLabel htmlFor="pool">{texts.resourcePool}</InputLabel>
                  <Select
                    value={request.pool}
                    onChange={handleRequestPropsChanged('pool')}
                    inputProps={{
                      name: 'pool',
                      id: 'pool',
                    }}
                    required
                    fullWidth
                  >
                    {
                      options.pools.map((option) =>(
                        <MenuItem value={option} key={option}>{option}</MenuItem>
                      ))
                    }
                  </Select>
                </Box>
              </GridItem>
            </SingleRow>
            <SingleRow>
              <GridItem xs={12}>
                <Box m={0} pt={2}>
                <FormControl component="fieldset" fullWidth>
                  <FormLabel component="legend">{texts.core}</FormLabel>
                  <RadioGroup aria-label={texts.core} name="cores" value={request.cores} onChange={handleRequestPropsChanged('cores')} row>
                    <Grid container>
                    {
                      coresOptions.map(option => <GridItem xs={3} sm={2} md={1} key={option}><FormControlLabel value={option} control={<Radio />} label={option}/></GridItem>)
                    }
                    </Grid>
                  </RadioGroup>
                </FormControl>
                </Box>
              </GridItem>
              <GridItem xs={12}>
                <Box m={0} pt={2}>
                  <FormControl component="fieldset" fullWidth>
                    <FormLabel component="legend">{texts.memory}</FormLabel>
                    <RadioGroup aria-label={texts.memory} name="memory" value={request.memory} onChange={handleRequestPropsChanged('memory')} row>
                      <Grid container>
                      {
                        memoryOptions.map(option => <GridItem xs={6} sm={3} md={2} key={option.value}><FormControlLabel value={option.value} control={<Radio />} label={option.name}/></GridItem>)
                      }
                      </Grid>
                    </RadioGroup>
                  </FormControl>
                </Box>
              </GridItem>
            </SingleRow>

            <SingleRow>
              <GridItem xs={12} sm={6} md={4}>
                <Box m={0} pt={2}>
                  <FormLabel component="legend">{texts.systemDisk}</FormLabel>
                  {systemDiskSlider}
                </Box>
              </GridItem>
            </SingleRow>
            <SingleRow>
              <GridItem xs={12} sm={6} md={4}>
                <Box m={0} pt={2}>
                  <FormLabel component="legend">{texts.dataDisk}</FormLabel>
                  {dataDiskSlider}
                </Box>
              </GridItem>
            </SingleRow>
            <SingleRow>
              <GridItem xs={10} sm={6} md={5}>
                <Box m={0} pb={2}>
                  <InputLabel htmlFor="image">{texts.sourceImage}</InputLabel>
                  <Select
                    value={request.from_image}
                    onChange={handleRequestPropsChanged('from_image')}
                    inputProps={{
                      name: 'image',
                      id: 'image',
                    }}
                    fullWidth
                  >
                    {
                      options.images.map((option) =>(
                        <MenuItem value={option.value} key={option.value}>{option.name}</MenuItem>
                      ))
                    }
                  </Select>
                </Box>
              </GridItem>
            </SingleRow>
            <SingleRow>
              <GridItem xs={10} sm={5} md={4}>
                <Box m={0} pb={2}>
                  <InputLabel htmlFor="version">{texts.systemVersion}</InputLabel>
                  <Select
                    value={request.system_version}
                    onChange={handleRequestPropsChanged('system_version')}
                    inputProps={{
                      name: 'version',
                      id: 'version',
                    }}
                    fullWidth
                  >
                    {
                      options.versions.map((version) =>(
                        <MenuItem value={version.name} key={version.name}>{version.label}</MenuItem>
                      ))
                    }
                  </Select>
                </Box>
              </GridItem>
            </SingleRow>
            <SingleRow>
              <GridItem xs={8} sm={6} md={4}>
                <Box m={0} pb={2}>
                  <InputLabel htmlFor="auto_start">{texts.autoStartup}</InputLabel>

                    {texts.off}
                    <Switch
                      checked={request.failover}
                      onChange={handleCheckedValueChanged('auto_start')}
                      color="primary"
                      inputProps={{
                        name: 'auto_start',
                        id: 'auto_start',
                      }}
                    />
                    {texts.on}

                </Box>
              </GridItem>
            </SingleRow>
            {moduleOption}
            <SingleRow>
              <GridItem xs={12} sm={8} md={6}>
                <Box m={0} pb={2}>
                <ExpansionPanel>
                  <ExpansionPanelSummary
                    expandIcon={<ExpandMoreIcon />}
                  >
                    {texts.qos}
                  </ExpansionPanelSummary>
                  <ExpansionPanelDetails>
                    <Grid container>
                      <GridItem xs={12}>
                        <Box m={1} p={2}>
                          <FormControl component="fieldset" fullWidth>
                            <FormLabel component="legend">{texts.cpuPriority}</FormLabel>
                            <RadioGroup aria-label={texts.cpuPriority} value={request.priority} onChange={handleRequestPropsChanged('priority')} row>
                              <FormControlLabel value='high' control={<Radio />} label={texts.cpuPriorityHigh} key='high'/>
                              <FormControlLabel value='medium' control={<Radio />} label={texts.cpuPriorityMedium} key='medium'/>
                              <FormControlLabel value='low' control={<Radio />} label={texts.cpuPriorityLow} key='low'/>
                            </RadioGroup>
                          </FormControl>
                        </Box>
                      </GridItem>
                      <GridItem xs={12}>
                        <Box m={1} p={2}>
                            <FormLabel component="legend">{texts.iops}</FormLabel>
                            <Slider
                              color="secondary"
                              value={request.iops}
                              max={2000}
                              min={0}
                              step={10}
                              valueLabelDisplay="auto"
                              marks={[{value: 0, label: texts.noLimit}, {value: 2000, label: 2000}]}
                              onChange={handleSliderValueChanged('iops')}
                            />
                        </Box>
                      </GridItem>
                      <GridItem xs={12}>
                        <Box m={1} p={2}>
                            <FormLabel component="legend">{texts.inbound}</FormLabel>
                            <Slider
                              color="secondary"
                              value={request.inbound}
                              max={20}
                              min={0}
                              step={2}
                              valueLabelDisplay="auto"
                              marks={[{value: 0, label: texts.noLimit}, {value: 20, label: '20 Mbit/s'}]}
                              onChange={handleSliderValueChanged('inbound')}
                            />
                        </Box>
                      </GridItem>
                      <GridItem xs={12}>
                        <Box m={1} p={2}>
                            <FormLabel component="legend">{texts.outbound}</FormLabel>
                            <Slider
                              color="secondary"
                              value={request.outbound}
                              max={20}
                              min={0}
                              step={2}
                              valueLabelDisplay="auto"
                              marks={[{value: 0, label: texts.noLimit}, {value: 20, label: '20 Mbit/s'}]}
                              onChange={handleSliderValueChanged('outbound')}
                            />
                        </Box>
                      </GridItem>
                    </Grid>
                  </ExpansionPanelDetails>
                </ExpansionPanel>
              </Box>
            </GridItem>
          </SingleRow>
        </Grid>
        );
    }
  }

  return (
    <Dialog
      open={open}
      aria-labelledby={texts.title}
      maxWidth='md'
      fullWidth
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Grid container>
          <GridItem xs={12}>
            {content}
          </GridItem>
        </Grid>
      </DialogContent>
      <DialogActions>
        {buttons}
      </DialogActions>
    </Dialog>
  )
};
