/*!

=========================================================
* Material Dashboard React - v1.8.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2019 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/material-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/

import Dashboard from 'views/Dashboard/Dashboard.js';
import ComputePools from 'views/ComputePools/ComputePools.js';
import AddressPools from 'views/AddressPools/AddressPools.js';
import StoragePools from 'views/StoragePools/StoragePools.js';
import MediaImages from 'views/MediaImages/MediaImages.js';
import DiskImages from 'views/DiskImages/DiskImages.js';
import Instances from 'views/Instances/Instances.js';
import Users from 'views/Users/Main';
import Visibilities from 'views/Visibilities/Visibilities';
import Logs from 'views/Logs/Logs';

import MultilineChartIcon from '@material-ui/icons/MultilineChart';
import BlurOnIcon from '@material-ui/icons/BlurOn';
import ShareIcon from '@material-ui/icons/Share';
import StorageIcon from '@material-ui/icons/Storage';
import CloudIcon from '@material-ui/icons/Cloud';
import SaveIcon from '@material-ui/icons/Save';
import AlbumIcon from '@material-ui/icons/Album';
import PeopleIcon from '@material-ui/icons/People';
import BorderColorIcon from '@material-ui/icons/BorderColor';
import VisibilityIcon from '@material-ui/icons/Visibility';

const dashboardRoutes = [
  {
    path: "/dashboard",
    name: "dashboard",
    display: {
      'cn': '系统仪表盘',
      'en': 'Dashboard',
    },
    icon: MultilineChartIcon,
    component: Dashboard,
    layout: "/admin"
  },
  {
    path: "/compute_pools",
    name: "compute_pool",
    display: {
      'cn': '计算资源池',
      'en': 'Compute Pools',
    },
    icon: BlurOnIcon,
    component: ComputePools,
    layout: "/admin"
  },
  {
    path: "/address_pools",
    name: "address_pool",
    display: {
      'cn': '地址池',
      'en': 'Address Pools',
    },
    icon: ShareIcon,
    component: AddressPools,
    layout: "/admin"
  },
  {
    path: "/storage_pools",
    name: "storage_pool",
    display: {
      'cn': '存储池',
      'en': 'Storage Pools',
    },
    icon: StorageIcon,
    component: StoragePools,
    layout: "/admin"
  },
  {
    path: "/instances",
    name: "instance",
    display: {
      'cn': '云主机',
      'en': 'Instances',
    },
    icon: CloudIcon,
    component: Instances,
    layout: "/admin"
  },
  {
    path: "/disk_images",
    name: "image",
    display: {
      'cn': '磁盘镜像',
      'en': 'Disk Images',
    },
    icon: SaveIcon,
    component: DiskImages,
    layout: "/admin"
  },
  {
    path: "/media_images",
    name: "media",
    display: {
      'cn': '光盘镜像',
      'en': 'Media Images',
    },
    icon: AlbumIcon,
    component: MediaImages,
    layout: "/admin"
  },
  {
    path: "/users",
    name: "user",
    display: {
      'cn': '用户管理',
      'en': 'User Management',
    },
    icon: PeopleIcon,
    component: Users,
    layout: "/admin"
  },
  {
    path: "/logs",
    name: "log",
    display: {
      'cn': '操作日志',
      'en': 'Operate Logs',
    },
    icon: BorderColorIcon,
    component: Logs,
    layout: "/admin"
  },
  {
    path: "/visibilities",
    name: "visibility",
    display: {
      'cn': '资源可见性',
      'en': 'Resource Visibilities',
    },
    icon: VisibilityIcon,
    component: Visibilities,
    layout: "/admin"
  },
];

export default dashboardRoutes;
