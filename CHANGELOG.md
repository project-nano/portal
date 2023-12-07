# Change Log

## [1.4.0] - 2023-11-02

### 新增

- 登录页面增加系统错误提示
- package.json新增参数service.host/service.port用于设置跨域时的后端服务地址
- 未添加资源节点时进行提示

### 修改

- 切换到yarn编译
- 更新版权日期
- 仅允许.iso文件上传为光盘镜像
- 仅允许.qcow2文件上传为磁盘镜像
- 新建云主机时优化参数配置界面，允许从Frontend接口读取用户自定最大值
- 新建云主机时，默认选择第一个资源池和系统模板

### Added

- Prompt on login page when system error
- Add service.host/service.port to 'package.json' to configure CORS backend connnection
- Prompt add first resource node if not available

### Changed 

- Migrate to yarn
- Copyright updated to current year
- Only allow '.iso' files to upload for media images
- Only allow '.qcow2' files to upload for disk images
- Read cores/memory/disk limit via frontend on page of creating instances
- Optimize core/memory/disk configure in creating page
- Using first pool by default when creating instance
- Using first system template by default when creating instance

## [1.3.1] - 2021-02-22

### Added

- Set auto start in guest detail
- Search and pagination in instance list

### Changed

- Display hosting cell IP instead of name if available

## [1.3.0] - 2020-11-21

### Added

- Synchronize disk/media images from local storage
- Guest policy rule management
- Security policies management
- Creating instances with security policy
- Allocate addresses using Cloud-Init

### Changed

- Optimize the control page of the instance
- Update npm dependencies

### Fixed

- Can't send ctrl+alt+delete on the monitor page
- Unstable key focus on the monitor page
- Images list crashed when no tags available

## [1.2.0] - 2020-04-27

### Added

- System templates management
- Create guest using templates
- Change the storage path of Cell
- Reset monitor secret of guest

### Changed

- Optimize most pages for data list and dialog
- Optimize keyboard focus for vnc page

### Fixed

- Wrong disk space when value is integer
- Set admin password fail
- Crash when observing resource of guest without qga installed

## [1.1.0] - 2020-01-01

### Added

- Version and manual on Navbar
- LanguageSelector on Login/Initial page

### Changed

- Logo / Sidebar background

### Fixed

- Login / Initial on small devices
- Prompt wrong message when create/reset instance success
