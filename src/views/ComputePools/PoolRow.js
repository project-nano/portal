import React from "react";
import { Link } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import CheckIcon from '@material-ui/icons/Check';
import BlockIcon from '@material-ui/icons/Block';
import ViewQuiltIcon from '@material-ui/icons/ViewQuilt';
import CloudQueueIcon from '@material-ui/icons/CloudQueue';
import DeleteIcon from '@material-ui/icons/Delete';
import SettingsIcon from '@material-ui/icons/Settings';

import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import tableStyles from "assets/jss/material-dashboard-react/components/tableStyle.js";
import fontStyles from "assets/jss/material-dashboard-react/components/typographyStyle.js";

const i18n = {
  'en':{
    enable: 'Enable',
    disable: 'Disable',
    enabled: 'Enabled',
    disabled: 'Disabled',
    cells: 'Cells',
    instances: 'Instances',
    modify: 'Modify',
    delete: 'Delete',
    on: 'on',
    off: 'off',
    localStorage: 'Use local storage',
    noAddressPool: "Don't use address pool",
  },
  'cn':{
    enable: '启用',
    disable: '禁用',
    enabled: '已启用',
    disabled: '已禁用',
    cells: 'Cell节点',
    instances: '云主机实例',
    modify: '修改',
    delete: '删除',
    on: '开启',
    off: '关闭',
    localStorage: '使用本地存储',
    noAddressPool: "不使用地址池",
  },
};

export default function PoolRow(props){
  const tableClasses = makeStyles(tableStyles)();
  const fontClasses = makeStyles(fontStyles)();
  const { lang, pool, onModify, onDelete } = props;
  const texts = i18n[lang];
  const enableOperator = {
    tips: texts.enable,
    icon: CheckIcon,
    handler: null,
  };
  const disableOperator = {
    tips: texts.disable,
    icon: BlockIcon,
    handler: null,
  };
  const cellsOperator = {
    tips: texts.cells,
    icon: ViewQuiltIcon,
    href: '/admin/compute_cells/?pool=' + pool.name,
  };
  const instancesOperator = {
    tips: texts.instances,
    icon: CloudQueueIcon,
    href: '/admin/instances/range/?pool=' + pool.name,
  };
  const modifyOperator = {
    tips: texts.modify,
    icon: SettingsIcon,
    handler: onModify,
  };
  const deleteOperator = {
    tips: texts.delete,
    icon: DeleteIcon,
    handler: onDelete,
  };

  let statusLabel, statusIcon, operators, failoverLabel;
  if (pool.enabled){
    statusLabel = texts.enabled;
    statusIcon = <CheckIcon className={fontClasses.successText}/>;
    operators = [disableOperator, cellsOperator,
      instancesOperator, modifyOperator, deleteOperator];
  }else{
    statusLabel = texts.disabled;
    statusIcon = <BlockIcon className={fontClasses.warningText}/>;
    operators = [enableOperator, cellsOperator,
      instancesOperator, modifyOperator, deleteOperator];
  }

  if (pool.failover){
    failoverLabel = texts.on;
  }else{
    failoverLabel = texts.off;
  }

  return (
    <TableRow className={tableClasses.tableBodyRow}>
      <TableCell className={tableClasses.tableCell}>
        {pool.name}
      </TableCell>
      <TableCell className={tableClasses.tableCell}>
        {pool.cells}
      </TableCell>
      <TableCell className={tableClasses.tableCell}>
        {pool.network ? pool.network:texts.noAddressPool}
      </TableCell>
      <TableCell className={tableClasses.tableCell}>
        {pool.storage ? pool.storage:texts.localStorage}
      </TableCell>
      <TableCell className={tableClasses.tableCell}>
        {failoverLabel}
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
                <IconButton color="default">
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
                    operator.handler(pool.name);
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
