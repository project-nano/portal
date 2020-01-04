import React from "react";
// react plugin for creating charts
// @material-ui/core
import { makeStyles } from "@material-ui/core/styles";
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import PieChart from "views/Dashboard/PieChart.js";
import { grayColor } from "assets/jss/material-dashboard-react.js";
import dashboardStyles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";

export default function PieCard(props){
  const {title, series, displayValue } = props;
  var total = 0;
  var chartStyles = {
    ...dashboardStyles,
  };

  series.forEach( (slice, index) => {
    //slice => {value, color, label}
    total += slice.value;
    const seriesName = 'series-' + index.toString();
    chartStyles[seriesName] = {
      ...dashboardStyles.cardCategory,
      color: slice.color,
    };
  });

  chartStyles.topDivider = {
    borderTop: "1px solid " + grayColor[10],
  }

  const useStyles = makeStyles(chartStyles);
  const classes = useStyles();
  let totalLabel;
  if(displayValue){
    totalLabel = displayValue(total);
  }else{
    totalLabel = total.toString();
  }
  return (
    <Card chart>
      <CardHeader>
        <Typography className={classes.cardCategory}>
          {title + ': ' + totalLabel}
        </Typography>
        <PieChart series={series}/>
      </CardHeader>
      <CardBody>
        <Box m={0} p={2}  className={classes.topDivider}>
          <Box display='flex'>
            {
              series.map((slice, index) =>{
                let valueLabel;
                if (displayValue){
                  valueLabel = displayValue(slice.value);
                }else{
                  valueLabel = slice.value.toString();
                }
                return(
                  <Box m={1} key={slice.label}>
                    <Typography component='span' className={classes['series-' + index.toString()]}>
                      {slice.label}
                    </Typography>
                    <Typography component='span'>
                      {': ' + valueLabel}
                    </Typography>
                  </Box>
                )
              })
            }
            </Box>
        </Box>
      </CardBody>
    </Card>
  )
}
