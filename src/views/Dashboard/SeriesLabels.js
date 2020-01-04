import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

export default function SeriesLabels(props){
  const {title, series, valueName, colorName, labelName, displayValue, baseClass } = props;
  let styles = {};
  if (baseClass){
    styles.title = {
      ...baseClass,
    }
  }else {
    styles.title = {};
  }

  series.forEach( (slice, index) => {
    const seriesName = 'series-' + index.toString();
    if (baseClass){
      styles[seriesName] = {
        ...baseClass,
        color: slice[colorName],
      };
    }else{
        styles[seriesName] = {
          color: slice[colorName],
        };
    }

  });

  const useStyles = makeStyles(styles);
  const classes = useStyles();
  return (
    <Box display='flex'>
      <Box m={1}>
        <Typography component='span' className={classes.title}>
          {title}
        </Typography>
      </Box>
      {
        series.map((slice, index) =>{
          const sliceValue = slice[valueName];
          const sliceLabel = slice[labelName];
          const sliceClassName = 'series-' + index.toString();
          let valueLabel;
          if (displayValue){
            valueLabel = displayValue(sliceValue);
          }else{
            valueLabel = sliceValue.toString();
          }
          return(
            <Box m={1} key={sliceLabel}>
              <Typography component='span' className={classes[sliceClassName]}>
                {sliceLabel}
              </Typography>
              <Typography component='span'>
                {': ' + valueLabel}
              </Typography>
            </Box>
          )
        })
      }
      </Box>
  )
}
