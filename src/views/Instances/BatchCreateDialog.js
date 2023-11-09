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
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';

// dashboard components
import GridItem from "components/Grid/GridItem.js";
import SingleRow from "components/Grid/SingleRow.js";
import CustomDialog from "components/Dialog/CustomDialog.js";
import { InputComponent } from "components/CustomInput/InputList";
import InputList from "components/CustomInput/InputList";
import {
  getAllComputePools, searchDiskImages, batchCreatingGuests, getSystemStatus,
  checkBatchCreatingStatus, querySystemTemplates
} from 'nano_api.js';

const i18n = {
  'en': {
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
  'cn': {
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

export default function CreateDialog(props) {
  const defaultMaxCores = 16;
  const defaultMaxMemory = 24;
  const defaultMaxDisk = 32;
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
    system_template: '',
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
  const [initialed, setInitialed] = React.useState(false);
  const [stage, setStage] = React.useState(StageEnum.initial);
  const [resultList, setResultList] = React.useState(null);
  const [operatable, setOperatable] = React.useState(true);
  const [prompt, setPrompt] = React.useState('');
  const [mounted, setMounted] = React.useState(false);
  const [request, setRequest] = React.useState(defaultValues);
  const [options, setOptions] = React.useState({
    pools: [],
    images: [],
    versions: [],
  });
  const [maxCores, setMaxCores] = React.useState(defaultMaxCores);
  const [maxMemory, setMaxMemory] = React.useState(defaultMaxMemory);
  const [maxDisk, setMaxDisk] = React.useState(defaultMaxDisk);
  const [coreValue, setCoreValue] = React.useState(0);
  const [memoryTick, setMemoryTick] = React.useState(1);
  const texts = i18n[lang];
  const title = texts.title;

  const onCreateFail = React.useCallback(msg => {
    if (!mounted) {
      return;
    }
    setOperatable(true);
    setPrompt(msg);
  }, [mounted]);

  const resetDialog = () => {
    setPrompt('');
    setRequest(defaultValues);
    setInitialed(false);
    setStage(StageEnum.initial);
  }

  const closeDialog = () => {
    resetDialog();
    onCancel();
  }

  const onCreateSuccess = () => {
    if (!mounted) {
      return;
    }
    resetDialog();
    onSuccess();
  }

  const onAccept = batchID => {
    if (!mounted) {
      return;
    }
    setPrompt('');
    if (StageEnum.initial === stage) {
      setStage(StageEnum.processing);
    }
    checkBatchCreatingStatus(batchID, onProcessing(batchID), onComplete(batchID), onCreateFail);
  }

  const onProcessing = batchID => dataList => {
    if (!mounted) {
      return;
    }
    setResultList(dataList);
    setTimeout(() => {
      checkBatchCreatingStatus(batchID, onProcessing(batchID), onComplete(batchID), onCreateFail);
    }, checkInterval);
  }

  const onComplete = batchID => dataList => {
    if (!mounted) {
      return;
    }
    setResultList(dataList);
    if (StageEnum.finish !== stage) {
      setOperatable(true);
      setStage(StageEnum.finish);
    }
  }

  const handleConfirm = () => {
    setPrompt('');
    setOperatable(false);
    if (!request.prefix) {
      onCreateFail('prefix required');
      return;
    }
    var count = Number.parseInt(request.count);
    if (Number.isNaN(count)) {
      onCreateFail('invalid count: ' + request.count);
      return;
    }

    if (!request.pool) {
      onCreateFail('must specify target pool');
      return;
    }
    var cores = Number.parseInt(request.cores);
    if (Number.isNaN(cores)) {
      onCreateFail('invalid cores: ' + request.cores);
      return;
    }
    var memory = Number.parseInt(request.memory);
    if (Number.isNaN(memory)) {
      onCreateFail('invalid memory: ' + request.memory);
      return;
    }
    const GiB = 1 << 30;
    var disks = [request.system_disk * GiB];
    if (0 !== request.data_disk) {
      disks.push(request.data_disk * GiB);
    }
    var systemVersion = request.system_template;
    let fromImage;
    if (defaultOption === request.from_image) {
      fromImage = '';
    } else {
      fromImage = request.from_image;
    }
    var modules = [];
    var ciEnabled = false;
    request.modules.forEach((checked, name) => {
      if (checked) {
        modules.push(name);
        if (ciModuleName === name) {
          ciEnabled = true;
        }
      }
    });
    var cloudInit = null;
    if (ciEnabled) {
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

  const handleRequestPropsChanged = name => e => {
    if (!mounted) {
      return;
    }
    var value = e.target.value
    setRequest(previous => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSliderValueChanged = name => (e, value) => {
    if (!mounted) {
      return;
    }
    setRequest(previous => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCheckedValueChanged = name => e => {
    if (!mounted) {
      return;
    }
    var value = e.target.checked
    setRequest(previous => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCheckedGroupChanged = (groupName, propertyName) => e => {
    if (!mounted) {
      return;
    }
    var checked = e.target.checked
    setRequest(previous => ({
      ...previous,
      [groupName]: previous[groupName].set(propertyName, checked),
    }));
  };

  React.useEffect(() => {
    if (!open) {
      return;
    }
    var poolOptions = [];
    var imageOptions = [{
      label: texts.blankSystem,
      value: defaultOption,
    }];
    var templateOptions = [];

    setMounted(true);
    const onQueryTemplateSuccess = dataList => {
      if (!mounted) {
        return;
      }
      dataList.forEach(({ id, name }) => {
        templateOptions.push({
          label: name,
          value: id,
        });
      });
      setOptions({
        pools: poolOptions,
        images: imageOptions,
        versions: templateOptions,
      });
      setInitialed(true);
    }

    const onQueryImageSuccess = dataList => {
      if (!mounted) {
        return;
      }
      dataList.forEach(({ name, id }) => {
        imageOptions.push({
          label: name,
          value: id,
        });
      })
      querySystemTemplates(onQueryTemplateSuccess, onCreateFail);
    };

    const onQueryPoolSuccess = dataList => {
      if (!mounted) {
        return;
      }
      dataList.forEach(({ name }) => {
        poolOptions.push({
          label: name,
          value: name,
        });
      })

      searchDiskImages(onQueryImageSuccess, onCreateFail);
    };

    const onGetSystemStatusSuccess = status => {
      if (!mounted) {
        return;
      }
      if (status.max_cores && status.max_cores > 0) {
        setMaxCores(status.max_cores);
      }
      if (status.max_memory && status.max_memory > 0) {
        setMaxMemory(status.max_memory);
      }
      if (status.max_disk && status.max_disk > 0) {
        setMaxDisk(status.max_disk);
      }
      getAllComputePools(onQueryPoolSuccess, onCreateFail);
    }

    getSystemStatus(onGetSystemStatusSuccess, onCreateFail);

    return () => {
      setMounted(false);
    }
  }, [mounted, open, texts.blankSystem, onCreateFail]);


  const resultToTable = dataList => {
    if (!mounted) {
      return;
    }
    var rows = [];
    if (!dataList) {
      return <div />;
    }
    dataList.forEach((result, index) => {
      let content;
      if ('fail' === result.status) {
        content = texts.fail + ':' + result.error;
      } else if ('created' === result.status) {
        content = texts.complete;
      } else {
        //stopping
        const progress = result.progress;
        content = (
          <Grid container>
            <GridItem xs={8} sm={9} md={10}>
              <LinearProgress variant="determinate" value={progress} />
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


  const cancelButton = {
    color: "transparent",
    label: texts.cancel,
    onClick: closeDialog,
  };
  const confirmButton = {
    color: 'info',
    label: texts.confirm,
    onClick: handleConfirm,
  };
  const finishButton = {
    color: 'info',
    label: texts.finish,
    onClick: onCreateSuccess,
  };

  let content, buttons;
  if (!initialed) {
    content = <Skeleton variant="rect" style={{ height: '10rem' }} />;
    buttons = [cancelButton];
  } else {
    switch (stage) {
      case StageEnum.processing:
        content = resultToTable(resultList);
        if (prompt) {
          buttons = [cancelButton];
        } else {
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
        // new core component
        const coreLabel = value => {
          let cores = 2 ** value;
          if (cores > maxCores) {
            cores = maxCores;
          }
          return cores.toString();
        }

        const onCoreChanged = (e, value) => {
          if (!mounted) {
            return;
          }
          setCoreValue(value);
          let cores = 2 ** value;
          if (cores > maxCores) {
            cores = maxCores;
          }
          setRequest(previous => ({
            ...previous,
            cores: cores,
          }));
        };
        let maxCoreRange = Math.ceil(Math.sqrt(maxCores));
        let minCoreRange = 0;
        let coreMarks = [];
        for (let value = minCoreRange + 1; value <= maxCoreRange; ++value) {
          let cores = 2 ** value;
          if (cores > maxCores) {
            cores = maxCores;
          }
          coreMarks.push({
            value: value,
            label: cores.toString(),
          });
        }

        let coreComponent = {
          type: 'slider',
          label: texts.core + ` - ${request.cores}`,
          onChange: onCoreChanged,
          valueLabelFormat: coreLabel,
          value: coreValue,
          oneRow: true,
          maxStep: maxCoreRange,
          minStep: minCoreRange,
          step: 1,
          marks: coreMarks,
          xs: 12,
          sm: 6,
          md: 4,
        };

        // new memory component
        const memoryBase = 512;
        const MiB = 1 << 20;
        const GiB = 1 << 30;
        const displayMemory = memory => {
          let label;
          if (memory >= GiB) {
            label = memory / GiB + ' GB';
          } else {
            label = memory / MiB + ' MB';
          }
          return label;
        }

        const onMemoryChanged = (e, value) => {
          if (!mounted) {
            return;
          }
          setMemoryTick(value);
          let memory = 2 ** value * memoryBase * MiB;
          if (memory > maxMemory * GiB) {
            memory = maxMemory * GiB;
          }
          setRequest(previous => ({
            ...previous,
            memory: memory,
          }));
        };
        let maxMemoryRange = Math.ceil(Math.sqrt(maxMemory));
        let minMemoryRange = 0;
        let memoryMarks = [];
        for (let value = minMemoryRange + 1; value <= maxMemoryRange; ++value) {
          let memory = 2 ** value * memoryBase * MiB;
          if (memory > maxMemory * GiB) {
            memory = maxMemory * GiB;
          }
          memoryMarks.push({
            value: value,
            label: displayMemory(memory),
          });
        }
        let memoryLabel = texts.memory + ` - ${displayMemory(request.memory)}`;
        let memoryComponent = {
          type: 'slider',
          label: memoryLabel,
          onChange: onMemoryChanged,
          valueLabelDisplay: 'off',
          value: memoryTick,
          oneRow: true,
          maxStep: maxMemoryRange,
          minStep: minMemoryRange,
          step: 1,
          marks: memoryMarks,
          xs: 12,
          sm: 8,
          md: 6,
        };

        //system disk slider
        let systemDiskSlider;
        let systemDiskLabel = texts.systemDisk + ` - ${request.system_disk} GB`;
        {
          const step = 1;
          const minRange = 5;
          const maxRange = maxDisk;
          let midRange = maxRange >> 1;
          const markValues = [minRange, midRange, maxRange];
          var systemMarks = [];
          markValues.forEach(value => {
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
        let dataDiskLabel;
        {
          const minRange = 0;
          const step = 2;
          const maxRange = maxDisk;
          let midRange = maxRange >> 1;
          const markValues = [minRange, midRange, maxRange];
          let dataMarks = [];
          markValues.forEach(value => {
            dataMarks.push({
              value: value,
              label: value + ' GB',
            })
          });
          if (0 === request.data_disk) {
            dataDiskLabel = texts.dataDisk + ' - ' + texts.noDataDisk;
          } else {
            dataDiskLabel = texts.dataDisk + ` - ${request.data_disk} GB`;
          }
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
        if (request.system_template && defaultOption !== request.from_image) {
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
          if (request.modules.get(ciModuleName)) {
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
          } else {
            ciOptions = <GridItem />;
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
                            if (request.modules.has(module.value)) {
                              checked = request.modules.get(module.value);
                            } else {
                              checked = false;
                            }
                            return (
                              <GridItem xs={12} sm={6} md={4} key={module.value}>
                                <FormControlLabel
                                  control={<Checkbox checked={checked} onChange={handleCheckedGroupChanged('modules', module.value)} value={module.value} />}
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

        } else {
          moduleOption = <GridItem />;
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

        const maxIOPS = 2000;
        const iopsAchor = [0, maxIOPS / 2, maxIOPS];
        let iopsMarks = [];
        iopsAchor.forEach(value => {
          iopsMarks.push({
            value: value,
            label: value.toString(),
          })
        });

        const maxBandwidth = 20;
        const bandwidthAchor = [0, maxBandwidth / 2, maxBandwidth];
        let bandwidthMarks = [];
        bandwidthAchor.forEach(value => {
          bandwidthMarks.push({
            value: value,
            label: 0 === value ? texts.noLimit : value.toString() + ' Mbit/s',
          })
        });

        let iopsLabel, inboundLabel, outboundLabel;
        if (0 === request.iops) {
          iopsLabel = texts.iops + ' - ' + texts.noLimit;
        } else {
          if ('cn' === lang) {
            iopsLabel = texts.iops + ' - ' + request.iops + '次请求/秒';
          } else {
            iopsLabel = texts.iops + ' - ' + request.iops + ' Operates/Second';
          }
        }
        if (0 === request.inbound) {
          inboundLabel = texts.inbound + ' - ' + texts.noLimit;
        } else {
          inboundLabel = texts.inbound + ' - ' + request.inbound + ' Mbit/s';
        }
        if (0 === request.outbound) {
          outboundLabel = texts.outbound + ' - ' + texts.noLimit;
        } else {
          outboundLabel = texts.outbound + ' - ' + request.outbound + ' Mbit/s';
        }

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
            label: iopsLabel,
            onChange: handleSliderValueChanged('iops'),
            value: request.iops,
            oneRow: true,
            maxStep: maxIOPS,
            minStep: 0,
            step: 10,
            marks: iopsMarks,
            xs: 12,
          },
          {
            type: 'slider',
            label: inboundLabel,
            onChange: handleSliderValueChanged('inbound'),
            value: request.inbound,
            oneRow: true,
            maxStep: maxBandwidth,
            minStep: 0,
            step: 2,
            marks: bandwidthMarks,
            xs: 12,
          },
          {
            type: 'slider',
            label: outboundLabel,
            onChange: handleSliderValueChanged('outbound'),
            value: request.outbound,
            oneRow: true,
            maxStep: maxBandwidth,
            minStep: 0,
            step: 2,
            marks: bandwidthMarks,
            xs: 12,
          },
        ];

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
                          <FormControlLabel value={RuleEmum.order} control={<Radio />} label={texts.ruleOrder} />
                        </Box>
                        <Box>
                          <FormControlLabel value={RuleEmum.MAC} control={<Radio disabled />} label={texts.ruleMAC} />
                        </Box>
                        <Box>
                          <FormControlLabel value={RuleEmum.address} control={<Radio disabled />} label={texts.ruleAddress} />
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
                    marks={[{ value: 1, label: '1' }, { value: 10, label: '10' }, { value: 20, label: '20' }]}
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
                      options.pools.map((option, key) => (
                        <MenuItem value={option.value} key={key}>{option.label}</MenuItem>
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
                    <InputComponent {...coreComponent} />
                  </FormControl>
                </Box>
              </GridItem>
              <GridItem xs={12}>
                <Box m={0} pt={2}>
                  <FormControl component="fieldset" fullWidth>
                    <InputComponent {...memoryComponent} />
                  </FormControl>
                </Box>
              </GridItem>
            </SingleRow>

            <SingleRow>
              <GridItem xs={12} sm={6} md={4}>
                <Box m={0} pt={2}>
                  <FormLabel component="legend">{systemDiskLabel}</FormLabel>
                  {systemDiskSlider}
                </Box>
              </GridItem>
            </SingleRow>
            <SingleRow>
              <GridItem xs={12} sm={6} md={4}>
                <Box m={0} pt={2}>
                  <FormLabel component="legend">{dataDiskLabel}</FormLabel>
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
                      options.images.map((option, key) => (
                        <MenuItem value={option.value} key={key}>{option.label}</MenuItem>
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
                    value={request.system_template}
                    onChange={handleRequestPropsChanged('system_template')}
                    inputProps={{
                      name: 'version',
                      id: 'version',
                    }}
                    fullWidth
                  >
                    {
                      options.versions.map((option, key) => (
                        <MenuItem value={option.value} key={key}>{option.label}</MenuItem>
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
              <GridItem xs={12} sm={9} md={7}>
                <Box m={0} pb={2}>
                  <Accordion>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                    >
                      {texts.qos}
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box m={1} pt={2}>
                        <InputList inputs={qosComponents} />
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                </Box>
              </GridItem>
            </SingleRow>
          </Grid>
        );
    }
  }
  return <CustomDialog size='md' open={open} prompt={prompt} promptPosition="top"
    hideBackdrop title={title} buttons={buttons} content={content} operatable={operatable} />;
};
