import React from "react";
import { Link } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import CheckIcon from '@material-ui/icons/Check';
import BlockIcon from '@material-ui/icons/Block';
import CloudQueueIcon from '@material-ui/icons/CloudQueue';
import DeleteIcon from '@material-ui/icons/Delete';
import SettingsIcon from '@material-ui/icons/Settings';
import LocalShippingRoundedIcon from '@material-ui/icons/LocalShippingRounded';
import WifiRoundedIcon from '@material-ui/icons/WifiRounded';
import WifiOffRoundedIcon from '@material-ui/icons/WifiOffRounded';

import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import tableStyles from "assets/jss/material-dashboard-react/components/tableStyle.js";
import fontStyles from "assets/jss/material-dashboard-react/components/typographyStyle.js";
import { modifyComputeCell } from "nano_api";

const i18n = {
  'en':{
    enable: 'Enable',
    disable: 'Disable',
    enabled: 'Enabled',
    disabled: 'Disabled',
    instances: 'Instances',
    detail: 'Detail',
    remove: 'Remove',
    migrate: 'Migrate',
    online: "Online",
    offline: "Offline",
  },
  'cn':{
    enable: '启用',
    disable: '禁用',
    enabled: '已启用',
    disabled: '已禁用',
    instances: '云主机实例',
    detail: '详情',
    remove: '移除',
    migrate: '迁移',
    online: "在线",
    offline: "离线",
  },
};

export default function CellRow(props){
  const tableClasses = makeStyles(tableStyles)();
  const fontClasses = makeStyles(fontStyles)();
  const { lang, poolName, cell, onNotify, onError, onDetail, onRemove, onStatusChange, onMigrate } = props;
  const texts = i18n[lang];
  const handleStatusChange = (poolName, cellName, enabled) =>{
    if (enabled){
      onNotify(cellName + texts.enabled);
    }else{
      onNotify(cellName + texts.disabled);
    }
    onStatusChange();
  }
  const enableCell = (cellName) => {
    modifyComputeCell(poolName, cellName, true, handleStatusChange, onError);
  }
  const disableCell = (cellName) => {
    modifyComputeCell(poolName, cellName, false, handleStatusChange, onError);
  }
  const enableOperator = {
    tips: texts.enable,
    icon: CheckIcon,
    handler: enableCell,
  };
  const disableOperator = {
    tips: texts.disable,
    icon: BlockIcon,
    handler: disableCell,
  };
  const instancesOperator = {
    tips: texts.instances,
    icon: CloudQueueIcon,
    href: '/admin/instances/range/?pool=' + poolName + '&cell=' + cell.name,
  };
  const detailOperator = {
    tips: texts.detail,
    icon: SettingsIcon,
    handler: onDetail,
  };
  const removeOperator = {
    tips: texts.remove,
    icon: DeleteIcon,
    handler: onRemove,
  };
  const migrateOperator = {
    tips: texts.migrate,
    icon: LocalShippingRoundedIcon,
    handler: onMigrate,
  };

  let statusLabel, statusIcon, operators;
  if (cell.enabled){
    statusLabel = texts.enabled;
    statusIcon = <CheckIcon className={fontClasses.successText}/>;
    operators = [disableOperator, instancesOperator, detailOperator,
      removeOperator, migrateOperator];
  }else{
    statusLabel = texts.disabled;
    statusIcon = <BlockIcon className={fontClasses.warningText}/>;
    operators = [enableOperator, instancesOperator, detailOperator,
      removeOperator, migrateOperator];
  }

  let aliveLabel, aliveIcon;
  if (cell.alive){
    aliveLabel = texts.online;
    aliveIcon = <WifiRoundedIcon className={fontClasses.successText}/>;
  }else{
    aliveLabel = texts.offline;
    aliveIcon = <WifiOffRoundedIcon className={fontClasses.warningText}/>;
  }

  return (
    <TableRow className={tableClasses.tableBodyRow}>
      <TableCell className={tableClasses.tableCell}>
        {cell.name}
      </TableCell>
      <TableCell className={tableClasses.tableCell}>
        {cell.address}
      </TableCell>
      <TableCell className={tableClasses.tableCell}>
      <Tooltip
        title={aliveLabel}
        placement="top"
        >
        {aliveIcon}
      </Tooltip>
      </TableCell>
      <TableCell className={tableClasses.tableCell}>
        <Tooltip
          title={statusLabel}
          placement="top"
          >
          {statusIcon}
        </Tooltip>
      </TableCell>
      <TableCell className={tableClasses.tableCell}>
      {
        operators.map((operator, key) => {
          var icon = React.createElement(operator.icon);
          let button;
          if (operator.href){
            button = (
              <Link to={operator.href}>
                <IconButton
                  color="inherit"
                  >
                  {icon}
                </IconButton>
              </Link>
            );
          }else{
            button = (
              <IconButton
                color="inherit"
                onClick={()=>{
                  if(null !== operator.handler){
                    operator.handler(cell.name);
                  }
                }}
                >
                {icon}
              </IconButton>
            );
          }
          return (
            <Tooltip
              title={operator.tips}
              placement="top"
              key={key}
              >
              {button}
            </Tooltip>
          )
        })
      }
      </TableCell>
    </TableRow>
  )
}
