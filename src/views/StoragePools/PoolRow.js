import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import DeleteIcon from '@material-ui/icons/Delete';
import SettingsIcon from '@material-ui/icons/Settings';

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
  },
  'cn':{
    modify: '修改',
    delete: '删除',
  },
};

export default function PoolRow(props){
  const classes = makeStyles(styles)();
  const { lang, pool, onModify, onDelete } = props;
  const texts = i18n[lang];

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
  var operators = [modifyOperator, deleteOperator];

  return (
    <TableRow className={classes.tableBodyRow}>
      <TableCell className={classes.tableCell}>
        {pool.name}
      </TableCell>
      <TableCell className={classes.tableCell}>
        {pool.type}
      </TableCell>
      <TableCell className={classes.tableCell}>
        {pool.host}
      </TableCell>
      <TableCell className={classes.tableCell}>
        {pool.target}
      </TableCell>
      <TableCell className={classes.tableCell}>
      {
        operators.map((operator, key) => {
          var icon = React.createElement(operator.icon);
          return (
            <Tooltip
              title={operator.tips}
              placement="top"
              key={key}
              >
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
            </Tooltip>
          )
        })
      }
      </TableCell>
    </TableRow>
  )
}
