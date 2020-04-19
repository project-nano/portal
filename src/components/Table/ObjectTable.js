import React from "react";
import PropTypes from "prop-types";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
// core components
import styles from "assets/jss/material-dashboard-react/components/tableStyle.js";

const useStyles = makeStyles(styles);

export default function ObjectTable(props){
  const classes = useStyles();
  const { color, headers, rows } = props;
  return (
    <div className={classes.tableResponsive}>
      <Table className={classes.table}>
        <TableHead className={classes[color + "TableHeader"]}>
          <TableRow className={classes.tableHeadRow}>
            {headers.map((prop, key) => {
              return (
                <TableCell
                  className={classes.tableCell + " " + classes.tableHeadCell}
                  key={key}
                >
                  {prop}
                </TableCell>
              );
            })}
          </TableRow>
        </TableHead>
        <TableBody>
          {
            rows.map((row, rowKey) => (
              <TableRow key={rowKey} className={classes.tableBodyRow}>
                {
                  row.map((cell, cellKey) => (
                    <TableCell className={classes.tableCell} key={cellKey}>
                      {cell}
                    </TableCell>
                  ))
                }
              </TableRow>
            ))
          }
        </TableBody>
      </Table>
    </div>
  )
}

ObjectTable.defaultProps = {
  color: "gray"
};

ObjectTable.propTypes = {
  color: PropTypes.oneOf([
    "warning",
    "primary",
    "danger",
    "success",
    "info",
    "rose",
    "gray"
  ]),
  headers: PropTypes.arrayOf(PropTypes.node),
  rows: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.node)),
};
