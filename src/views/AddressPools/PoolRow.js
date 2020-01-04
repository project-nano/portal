import React from "react";
import { Link } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import DeleteIcon from '@material-ui/icons/Delete';
import BuildIcon from '@material-ui/icons/Build';
import ListIcon from '@material-ui/icons/List';

import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import tableStyles from "assets/jss/material-dashboard-react/components/tableStyle.js";
import fontStyles from "assets/jss/material-dashboard-react/components/typographyStyle.js";

const styles = {
  ...tableStyles,
  ...fontStyles,
}
const i18n = {
  'en':{
    modify: 'Modify',
    delete: 'Delete',
    detail: 'Detail',
  },
  'cn':{
    modify: '修改',
    delete: '删除',
    detail: '详情',
  },
};

export default function PoolRow(props){
  const classes = makeStyles(styles)();
  const { lang, pool, onModify, onDelete } = props;
  const texts = i18n[lang];

  const modifyOperator = {
    tips: texts.modify,
    icon: BuildIcon,
    handler: onModify,
  };
  const detailOperator = {
    tips: texts.detail,
    icon: ListIcon,
    href: '/admin/address_pools/' + pool.name,
  };
  const deleteOperator = {
    tips: texts.delete,
    icon: DeleteIcon,
    handler: onDelete,
  };
  var operators = [modifyOperator, detailOperator, deleteOperator];

  return (
    <TableRow className={classes.tableBodyRow}>
      <TableCell className={classes.tableCell}>
        {pool.name}
      </TableCell>
      <TableCell className={classes.tableCell}>
        {pool.gateway}
      </TableCell>
      <TableCell className={classes.tableCell}>
        {pool.addresses}
      </TableCell>
      <TableCell className={classes.tableCell}>
        {pool.allocated}
      </TableCell>
      <TableCell className={classes.tableCell}>
      {
        operators.map((operator, key) => {
          var icon = React.createElement(operator.icon);
          let button;
          if (operator.href){
            button = (
              <Link to={operator.href}>
                <IconButton color="inherit">
                  {icon}
                </IconButton>
              </Link>
            );
          }else{
            button = (
              <IconButton color="inherit"
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
