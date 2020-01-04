import React from "react";
// @material-ui/core
import { makeStyles } from "@material-ui/core/styles";
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import LineChart from "views/Dashboard/LineChart.js";
import { grayColor } from "assets/jss/material-dashboard-react.js";
import dashboardStyles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";

export default function LineCard(props){
  const {title, color, series, displayValue, minTickStep, maxValue } = props;
  var styles = {
    ...dashboardStyles,
    topDivider: {
      borderTop: "1px solid " + grayColor[10],
    },
  };
  var lastValueLabels = [];
  series.forEach( ({ data, label }) => {
    const lastValue = data[data.length - 1];
    let valueString;
    if (displayValue){
      valueString = displayValue(lastValue);
    }else{
      valueString = lastValue.toString();
    }
    lastValueLabels.push(label + ': ' + valueString);
  });

  const useStyles = makeStyles(styles);
  const classes = useStyles();
  return (
    <Card chart>
      <CardHeader color={color}>
        <LineChart series={series} minTickStep={minTickStep} displayValue={displayValue} maxValue={maxValue}/>
      </CardHeader>
      <CardBody>
        <Typography variant='h5' component='div' className={classes.cardTitle}>
          {title}
        </Typography>
        <Box m={0} p={2} className={classes.topDivider}>
          <Typography component='span' className={classes.cardCategory}>
            {lastValueLabels.join(' / ') + ' / ' + maxValue.toString()}
          </Typography>
        </Box>
      </CardBody>
    </Card>
  )
}
