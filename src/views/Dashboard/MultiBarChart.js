import React from "react";
// react plugin for creating charts
import { Bar } from 'react-chartjs-2';
// @material-ui/core
import { blackColor, whiteColor } from "assets/jss/material-dashboard-react.js";

export default function MultiBarChart(props){
  const DefaultMaxTicks = 10;
  const { series, minTickStep, displayValue, light, maxTicks } = props;
  const maxTicksValue = maxTicks? maxTicks : DefaultMaxTicks;
  const brushColor = light ? blackColor : whiteColor;
  const dataCount = series[0].data.length;
  const labels = new Array(dataCount).fill('');
  const minValue = 0;
  var maxValue = minTickStep;
  var datasets = [];
  series.forEach( dataSeries => {
    dataSeries.data.forEach( value =>{
      maxValue = Math.max(maxValue, value);
    })
    datasets.push({
      data: dataSeries.data,
      label: dataSeries.label,
      backgroundColor: dataSeries.color,
      barPercentage: 0.6,
      borderColor: brushColor,
      borderWidth: 1,
    })
  });

  const chartData = {
    labels: labels,
    datasets: datasets,
  };

  let tickStep;
  if (maxValue <= maxTicksValue * minTickStep){
    tickStep = minTickStep;
  }else{
    tickStep = Math.ceil(maxValue / maxTicksValue / minTickStep) * minTickStep;
  }

  const chartOptions = {
    scales: {
      xAxes: [{
        display: false,
      }],
      yAxes: [{
        gridLines:{
            borderDash: [2, 4],
            color: brushColor,
            zeroLineColor: brushColor,
            zeroLineWidth: 2,
        },
        ticks: {
          stepSize: tickStep,
          fontColor: brushColor,
          suggestedMax: maxValue,
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
  return <Bar data={chartData} options={chartOptions}/>;
}
