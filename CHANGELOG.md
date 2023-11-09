# Change Log

## [1.4.0] - 2023-11-02

### Added

- Prompt on login page when system error
- Add service.host/service.port to 'package.json' to configure CORS backend connnection

### Changed 

- Migrate to yarn
- Copyright updated to current year
- Only allow '.iso' files to upload for media images
- Only allow '.qcow2' files to upload for disk images
- Read cores/memory/disk limit via frontend on page of creating instances
- Optimize core/memory/disk configure in creating page

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
