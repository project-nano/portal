import React from "react";
// react plugin for creating charts
import { Line } from 'react-chartjs-2';
// @material-ui/core
import { blackColor, whiteColor } from "assets/jss/material-dashboard-react.js";

export default function LineChart(props){
  const DefaultMaxTicks = 10;
  const { series, minTickStep, displayValue, light, maxTicks, maxValue } = props;
  const maxTicksValue = maxTicks? maxTicks : DefaultMaxTicks;
  const brushColor = light ? blackColor : whiteColor;
  const dataCount = series[0].data.length;
  const labels = new Array(dataCount).fill('');
  const minValue = 0;
  const maxValueFixed = maxValue? true: false;
  let maxValueOfAll;
  if(maxValueFixed){
    maxValueOfAll = maxValue;
  }else{
    maxValueOfAll = minTickStep;
  }

  var datasets = [];
  series.forEach( dataSeries => {
    if (!maxValueFixed){
      dataSeries.data.forEach( value =>{
        maxValueOfAll = Math.max(maxValueOfAll, value);
      })
    }
    datasets.push({
      data: dataSeries.data,
      label: dataSeries.label,
      pointBackgroundColor: dataSeries.color,
      pointBorderColor: dataSeries.color,
      pointRadius: 5,
      borderColor: brushColor,
      borderWidth: 4,
      lineTension: 0.0,
    })
  });

  const chartData = {
    labels: labels,
    datasets: datasets,
  };

  let tickStep;
  if (maxValueOfAll <= maxTicksValue * minTickStep){
    tickStep = minTickStep;
  }else{
    tickStep = Math.ceil(maxValueOfAll / maxTicksValue / minTickStep) * minTickStep;
  }

  const chartOptions = {
    scales: {
      xAxes: [{
        gridLines:{
            drawBorder: false,
            lineWidth: 0,
            zeroLineColor: brushColor,
            zeroLineWidth: 2,
        },
      }],
      yAxes: [{
        gridLines:{
            borderDash: [2, 4],
            color: brushColor,
            zeroLineColor: brushColor,
            zeroLineWidth: 2,
            drawBorder: false,
        },
        ticks: {
          stepSize: tickStep,
          fontColor: brushColor,
          suggestedMax: maxValueOfAll,
          suggestedMin: minValue,
          callback: value => {
            if (displayValue){
              return displayValue(value);
            }else {
              return value.toString();
            }
          }
        },
      }],
    },
    legend: {
      display: false,
    },
  };
  return <Line data={chartData} options={chartOptions}/>;
}
