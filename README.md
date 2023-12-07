# Nano管理门户页面文件 / Nano Web Portal Pages

[版本历史/ChangeLog](CHANGELOG.md)

[English Version](#introduce)

## 说明

本项目是[Nano FrontEnd](https://github.com/project-nano/frontend)提供的管理门户页面源代码，编译完成后的页面文件部署在FrontEnd模块的**web_root**目录下提供服务。

编译要求
- Node.js 16
- yarn 1.22或以上

执行以下指令准备项目用于调试或者编译

```
$git clone https://github.com/project-nano/portal.git
$cd portal
$yarn install
```

### 开发调试

配合FrontEnd的CORS配置开关，Portal页面能够在本地启动并连接远程FrontEnd服务进行调试。配置方法见[FrontEnd页面](https://github.com/project-nano/frontend)

FrontEnd服务启动后，修改package.json的service.host和service.port两个参数，指向FrontEnd服务端口，执行以下指令

```
$yarn start
```

成功后可以使用浏览器访问localhost:3000调试页面

### 编译部署

执行以下指令进行编译
```
$yarn build
```

编译结果会输出到build子目录，将所有内容复制到FrontEnd模块的**web_root**即可（需要重启模块）

#### 配置说明

Portal使用'package.json'进行配置，修改后需要重新启动或者编译生效

| 配置项       | 值类型 | 默认值 | 说明                                         |
| ------------ | ------ | ------ | -------------------------------------------- |
| service.host | 字符串 |        | FrontEnd服务主机地址，默认为空，使用本地连接 |
| service.port | 整型   | 5870   | FrontEnd服务端口，仅当host不为空时生效       |
| version      | 字符串 | 1.4.0  | 页面显示的版本号 |

## Introduce

This project is the source code of the Web portal provided by [Nano FrontEnd](https://github.com/project-nano/frontend). The compiled page files are deployed in the **web_root** directory of the FrontEnd module.

Compile requirements
- Node.js 16
- yarn 1.22 or above

execute the following instructions to prepare the project

```
$ git clone https://github.com/project-nano/portal.git
$ cd portal
$ yarn install
```

### Development

Work with the CORS option of the FrontEnd configure, a local portal could connect to the remote FrontEnd service for debugging. See details at [FrontEnd page](https://github.com/project-nano/frontend)

When the FrontEnd started, change the parameters of 'service.host' and 'service.port' in "package.json" to the FrontEnd service.

execute the following instruction

```
$ yarn start
```

When page started, you can use a browser to access the localhost:3000.

### Deployment

Execute the following instruction for building:
```
$ yarn build
```

The compiled files are output to the directory: '.\build'.
Copy all content to the **web_root** of the FrontEnd module (restart required).

#### Configuration Instructions

Portal uses 'package.json' for configuration.
Restart or compile is required for modification to take effect.

| Option | Value type | Default value | Description                                         |
| ------------------- | ---------- | ------------- | ------------------------------------------------------ |
| service.host        | String     |              | FrontEnd service host address, default is empty, using local connection |
| service.port        | Integer    | 5870          | FrontEnd service port, only effective when host is not empty      |
| version             | String     | 1.4.0         | Version number displayed on the page                      |