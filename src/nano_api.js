import axios from "axios";
import { getLoggedSession } from 'utils.js';

const apiRoot = 'http://201.18.21.153:5870/api/v1';
// const apiRoot = 'http://192.168.3.26:5870/api/v1';
// const apiRoot = 'http://192.168.1.111:5870/api/v1';
// const apiRoot = '/api/v1';
const HeaderNanoSession = "Nano-Session";
const currentVersion = '1.2.0';

export function getCurrentVersion(){
  return currentVersion;
}

export function getAllMenus(lang){
  const i18n = {
    'en':{
      dashboard: 'Dashboard',
      computePool: 'Compute Pools',
      addressPool: 'Address Pools',
      storagePool: 'Storage Pools',
      instance: 'Instances',
      diskImage: 'Disk Image',
      mediaImage: 'Media Image',
      user: 'Users',
      log: 'Logs',
      visibility: 'Resource Visibility',
    },
    'cn':{
      dashboard: '仪表盘',
      computePool: '计算资源池',
      addressPool: '地址资源池',
      storagePool: '存储资源池',
      instance: '云主机实例',
      diskImage: '磁盘镜像',
      mediaImage: '光盘镜像',
      user: '用户',
      log: '日志',
      visibility: '资源可见性',
    },
  }
  const texts = i18n[lang];
  const menus = [
    {
      value: 'dashboard',
      label: texts.dashboard,
    },
    {
      value: 'compute_pool',
      label: texts.computePool,
    },
    {
      value: 'address_pool',
      label: texts.addressPool,
    },
    {
      value: 'storage_pool',
      label: texts.storagePool,
    },
    {
      value: 'instance',
      label: texts.instance,
    },
    {
      value: 'image',
      label: texts.diskImage,
    },
    {
      value: 'media',
      label: texts.mediaImage,
    },
    {
      value: 'user',
      label: texts.user,
    },
    {
      value: 'log',
      label: texts.log,
    },
    {
      value: 'visibility',
      label: texts.visibility,
    },
  ];
  return menus;
}

export function loginUser(name, password, onSuccess, onFail){
  const generateNonce = () =>{
    const length = 16;
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };
  var request = {
    user: name,
    password: password,
    nonce: generateNonce(),
  };
  var url = '/sessions/';
  nakePostRequest(url, request, onSuccess, onFail);
}

export function updateSession(onFail){
  var session = getLoggedSession();
  if (null == session){
    onFail('session expired');
    return;
  }
  var url = apiRoot + '/sessions/' + session.id;
  var headers = {
    [HeaderNanoSession]:session.id,
  };
  axios.put(url, "", {
    headers: headers,
  })
  .then(({data})=>{
    if (0 !== data.error_code){
      onFail(data.message);
      return
    }
    return;
  })
  .catch((e) =>{
    onFail(e.message);
  })
}

export function openMonitorChannel(instanceID, onSuccess, onFail){
  const url = '/monitor_channels/';
  const request = {
    guest: instanceID,
  };
  const onOperateSuccess = data =>{
    onSuccess(data.id, data.password);
  }
  postRequest(url, request, onOperateSuccess, onFail);
}

export function getMonitorURL(channelID){
  const WSPrefix = "ws://";
  const HTTPPrefix = "http://";
  const HTTPSPrefix = "https://";
  var url = apiRoot + '/monitor_channels/' + channelID;
  if (url.startsWith(WSPrefix)){
    return url
  }else if (url.startsWith(HTTPPrefix)){
    return url.replace(HTTPPrefix, WSPrefix);
  }else if (url.startsWith(HTTPSPrefix)){
    return url.replace(HTTPSPrefix, WSPrefix);
  }else{
    //plain url
    var hostURL = WSPrefix + window.location.hostname;
    if (window.location.port){
      hostURL += ":" + window.location.port;
    }
    return hostURL + url;
  }
}

//Zone status
export function getZoneStatus(onSuccess, onFail){
  getRequest('/compute_zone_status/', onSuccess, onFail);
}

//Compute Pool Status
export function getAllComputePoolStatus(onSuccess, onFail){
  getRequest('/compute_pool_status/', onSuccess, onFail);
}

//Compute Cell Status
export function queryComputeCellStatus(poolName, onSuccess, onFail){
  getRequest('/compute_cell_status/' + poolName, onSuccess, onFail);
}

//Compute pools
export function getAllComputePools(onSuccess, onFail){
  getRequest('/compute_pools/', onSuccess, onFail);
}

export function getComputePool(poolName, onSuccess, onFail){
  var url = '/compute_pools/' + poolName;
  getRequest(url, onSuccess, onFail);
}

export function createComputePool(poolName, storage, network, failover, onSuccess, onFail){
  var url = '/compute_pools/' + poolName;
  var request = {
    storage: storage,
    network: network,
    failover: failover,
  }
  const onCreateSuccess = () =>{
    onSuccess(poolName);
  }
  postRequest(url, request, onCreateSuccess, onFail);
}

export function modifyComputePool(poolName, storage, network, failover, onSuccess, onFail){
  var url = '/compute_pools/' + poolName;
  var request = {
    storage: storage,
    network: network,
    failover: failover,
  }
  const onModifySuccess = () => {
    onSuccess(poolName);
  }
  putRequest(url, request, onModifySuccess, onFail);
}

export function deleteComputePool(poolName, onSuccess, onFail){
  const onDeleteSuccess = () => {
    onSuccess(poolName);
  }
  const onDeleteFail = (msg) => {
    onFail('delete compute pool "' + poolName +'" fail: ' + msg);
  }
  deleteRequest('/compute_pools/' + poolName, onDeleteSuccess, onDeleteFail);
}

//compute cells
export function queryUnallocatedComputeCells(onSuccess, onFail){
  getRequest('/compute_pool_cells/', onSuccess, onFail);
}

export function queryComputeCellsInPool(poolName, onSuccess, onFail){
  var url = '/compute_pool_cells/' + poolName;
  getRequest(url, onSuccess, onFail);
}

export function addComputeCell(poolName, cellName, onSuccess, onFail){
  var url = '/compute_pool_cells/' + poolName + '/' + cellName;
  const onAddSuccess = () =>{
    onSuccess(poolName, cellName);
  }
  postRequest(url, "", onAddSuccess, onFail);
}

export function modifyComputeCell(poolName, cellName, enable, onSuccess, onFail){
  var url = '/compute_pool_cells/' + poolName + '/' + cellName;
  var request = {
    enable: enable,
  }
  const onModifySuccess = () =>{
    onSuccess(poolName, cellName, enable);
  }
  putRequest(url, request, onModifySuccess, onFail);
}

export function removeComputeCell(poolName, cellName, onSuccess, onFail){
  var url = '/compute_pool_cells/' + poolName + '/' + cellName;
  const onRemoveSuccess = () =>{
    onSuccess(poolName, cellName);
  }
  const onRemoveFail = (msg) =>{
    onFail('remove cell "'+ cellName + '" from pool "' + poolName +'" fail: ' + msg);
  }
  deleteRequest(url, onRemoveSuccess, onRemoveFail);
}

export function getComputeCell(poolName, cellName, onSuccess, onFail){
  var url = '/compute_pool_cells/' + poolName + '/' + cellName;
  getRequest(url, onSuccess, onFail);
}

//Storage Pools
export function getAllStoragePools(onSuccess, onFail){
  getRequest('/storage_pools/', onSuccess, onFail);
}

export function getStoragePool(name, onSuccess, onFail){
  getRequest('/storage_pools/' + name, onSuccess, onFail);
}

export function createStoragePool(name, type, host, target, onSuccess, onFail){
  const onOperateSuccess = () =>{
    onSuccess(name);
  }
  var request = {
    type: type,
    host: host,
    target: target,
  }
  postRequest('/storage_pools/'+ name, request, onOperateSuccess, onFail);
}

export function modifyStoragePool(name, type, host, target, onSuccess, onFail){
  const onOperateSuccess = () =>{
    onSuccess(name);
  }
  var request = {
    type: type,
    host: host,
    target: target,
  }
  putRequest('/storage_pools/'+ name, request, onOperateSuccess, onFail);
}

export function deleteStoragePool(name, onSuccess, onFail){
  const onOperateSuccess = () =>{
    onSuccess(name);
  }
  deleteRequest('/storage_pools/'+ name, onOperateSuccess, onFail);
}

//Network Pools
export function getAllNetworkPools(onSuccess, onFail){
  getRequest('/address_pools/', onSuccess, onFail);
}

export function getNetworkPool(name, onSuccess, onFail){
  getRequest('/address_pools/' + name, onSuccess, onFail);
}

export function createNetworkPool(name, gateway, dnsList, onSuccess, onFail){
  const onOperateSuccess = () =>{
    onSuccess(name);
  }
  var request = {
    gateway: gateway,
    dns: dnsList,
  }
  postRequest('/address_pools/' + name, request, onOperateSuccess, onFail);
}

export function modifyNetworkPool(name, gateway, dnsList, onSuccess, onFail){
  const onOperateSuccess = () =>{
    onSuccess(name);
  }
  var request = {
    gateway: gateway,
    dns: dnsList,
  }
  putRequest('/address_pools/' + name, request, onOperateSuccess, onFail);
}

export function deleteNetworkPool(name, onSuccess, onFail){
  const onOperateSuccess = () =>{
    onSuccess(name);
  }
  deleteRequest('/address_pools/' + name, onOperateSuccess, onFail);
}

export function queryAddressRanges(name, rangeType, onSuccess, onFail){
  getRequest('/address_pools/' + name + '/' + rangeType + '/ranges/', onSuccess, onFail);
}

export function getAddressRangeStatus(poolName, rangeType, startAddress, onSuccess, onFail){
  getRequest('/address_pools/' + poolName + '/'+ rangeType +'/ranges/' + startAddress, onSuccess, onFail);
}

export function addAddressRange(poolName, rangeType, startAddress, endAddress, mask, onSuccess, onFail){
  const url = '/address_pools/' + poolName + '/'+ rangeType +'/ranges/' + startAddress;
  const request = {
    end: endAddress,
    netmask: mask,
  }
  const onOperateSuccess = () => {
    onSuccess(startAddress, poolName);
  }
  postRequest(url, request, onOperateSuccess, onFail);
}

export function removeAddressRange(poolName, rangeType, startAddress, onSuccess, onFail){
  const url = '/address_pools/' + poolName + '/'+ rangeType +'/ranges/' + startAddress;
  const onOperateSuccess = () => {
    onSuccess(startAddress, poolName);
  }
  deleteRequest(url, onOperateSuccess, onFail);
}

//Instances
export function searchInstances(poolName, cellName, onSuccess, onFail){
  if (!poolName){
    onFail('must specify pool name');
    return;
  }
  var url = '/guest_search/?pool=' + poolName;
  if (cellName){
    url += '&cell=' + cellName;
  }
  getRequest(url, onSuccess, onFail);
}

export function getInstanceConfig(id, onSuccess, onFail, onCreating){
  const onGetSuccess = (status, data) =>{
    if (201 === status){
      const { progress, name, created } = data;
      onCreating(progress, name, created);
    }else if (200 === status){
      onSuccess(data);
    }else{
      onFail('unexpected status ' + status.toString());
    }
  }
  getRequestWithStatus('/guests/' + id, onGetSuccess, onFail);
}

export function getInstanceStatus(id, onSuccess, onFail, onCreating){
  const onGetSuccess = (status, data) =>{
    if (201 === status){
      const { progress, name, created } = data;
      onCreating(progress, name, created);
    }else if (200 === status){
      onSuccess(data);
    }else{
      onFail('unexpected status ' + status.toString());
    }
  }
  getRequestWithStatus('/instances/' + id, onGetSuccess, onFail);
}

export function createInstance(name, pool, cores, memory, disks, autoStartup,
  fromImage, systemVersion, modules, cloudInit, qos, onAccept, onSuccess, onFail){
    var session = getLoggedSession();
    if (null === session){
      onFail('session expired');
      return;
    }
    var request = {
      name: name,
      owner: session.user,
      group: session.group,
      pool: pool,
      cores: cores,
      memory: memory,
      disks: disks,
      auto_start: autoStartup,
      from_image: fromImage,
      system_version: systemVersion,
    };
    if (modules){
      request.modules = modules;
    }
    if (cloudInit){
      request.cloud_init = cloudInit;
    }
    if (qos){
      request.qos = qos;
    }
    const onCreateResponse = (status, data) => {
      if (202 === status){
        onAccept(data.id);
      }else if (200 === status){
        onSuccess(data.id);
      }else{
        onFail('unexpected status ' + status.toString());
      }
    }
    postRequestWithStatus('/guests/', request, onCreateResponse, onFail);
}

export function deleteInstance(id, onSuccess, onFail){
  var request = {
    force: false,
  }
  deleteRequestWithPayload('/guests/' + id, request, onSuccess, onFail);
}

export function startInstance(id, onSuccess, onFail){
  const onStartSuccess = () =>{
    onSuccess(id);
  }
  postRequest('/instances/' + id, {}, onStartSuccess, onFail);
}

export function startInstanceWithMedia(instanceID, imageID, onSuccess, onFail){
  const onStartSuccess = () =>{
    onSuccess(instanceID);
  }
  const request = {
    from_media: true,
    source: imageID,
  }
  postRequest('/instances/' + instanceID, request, onStartSuccess, onFail);
}

export function insertMedia(instanceID, imageID, onSuccess, onFail){
  const onOperateSuccess = () =>{
    onSuccess(instanceID);
  }
  const request = {
    source: imageID,
  }
  postRequest('/instances/' + instanceID + '/media', request, onOperateSuccess, onFail);
}

export function ejectMedia(instanceID, onSuccess, onFail){
  const onOperateSuccess = () =>{
    onSuccess(instanceID);
  }
  deleteRequest('/instances/' + instanceID + '/media', onOperateSuccess, onFail);
}

export function stopInstance(id, onSuccess, onFail){
  const onStopSuccess = () =>{
    onSuccess(id);
  }
  var payload = {
    reboot: false,
    force: false,
  }
  deleteRequestWithPayload('/instances/' + id, payload, onStopSuccess, onFail);
}

export function forceStopInstance(id, onSuccess, onFail){
  const onStopSuccess = () =>{
    onSuccess(id);
  }
  var payload = {
    reboot: false,
    force: true,
  }
  deleteRequestWithPayload('/instances/' + id, payload, onStopSuccess, onFail);
}

export function restartInstance(id, onSuccess, onFail){
  const onRestartSuccess = () =>{
    onSuccess(id);
  }
  var payload = {
    reboot: true,
    force: false,
  }
  deleteRequestWithPayload('/instances/' + id, payload, onRestartSuccess, onFail);
}

export function resetInstance(id, onSuccess, onFail){
  const onRestartSuccess = () =>{
    onSuccess(id);
  }
  var payload = {
    reboot: true,
    force: true,
  }
  deleteRequestWithPayload('/instances/' + id, payload, onRestartSuccess, onFail);
}

export function resetSystem(instanceID, imageID, onSuccess, onFail){
  const onOperateSuccess = () =>{
    onSuccess(instanceID);
  }
  const request = {
    from_image: imageID,
  }
  putRequest('/guests/' + instanceID + '/system/', request, onOperateSuccess, onFail);
}

export function modifyInstanceName(instanceID, name, onSuccess, onFail){
  const onOperateSuccess = () =>{
    onSuccess(name, instanceID);
  }
  const request = {
    name: name,
  }
  putRequest('/guests/' + instanceID + '/name/', request, onOperateSuccess, onFail);
}

export function modifyInstanceCores(instanceID, cores, onSuccess, onFail){
  const onOperateSuccess = () =>{
    onSuccess(cores, instanceID);
  }
  const request = {
    cores: cores,
  }
  putRequest('/guests/' + instanceID + '/cores', request, onOperateSuccess, onFail);
}

export function modifyInstanceMemory(instanceID, sizeInBytes, onSuccess, onFail){
  const onOperateSuccess = () =>{
    onSuccess(sizeInBytes, instanceID);
  }
  const request = {
    memory: sizeInBytes,
  }
  putRequest('/guests/' + instanceID + '/memory', request, onOperateSuccess, onFail);
}

export function resizeInstanceDisk(instanceID, index, sizeInBytes, onSuccess, onFail){
  const onOperateSuccess = () =>{
    onSuccess(index, sizeInBytes, instanceID);
  }
  const request = {
    size: sizeInBytes,
  }
  putRequest('/guests/' + instanceID + '/disks/resize/' + index.toString(), request, onOperateSuccess, onFail);
}

export function shrinkInstanceDisk(instanceID, index, onSuccess, onFail){
  const onOperateSuccess = () =>{
    onSuccess(index, instanceID);
  }
  const request = {
    immediate: false,
  }
  putRequest('/guests/' + instanceID + '/disks/shrink/' + index.toString(), request, onOperateSuccess, onFail);
}

export function modifyInstanceAdminPassword(instanceID, user, password, onSuccess, onFail){
  const onOperateSuccess = ({user, password}) =>{
    onSuccess(user, password, instanceID);
  }
  var request = {
  }
  if (user){
    request.user = user;
  }
  if (password){
    request.password = password;
  }
  putRequest('/guests/' + instanceID + '/auth', request, onOperateSuccess, onFail);
}

export function getInstanceAdminPassword(instanceID, onSuccess, onFail){
  const onOperateSuccess = ({user, password}) =>{
    onSuccess(user, password, instanceID);
  }
  getRequest('/guests/' + instanceID + '/auth', onOperateSuccess, onFail);
}

export function modifyInstancePriority(instanceID, priority, onSuccess, onFail){
  const onOperateSuccess = () =>{
    onSuccess(priority, instanceID);
  }
  var request = {
    priority: priority,
  }
  putRequest('/guests/' + instanceID + '/qos/cpu', request, onOperateSuccess, onFail);
}

export function modifyInstanceDiskIOPS(instanceID, iops, onSuccess, onFail){
  const onOperateSuccess = () =>{
    onSuccess(iops, instanceID);
  }
  var request = {
    write_iops: iops,
    read_iops: iops,
  }
  putRequest('/guests/' + instanceID + '/qos/disk', request, onOperateSuccess, onFail);
}

export function modifyInstanceBandwidth(instanceID, inbound, outbound, onSuccess, onFail){
  const onOperateSuccess = () =>{
    onSuccess(inbound, outbound, instanceID);
  }
  var request = {
    receive_speed: inbound,
    send_speed: outbound,
  }
  putRequest('/guests/' + instanceID + '/qos/network', request, onOperateSuccess, onFail);
}

//instance snapshots
export function queryInstanceSnapshots(instanceID, onSuccess, onFail){
  const url = '/instances/' + instanceID + '/snapshots/';
  getRequest(url, onSuccess, onFail);
}

export function createInstanceSnapshot(instanceID, name, description, onSuccess, onFail){
  const url = '/instances/' + instanceID + '/snapshots/';
  const request = {
    name: name,
    description: description,
  }
  const onOperateSuccess = () =>{
    onSuccess(name, instanceID)
  }
  postRequest(url, request, onOperateSuccess, onFail);
}

export function getInstanceSnapshot(instanceID, name, onSuccess, onFail){
  const url = '/instances/' + instanceID + '/snapshots/' + name;
  getRequest(url, onSuccess, onFail);
}

export function deleteInstanceSnapshot(instanceID, name, onSuccess, onFail){
  const url = '/instances/' + instanceID + '/snapshots/' + name;
  const onOperateSuccess = () =>{
    onSuccess(name, instanceID)
  }
  deleteRequest(url, onOperateSuccess, onFail);
}

export function restoreInstanceSnapshot(instanceID, name, onSuccess, onFail){
  const url = '/instances/' + instanceID + '/snapshots/';
  const request = {
    target: name,
  }
  const onOperateSuccess = () =>{
    onSuccess(name, instanceID)
  }
  putRequest(url, request, onOperateSuccess, onFail);
}

export function migrateSingleInstance(sourcePool, sourceCell, targetCell, instanceID, onSuccess, onFail){
  const onOperateSuccess = () =>{
    onSuccess(instanceID);
  }
  var request = {
    source_pool: sourcePool,
    source_cell: sourceCell,
    target_cell: targetCell,
    instances: [instanceID],
  };
  postRequest('/migrations/', request, onOperateSuccess, onFail);
}

export function migrateInstancesInCell(sourcePool, sourceCell, targetCell, onSuccess, onFail){
  const onOperateSuccess = () =>{
    onSuccess(sourceCell, targetCell);
  }
  var request = {
    source_pool: sourcePool,
    source_cell: sourceCell,
    target_cell: targetCell,
  };
  postRequest('/migrations/', request, onOperateSuccess, onFail);
}


//media Images
export function searchMediaImages(onSuccess, onFail){
  getRequest('/media_image_search/', onSuccess, onFail);
}

export function getMediaImage(id, onSuccess, onFail){
  var url = '/media_images/' + id;
  getRequest(url, onSuccess, onFail);
}

export function createMediaImage(name, description, tags, onSuccess, onFail){
  var session = getLoggedSession();
  if (null === session){
    onFail('session expired');
    return;
  }
  var url = '/media_images/';
  var request = {
    name: name,
    description: description,
    tags: tags,
    owner: session.user,
    group: session.group,
  };
  const onModifySuccess = (data) => {
    onSuccess(data.id);
  }
  postRequest(url, request, onModifySuccess, onFail);
}

export function modifyMediaImage(id, name, description, tags, onSuccess, onFail){
  var session = getLoggedSession();
  if (null === session){
    onFail('session expired');
    return;
  }
  var url = '/media_images/' + id;
  var request = {
    name: name,
    description: description,
    tags: tags,
    owner: session.user,
    group: session.group,
  };
  const onModifySuccess = () => {
    onSuccess(id);
  }
  putRequest(url, request, onModifySuccess, onFail);
}

export function deleteMediaImage(id, onSuccess, onFail){
  var url = '/media_images/' + id;
  const onDeleteSuccess = () =>{
    onSuccess(id);
  }
  deleteRequest(url, onDeleteSuccess, onFail);
}

export function uploadMediaImage(id, file, onProgress, onSuccess, onFail){
  var url = '/media_images/' + id + '/file/';
  uploadBinary(url, 'image', file, onProgress, onSuccess, onFail);
}

//disk Images
export function searchDiskImages(onSuccess, onFail){
  getRequest('/disk_image_search/', onSuccess, onFail);
}

export function getDiskImage(id, onSuccess, onFail){
  var url = '/disk_images/' + id;
  getRequest(url, onSuccess, onFail);
}

export function createDiskImage(name, guest, description, tags, onSuccess, onFail){
  var session = getLoggedSession();
  if (null === session){
    onFail('session expired');
    return;
  }
  var url = '/disk_images/';
  var request = {
    name: name,
    description: description,
    tags: tags,
    owner: session.user,
    group: session.group,
  };
  if (guest){
    request.guest = guest;
  }
  const onOperateSuccess = (data) => {
    onSuccess(data.id);
  }
  postRequest(url, request, onOperateSuccess, onFail);
}

export function modifyDiskImage(id, name, description, tags, onSuccess, onFail){
  var session = getLoggedSession();
  if (null === session){
    onFail('session expired');
    return;
  }
  var url = '/disk_images/' + id;
  var request = {
    name: name,
    description: description,
    tags: tags,
    owner: session.user,
    group: session.group,
  };
  const onModifySuccess = () => {
    onSuccess(id);
  }
  putRequest(url, request, onModifySuccess, onFail);
}

export function deleteDiskImage(id, onSuccess, onFail){
  var url = '/disk_images/' + id;
  const onDeleteSuccess = () =>{
    onSuccess(id);
  }
  deleteRequest(url, onDeleteSuccess, onFail);
}

export function uploadDiskImage(id, file, onProgress, onSuccess, onFail){
  var url = '/disk_images/' + id + '/file/';
  uploadBinary(url, 'image', file, onProgress, onSuccess, onFail);
}

//batch operates
export function batchCreatingGuests(rule, prefix, count, pool, cores, memory, disks, autoStartup,
  fromImage, systemVersion, modules, cloudInit, qos, onAccept, onFail){
    var session = getLoggedSession();
    if (null === session){
      onFail('session expired');
      return;
    }
    var request = {
      name_rule: rule,
      count: count,
      owner: session.user,
      group: session.group,
      pool: pool,
      cores: cores,
      memory: memory,
      disks: disks,
      auto_start: autoStartup,
      from_image: fromImage,
      system_version: systemVersion,
    };
    if (prefix){
      request.name_prefix = prefix;
    }
    if (modules){
      request.modules = modules;
    }
    if (cloudInit){
      request.cloud_init = cloudInit;
    }
    if (qos){
      request.qos = qos;
    }
    const onCreateResponse = (status, data) => {
      if (202 === status){
        onAccept(data.id);
      }else{
        onFail('unexpected status ' + status.toString());
      }
    }
    postRequestWithStatus('/batch/create_guest/', request, onCreateResponse, onFail);
}

export function checkBatchCreatingStatus(batchID, onProcessing, onSuccess, onFail){
  const url = '/batch/create_guest/' + batchID;
  const onOperateSuccess = (status, data) =>{
    if (202 === status){
      onProcessing(data);
    }else if (200 === status){
      onSuccess(data);
    }else{
      onFail('unexpected status ' + status.toString());
    }
  }
  getRequestWithStatus(url, onOperateSuccess, onFail);
}

export function batchDeletingGuests(idList, onAccept, onFail){
  if(!idList || 0 === idList.length){
    onFail('target is empty');
    return;
  }
  var request = {
    guest: idList,
  };

  const onOperateSuccess = (status, data) => {
    if (202 === status){
      onAccept(data.id);
    }else{
      onFail('unexpected status ' + status.toString());
    }
  }
  postRequestWithStatus('/batch/delete_guest/', request, onOperateSuccess, onFail);
}

export function checkBatchDeletingStatus(batchID, onProcessing, onSuccess, onFail){
  const url = '/batch/delete_guest/' + batchID;
  const onOperateSuccess = (status, data) =>{
    if (202 === status){
      onProcessing(data);
    }else if (200 === status){
      onSuccess(data);
    }else{
      onFail('unexpected status ' + status.toString());
    }
  }
  getRequestWithStatus(url, onOperateSuccess, onFail);
}

export function batchStoppingGuests(idList, onAccept, onFail){
  if(!idList || 0 === idList.length){
    onFail('target is empty');
    return;
  }
  var request = {
    guest: idList,
  };

  const onOperateSuccess = (status, data) => {
    if (202 === status){
      onAccept(data.id);
    }else{
      onFail('unexpected status ' + status.toString());
    }
  }
  postRequestWithStatus('/batch/stop_guest/', request, onOperateSuccess, onFail);
}

export function checkBatchStoppingStatus(batchID, onProcessing, onSuccess, onFail){
  const url = '/batch/stop_guest/' + batchID;
  const onOperateSuccess = (status, data) =>{
    if (202 === status){
      onProcessing(data);
    }else if (200 === status){
      onSuccess(data);
    }else{
      onFail('unexpected status ' + status.toString());
    }
  }
  getRequestWithStatus(url, onOperateSuccess, onFail);
}

//management

//roles
export function queryAllRoles(onSuccess, onFail){
  getRequest('/roles/', onSuccess, onFail);
}

export function getRole(role, onSuccess, onFail){
  const url = '/roles/' + role;
  getRequest(url, onSuccess, onFail);
}

export function addRole(role, menuList, onSuccess, onFail){
  const url = '/roles/' + role;
  const request = {
    menu: menuList,
  }
  const onOperateSuccess = () => {
    onSuccess(role);
  }
  postRequest(url, request, onOperateSuccess, onFail);
}

export function modifyRole(role, menuList, onSuccess, onFail){
  const url = '/roles/' + role;
  const request = {
    menu: menuList,
  }
  const onOperateSuccess = () => {
    onSuccess(role);
  }
  putRequest(url, request, onOperateSuccess, onFail);
}

export function removeRole(role, onSuccess, onFail){
  const url = '/roles/' + role;
  const onOperateSuccess = () => {
    onSuccess(role);
  }
  deleteRequest(url, onOperateSuccess, onFail);
}

//groups
export function queryAllGroups(onSuccess, onFail){
  getRequest('/user_groups/', onSuccess, onFail);
}

export function getGroup(group, onSuccess, onFail){
  const url = '/user_groups/' + group;
  getRequest(url, onSuccess, onFail);
}

export function addGroup(group, display, roleList, onSuccess, onFail){
  const url = '/user_groups/' + group;
  var request = {
    display: display,
  }
  if(roleList){
    request.role = roleList;
  }
  const onOperateSuccess = () => {
    onSuccess(group);
  }
  postRequest(url, request, onOperateSuccess, onFail);
}

export function modifyGroup(group, display, roleList, onSuccess, onFail){
  const url = '/user_groups/' + group;
  var request = {
  }
  if (display){
    request.display = display;
  }
  if(roleList){
    request.role = roleList;
  }
  const onOperateSuccess = () => {
    onSuccess(group);
  }
  putRequest(url, request, onOperateSuccess, onFail);
}

export function removeGroup(group, onSuccess, onFail){
  const url = '/user_groups/' + group;
  const onOperateSuccess = () => {
    onSuccess(group);
  }
  deleteRequest(url, onOperateSuccess, onFail);
}

export function queryGroupMembers(group, onSuccess, onFail){
  const url = '/user_groups/' + group + '/members/';
  getRequest(url, onSuccess, onFail);
}

export function addGroupMember(group, member, onSuccess, onFail){
  const url = '/user_groups/' + group + '/members/' + member;
  var request = {
  }
  const onOperateSuccess = () => {
    onSuccess(member, group);
  }
  postRequest(url, request, onOperateSuccess, onFail);
}

export function removeGroupMember(group, member, onSuccess, onFail){
  const url = '/user_groups/' + group + '/members/' + member;
  const onOperateSuccess = () => {
    onSuccess(member, group);
  }
  deleteRequest(url, onOperateSuccess, onFail);
}

//users
export function queryAllUsers(onSuccess, onFail){
  const url = '/users/';
  getRequest(url, onSuccess, onFail);
}

export function getUser(user, onSuccess, onFail){
  const url = '/users/' + user;
  getRequest(url, onSuccess, onFail);
}

export function createUser(user, password, nick, mail, onSuccess, onFail){
  const url = '/users/' + user;
  var request = {
    password: password,
  }
  if(nick){
    request.nick = nick;
  }
  if(mail){
    request.mail = mail;
  }
  const onOperateSuccess = () =>{
    onSuccess(user);
  }
  postRequest(url, request, onOperateSuccess, onFail);
}

export function modifyUser(user, nick, mail, onSuccess, onFail){
  const url = '/users/' + user;
  var request = {
  }
  if(nick){
    request.nick = nick;
  }
  if(mail){
    request.mail = mail;
  }
  const onOperateSuccess = () =>{
    onSuccess(user);
  }
  putRequest(url, request, onOperateSuccess, onFail);
}

export function deleteUser(user, onSuccess, onFail){
  const url = '/users/' + user;
  const onOperateSuccess = () =>{
    onSuccess(user);
  }
  deleteRequest(url, onOperateSuccess, onFail);
}

export function changeUserPassword(name, oldPassword, newPassword, onSuccess, onFail){
  const url = '/users/' + name + '/password/';
  const onOperateSuccess = () =>{
    onSuccess(name);
  }
  const request = {
    old: oldPassword,
    new: newPassword,
  };
  putRequest(url, request, onOperateSuccess, onFail);
}

export function searchUsers(group, onSuccess, onFail){
  var url = '/user_search/';
  if(group){
    url += '?group=' + group;
  }
  getRequest(url, onSuccess, onFail);
}

//Visibility
export function getVisibilities(onSuccess, onFail){
  const url = '/resource_visibilities/';
  getRequest(url, onSuccess, onFail);
}

export function setVisiblities(instance, disk, media, onSuccess, onFail){
  const url = '/resource_visibilities/';
  var request = {
  }
  if(instance){
    request.instance_visible = instance;
  }
  if(disk){
    request.disk_image_visible = disk;
  }
  if(media){
    request.media_image_visible = media;
  }
  putRequest(url, request, onSuccess, onFail);
}

//logs
export function queryLogs(limit, start, after, before, onSuccess, onFail){
  var url = '/logs/?limit=' + limit;
  if(start){
    url += '&start=' + start;
  }
  if(after){
    url += '&after=' + after;
  }
  if(before){
    url += '&before=' + before;
  }
  const onOperateSuccess = data => {
    let offset = 0;
    if (start){
      offset = start;
    }
    onSuccess({
      ...data,
      offset: offset,
    })
  }
  getRequest(url, onOperateSuccess, onFail);
}

export function writeLog(log, onSuccess, onFail){
  var session = getLoggedSession();
  if (null === session){
    onFail('session expired');
    return;
  }
  var content = session.group + '.' + session.user;
  if (session.address){
    content += '('+ session.address +') : ' + log;
  }else{
    content += ': ' + log;
  }
  const url = '/logs/';
  const request = {
    content: content,
  }
  postRequest(url, request, onSuccess, onFail);
}

export function deleteLog(entries, onSuccess, onFail){
  const url = '/logs/';
  const request = {
    entries: entries,
  }
  deleteRequestWithPayload(url, request, onSuccess, onFail);
}

//system
export function getSystemStatus(onSuccess, onFail){
  const url = '/system/';
  nakeGetRequest(url, onSuccess, onFail);
}

export function initialSystem(user, group, display, role, password,
  menuList, onSuccess, onFail){
  const url = '/system/';
  var request = {
    user: user,
    password: password,
    menu: menuList,
  }
  if(group){
    request.group = group;
  }
  if(display){
    request.display = display;
  }
  if(role){
    request.role = role;
  }
  nakePostRequest(url, request, onSuccess, onFail);
}

//basic request functions
function getRequest(url, onSuccess, onFail){
  callAxios('get', url, null, onSuccess, onFail);
}

function getRequestWithStatus(url, onSuccess, onFail){
  callAxiosWithStatus('get', url, null, onSuccess, onFail);
}

function nakeGetRequest(url, onSuccess, onFail){
  callAxiosWithoutSession('get', url, null, onSuccess, onFail);
}

function postRequest(url, request, onSuccess, onFail){
  callAxios('post', url, request, onSuccess, onFail);
}

function postRequestWithStatus(url, request, onSuccess, onFail){
  callAxiosWithStatus('post', url, request, onSuccess, onFail);
}

function nakePostRequest(url, request, onSuccess, onFail){
  callAxiosWithoutSession('post', url, request, onSuccess, onFail);
}

function putRequest(url, request, onSuccess, onFail){
  callAxios('put', url, request, onSuccess, onFail);
}

function deleteRequest(url, onSuccess, onFail){
  callAxios('delete', url, null, onSuccess, onFail);
}

function deleteRequestWithPayload(url, request, onSuccess, onFail){
  callAxios('delete', url, request, onSuccess, onFail);
}

function uploadBinary(url, fileTag, fileData, onProgress, onSuccess, onFail){
  var session = getLoggedSession();
  if (null === session){
    onFail('session expired');
    return;
  }
  const onUploadProgress = e =>{
    var progress = e.loaded * 100 / e.total;
    onProgress(progress);
  }
  const headers = {
    [HeaderNanoSession]: session.id,
  };
  var request = new FormData();
  request.append(fileTag, fileData);
  axios.post(apiRoot + url, request,
    {
    onUploadProgress: onUploadProgress,
    headers: headers,
  })
  .then(({data})=>{
    if (0 !== data.error_code){
      onFail(data.message);
      return
    }
    onSuccess(data.data);
    return;
  })
  .catch((e) =>{
    onFail(e.message);
  });
}

function callAxios(method, url, data, onSuccess, onFail){
  var session = getLoggedSession();
  if (null === session){
    if(onFail){
        onFail('session expired');
    }
    return;
  }
  var config = {
    method: method,
    url: apiRoot + url,
    headers: {
      [HeaderNanoSession]: session.id,
    },
  }
  if (data){
    config.data = data;
  }
  axios(config)
    .then(({data})=>{
      if (0 !== data.error_code){
        if(onFail){
          onFail(data.message);
        }
        return
      }
      if(onSuccess){
        onSuccess(data.data);
      }
      return;
    })
    .catch((e) =>{
      if(onFail){
        onFail(e.message);
      }
    });
}

function callAxiosWithStatus(method, url, data, onSuccess, onFail){
  var session = getLoggedSession();
  if (null === session){
    if(onFail){
        onFail('session expired');
    }
    return;
  }
  var config = {
    method: method,
    url: apiRoot + url,
    headers: {
      [HeaderNanoSession]: session.id,
    },
  }
  if (data){
    config.data = data;
  }
  axios(config)
    .then(({ data, status })=>{
      if (0 !== data.error_code){
        if(onFail){
          onFail(data.message);
        }
        return
      }
      if(onSuccess){
        onSuccess(status, data.data);
      }
      return;
    })
    .catch((e) =>{
      if(onFail){
        onFail(e.message);
      }
    });
}


function callAxiosWithoutSession(method, url, data, onSuccess, onFail){
  var config = {
    method: method,
    url: apiRoot + url,
  }
  if (data){
    config.data = data;
  }
  axios(config)
    .then(({data})=>{
      if (0 !== data.error_code){
        if(onFail){
          onFail(data.message);
        }
        return
      }
      if(onSuccess){
        onSuccess(data.data);
      }
      return;
    })
    .catch((e) =>{
      if(onFail){
        onFail(e.message);
      }
    });
}
