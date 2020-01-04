import React from "react";
import { Link } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import DeleteIcon from '@material-ui/icons/Delete';
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
    detail: 'Detail',
    remove: 'Remove',
  },
  'cn':{
    detail: '详情',
    remove: '删除',
  },
};

export default function RangeRow(props){
  const classes = makeStyles(styles)();
  const { lang, poolName, rangeType, range, onRemove } = props;
  const texts = i18n[lang];

  const detailOperator = {
    tips: texts.detail,
    icon: ListIcon,
    href: '/admin/address_pools/' + poolName + '/' + rangeType + '/ranges/' + range.start,
  };
  const removeOperator = {
    tips: texts.remove,
    icon: DeleteIcon,
    handler: onRemove,
  };
  var operators = [detailOperator, removeOperator];

  return (
    <TableRow className={classes.tableBodyRow}>
      <TableCell className={classes.tableCell}>
        {range.start}
      </TableCell>
      <TableCell className={classes.tableCell}>
        {range.end}
      </TableCell>
      <TableCell className={classes.tableCell}>
        {range.netmask}
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
                    operator.handler(poolName, rangeType, range.start);
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
