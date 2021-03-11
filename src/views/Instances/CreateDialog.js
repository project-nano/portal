import React from "react";
// @material-ui/core components
import Grid from "@material-ui/core/Grid";
import Box from '@material-ui/core/Box';
import Skeleton from '@material-ui/lab/Skeleton';
// import FormHelperText from '@material-ui/core/FormHelperText';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import FormGroup from '@material-ui/core/FormGroup';
import Checkbox from '@material-ui/core/Checkbox';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';

// dashboard components
import GridItem from "components/Grid/GridItem.js";
import SingleRow from "components/Grid/SingleRow.js";
import InputList from "components/CustomInput/InputList";
import CustomDialog from "components/Dialog/CustomDialog.js";
import { getAllComputePools, searchDiskImages, createInstance,
  getInstanceConfig, querySystemTemplates, searchSecurityPolicyGroups, queryComputeCellsInPool, getNetworkPool } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Create Instance',
    name: 'Instance Name',
    resourcePool: 'Resource Pool',
    selectInstance: 'Select Host',
    selectNetwork: 'Select Network',
    inputIp: 'Input Ip',
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
    ciOptions: 'Cloud Init Options',
    securityPolicy: 'Security Policy',
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  'cn':{
    title: '创建云主机',
    name: '云主机名称',
    resourcePool: '计算资源池',
    selectInstance: '选择宿主机',
    selectNetwork: '选择地址段',
    inputIp: '输入地址',
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
    ciOptions: 'Cloud Init选项',
    securityPolicy: '安全策略',
    cancel: '取消',
    confirm: '确定',
  },
}

;

export default function CreateDialog(props){
  const defaultOption = '__default';
  const ciModuleName = 'cloud-init';
  const checkInterval = 1000;
  const { lang, open, onSuccess, onCancel } = props;

  const defaultValues = {
    name: '',
    pool: '',
    cores: (1).toString(),
    memory: (1 << 30).toString(), //1 G
    system_disk: 5,
    data_disk: 0,
    auto_start: false,
    system_template: '',
    from_image: defaultOption,
    security_policy: '',
    modules: new Map(),
    module_cloud_init_admin_name: 'root',
    module_cloud_init_admin_password: '',
    module_cloud_init_data_path: '/opt/data',
    priority: 'medium',
    iops: 0,
    inbound: 0,
    outbound: 0,
    cell: '',
    network_address: '',
    network: ''
  };
  const [ initialed, setInitialed ] = React.useState(false);
  const [ creating, setCreating ] = React.useState(false);
  const [ progress, setProgress ] = React.useState(0);
  const [ operatable, setOperatable ] = React.useState(true);
  const [ prompt, setPrompt ] = React.useState('');
  const [ mounted, setMounted ] = React.useState(false);
  const [ request, setRequest ] = React.useState(defaultValues);
  const [ cells, setCells ] = React.useState([]);
  const [ networkAddress, setNetworkAddress ] = React.useState(null);
  const [ networkAddressList, setNetworkAddressList ] = React.useState([]);
  const [ options, setOptions ] = React.useState({
    pools: [],
    images: [],
    versions: [],
    policies: [],
  });
  const texts = i18n[lang];
  const title = texts.title;
  const onCreateFail = React.useCallback(msg =>{
    if(!mounted){
      return;
    }
    setOperatable(true);
    setPrompt(msg);
  }, [mounted]);

  const resetDialog = () => {
    setPrompt('');
    setRequest(defaultValues);
    setInitialed(false);
    setCreating(false);
    setProgress(0);
  }

  const closeDialog = ()=>{
    resetDialog();
    onCancel();
  }

  const onCreateSuccess = result =>{
    if(!mounted){
      return;
    }
    setOperatable(true);
    resetDialog();
    onSuccess(result.id);
  }

  const onCreateAccept = instanceID =>{
    if(!mounted){
      return;
    }
    setCreating(true);
    setProgress(0);
    setTimeout(() => {
      checkCreatingProgress(instanceID)
    }, checkInterval);
  }

  const checkCreatingProgress = instanceID =>{
    if(!mounted){
      return;
    }
    const onCreating = progress =>{
      if(!mounted){
        return;
      }
      setProgress(progress);
      setTimeout(() => {
        checkCreatingProgress(instanceID)
      }, checkInterval);
    }
    getInstanceConfig(instanceID, onCreateSuccess, onCreateFail, onCreating);
  }

  const ipToNumber = (ip) => {  
    var numbers = ip.split(".");  
    return parseInt(numbers[0])*256*256*256 +   
    parseInt(numbers[1])*256*256 +   
    parseInt(numbers[2])*256 +   
    parseInt(numbers[3]);
  } 

  const isValidNetworkAddress = (ip) => {
    const networks = request.network.split('-')
    const start = networks[0]
    const end = networks[1]
    const startIpNumber = ipToNumber(start)
    const endIpNumber = ipToNumber(end)
    const ipNumber = ipToNumber(ip)
    return ipNumber >= startIpNumber && ipNumber <= endIpNumber
  }

  const handleConfirm = () =>{
    setPrompt('');
    setOperatable(false);
    if (!request.name){
      onCreateFail('instance name required');
      return;
    }
    if (!request.pool){
      onCreateFail('must specify target pool');
      return;
    }
    const network_address = request.network_address.trim()
    if(request.network=== '' && request.network_address !=='') {
      onCreateFail('Please select the address range first, then enter the address.');
      return;
    }
    if(request.network_address && request.network_address !=='' && request.network !== ''){
      if(!isValidNetworkAddress(network_address)){
        onCreateFail('The address entered must be within the range of the selected address segment.');
        return; 
      }
      if(networkAddress.allocated && networkAddress.allocated.length > 0){
        const allocatedAddress = networkAddress.allocated
        if(allocatedAddress.find(item=> item.address === network_address)) {
          onCreateFail('The address entered already exists.');
          return; 
        }
      }
    }
    var cores = Number(request.cores);
    if(Number.isNaN(cores)){
      onCreateFail('invalid cores: ' + request.cores);
      return;
    }
    var memory = Number(request.memory);
    if(Number.isNaN(memory)){
      onCreateFail('invalid memory: ' + request.memory);
      return;
    }
    const GiB = 1 << 30;
    var disks = [request.system_disk * GiB];
    if (0 !== request.data_disk){
      disks.push(request.data_disk * GiB);
    }
    var systemVersion = request.system_template;
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
    createInstance(request.name, request.pool, request.cell, network_address, cores, memory, disks,
      request.auto_start, fromImage, systemVersion, modules,
      cloudInit, qos, request.security_policy, onCreateAccept,
      onCreateSuccess, onCreateFail);
  }

  const handleRequestPropsChanged = name => e =>{
    if(!mounted){
      return;
    }
    var value = e.target.value
    if(name === 'pool') {
      const pool_item = options.pools.find(val=> val.value === value)
      getAllInstances(value)
      if(pool_item) {
        getNetworks(pool_item.network)
      }
    }
    setRequest(previous => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSliderValueChanged = name => (e, value) =>{
    if(!mounted){
      return;
    }
    setRequest(previous => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCheckedValueChanged = name => e =>{
    if(!mounted){
      return;
    }
    var value = e.target.checked
    setRequest(previous => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCheckedGroupChanged = (groupName, propertyName) => e =>{
    if(!mounted){
      return;
    }
    var checked = e.target.checked
    setRequest(previous => ({
      ...previous,
      [groupName]: previous[groupName].set(propertyName, checked),
    }));
  };

  React.useEffect(()=>{
    if (!open){
      return;
    }
    // var session = getLoggedSession();
    // if (null === session){
    //   onCreateFail('session expired');
    //   return;
    // }

    var poolOptions = [];
    var imageOptions = [{
      label: texts.blankSystem,
      value: defaultOption,
    }];
    var templateOptions = [];
    var securityPolicies = [];

    setMounted(true);
    const onQueryPoliciesSuccess = datalist =>{
      if(!mounted){
        return;
      }
      datalist.forEach(({id, name}) =>{
        securityPolicies.push({
          label: name,
          value: id,
        });
      });
      setOptions({
        pools: poolOptions,
        images: imageOptions,
        versions: templateOptions,
        policies: securityPolicies,
      });
      setInitialed(true);
    }
    const onQueryTemplateSuccess = dataList =>{
      if(!mounted){
        return;
      }
      dataList.forEach(({id, name}) =>{
        templateOptions.push({
          label: name,
          value: id,
        });
      });
      searchSecurityPolicyGroups('', '', true, true,
        onQueryPoliciesSuccess, onCreateFail);
    }

    const onQueryImageSuccess = dataList =>{
      if(!mounted){
        return;
      }
      dataList.forEach(({name, id})=>{
        imageOptions.push({
          label: name,
          value: id,
        });
      })
      querySystemTemplates(onQueryTemplateSuccess, onCreateFail);
    };

    const onQueryPoolSuccess = dataList =>{
      if(!mounted){
        return;
      }
      dataList.forEach(({name, network})=>{
        poolOptions.push({
          label: name,
          value: name,
          network: network
        });
      })

      searchDiskImages(onQueryImageSuccess, onCreateFail);
    };

    getAllComputePools(onQueryPoolSuccess, onCreateFail);
    return () => {
      setMounted(false);
    }
  }, [mounted, open, texts.blankSystem, onCreateFail]);

  const getAllInstances = (poolValue) => {
    const onLoadSuccess = dataList => {
      if (dataList){
        const datas = dataList.map(item=> {
          return {
            value: item.name,
            label: `${item.name}(${item.address})`
          }
        })
        setCells([{value: '', label: '无' }, ...datas]);
      }
    }
    queryComputeCellsInPool(poolValue, onLoadSuccess, onCreateFail);
  };

  const getNetworks = (networkValue)=> {
    const onLoadSuccess = data => {
      if (data){
        setNetworkAddress(data)
        const ranges = data.ranges.map(item=> {
          return {
            label: `${item.start}-${item.end}`,
            value: `${item.start}-${item.end}`
          }
        })
        setNetworkAddressList([{value: '', label: '无' }, ...ranges])
      }
    }
    getNetworkPool(networkValue, onLoadSuccess, onCreateFail);
  };

  //begin render
  var buttons = [{
    color: 'transparent',
    label: texts.cancel,
    onClick: closeDialog,
  }];
  let content;
  if (!initialed){
    content = <Skeleton variant="rect" style={{height: '10rem'}}/>;
  }else if (creating){
    content = (
      <Grid container>
        <SingleRow>
          <GridItem xs={12}>
            <LinearProgress variant="determinate" value={progress} />
          </GridItem>
        </SingleRow>
        <SingleRow>
          <GridItem xs={12}>
            <Typography align="center">
              {progress.toFixed(2) + '%'}
            </Typography>
          </GridItem>
        </SingleRow>
      </Grid>
    )
  }else{
    const availableCores = [1, 2, 4, 8, 16];
    var coresOptions = []
    availableCores.forEach( core => {
      coresOptions.push({
        label: core.toString(),
        value: core.toString(),
      });
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
        label: name,
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
      systemDiskSlider = {
        type: 'slider',
        label: texts.systemDisk,
        onChange: handleSliderValueChanged('system_disk'),
        value: request.system_disk,
        oneRow: true,
        maxStep: maxRange,
        minStep: minRange,
        step: step,
        marks: systemMarks,
        xs: 12,
        sm: 6,
        md: 4,
      };
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
      dataDiskSlider = {
        type: 'slider',
        label: texts.dataDisk,
        onChange: handleSliderValueChanged('data_disk'),
        value: request.data_disk,
        oneRow: true,
        maxStep: maxRange,
        minStep: minRange,
        step: step,
        marks: dataMarks,
        xs: 12,
        sm: 6,
        md: 4,
      };
    }

    let moduleOption;
    if (request.system_template && defaultOption !== request.from_image){
      var modules = [{
        value: 'qemu',
        label: 'QEMU-Guest-Agent',
      },
      {
        value: ciModuleName,
        label: 'CloudInit',
      }
      ];
      let ciOptions;
      if (request.modules.get(ciModuleName)){
        const ciComponents = [
          {
            type: "text",
            label: texts.adminName,
            onChange: handleRequestPropsChanged('module_cloud_init_admin_name'),
            value: request.module_cloud_init_admin_name,
            oneRow: true,
            xs: 12,
          },
          {
            type: "text",
            label: texts.adminPassword,
            onChange: handleRequestPropsChanged('module_cloud_init_admin_password'),
            helper: texts.blankHelper,
            oneRow: true,
            xs: 12,
          },
          {
            type: "text",
            label: texts.dataPath,
            onChange: handleRequestPropsChanged('module_cloud_init_data_path'),
            value: request.module_cloud_init_data_path,
            disabled: true,
            oneRow: true,
            xs: 12,
          },
        ];
        //ci checked
        ciOptions = (
          <GridItem xs={12} sm={8} md={6}>
            <FormLabel component="legend">{texts.ciOptions}</FormLabel>
            <InputList inputs={ciComponents}/>
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

    var inputComponents = [
      {
        type: "text",
        label: texts.name,
        onChange: handleRequestPropsChanged('name'),
        value: request.name,
        oneRow: true,
        required: true,
        xs: 12,
        sm: 6,
        md: 5,
      },
      {
        type: "select",
        label: texts.resourcePool,
        onChange: handleRequestPropsChanged('pool'),
        value: request.pool,
        oneRow: false,
        options: options.pools,
        required: true,
        xs: 10,
        sm: 6,
        md: 5,
        style: {'marginRight': '20px'}
      },
      {
        type: "select",
        label: texts.selectInstance,
        onChange: handleRequestPropsChanged('cell'),
        value: request.cell,
        oneRow: false,
        options: cells,
        required: true,
        xs: 10,
        sm: 6,
        md: 5,
      },
      {
        type: "select",
        label: texts.selectNetwork,
        onChange: handleRequestPropsChanged('network'),
        value: request.network,
        oneRow: false,
        options: networkAddressList,
        required: true,
        xs: 10,
        sm: 6,
        md: 5,
        style: {'marginRight': '20px'}
      },
      {
        type: "text",
        label: texts.inputIp,
        onChange: handleRequestPropsChanged('network_address'),
        value: request.network_address,
        oneRow: false,
        required: false,
        xs: 10,
        sm: 6,
        md: 5,
        style: {'marginTop': '-16px'}
      },
      {
        type: "radio",
        label: texts.core,
        onChange: handleRequestPropsChanged('cores'),
        value: request.cores,
        oneRow: true,
        options: coresOptions,
        required: true,
        xs: 12,
      },
      {
        type: "radio",
        label: texts.memory,
        onChange: handleRequestPropsChanged('memory'),
        value: request.memory,
        oneRow: true,
        options: memoryOptions,
        required: true,
        xs: 12,
      },
      systemDiskSlider,
      dataDiskSlider,
      {
        type: "select",
        label: texts.sourceImage,
        onChange: handleRequestPropsChanged('from_image'),
        value: request.from_image,
        oneRow: true,
        options: options.images,
        xs: 10,
        sm: 6,
        md: 5,
      },
      {
        type: "select",
        label: texts.systemVersion,
        onChange: handleRequestPropsChanged('system_template'),
        value: request.system_template,
        oneRow: true,
        options: options.versions,
        xs: 10,
        sm: 5,
        md: 4,
      },
      {
        type: "switch",
        label: texts.autoStartup,
        onChange: handleCheckedValueChanged('auto_start'),
        value: request.auto_start,
        on: texts.on,
        off: texts.off,
        oneRow: true,
        xs: 8,
        sm: 6,
        md: 4,
      },
    ];
    if (options.policies && 0 !== options.policies.length){
      inputComponents.push({
        type: "select",
        label: texts.securityPolicy,
        onChange: handleRequestPropsChanged('security_policy'),
        value: request.security_policy,
        oneRow: true,
        options: options.policies,
        xs: 10,
        sm: 5,
        md: 4,
      })
    }

    const priorityOptions = [
      {
        value: 'high',
        label: texts.cpuPriorityHigh,
      },
      {
        value: 'medium',
        label: texts.cpuPriorityMedium,
      },
      {
        value: 'low',
        label: texts.cpuPriorityLow,
      },
    ]
    const qosComponents = [
      {
        type: "radio",
        label: texts.cpuPriority,
        onChange: handleRequestPropsChanged('priority'),
        value: request.priority,
        oneRow: true,
        options: priorityOptions,
        xs: 12,
      },
      {
        type: 'slider',
        label: texts.iops,
        onChange: handleSliderValueChanged('iops'),
        value: request.iops,
        oneRow: true,
        maxStep: 2000,
        minStep: 0,
        step: 10,
        marks: [{value: 0, label: texts.noLimit}, {value: 2000, label: '2000'}],
        xs: 12,
      },
      {
        type: 'slider',
        label: texts.inbound,
        onChange: handleSliderValueChanged('inbound'),
        value: request.inbound,
        oneRow: true,
        maxStep: 20,
        minStep: 0,
        step: 2,
        marks: [{value: 0, label: texts.noLimit}, {value: 20, label: '20 Mbit/s'}],
        xs: 12,
      },
      {
        type: 'slider',
        label: texts.outbound,
        onChange: handleSliderValueChanged('outbound'),
        value: request.outbound,
        oneRow: true,
        maxStep: 20,
        minStep: 0,
        step: 2,
        marks: [{value: 0, label: texts.noLimit}, {value: 20, label: '20 Mbit/s'}],
        xs: 12,
      },
    ];
    content = (
      <Grid container>
        <Box m={1} pt={2}>
          <InputList inputs={inputComponents}/>
        </Box>
        {moduleOption}
        <SingleRow>
          <GridItem xs={12} sm={9} md={7}>
            <Box m={0} pb={2}>
            <ExpansionPanel>
              <ExpansionPanelSummary
                expandIcon={<ExpandMoreIcon />}
              >
                {texts.qos}
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <Box m={1} pt={2}>
                  <InputList inputs={qosComponents}/>
                </Box>
              </ExpansionPanelDetails>
            </ExpansionPanel>
          </Box>
        </GridItem>
      </SingleRow>
    </Grid>
    );
    buttons.push({
        color: 'info',
        label: texts.confirm,
        onClick: handleConfirm,
      });
  }
  return <CustomDialog size='md' open={open} prompt={prompt} promptPosition="top"
    hideBackdrop title={title}  buttons={buttons} content={content} operatable={operatable}/>;
};
