import React from "react";
// react plugin for creating charts
import { HorizontalBar } from 'react-chartjs-2';
import { blackColor, whiteColor } from "assets/jss/material-dashboard-react.js";

export default function HorizontalBarChart(props){
  const { label, series, light } = props;
  const brushColor = light ? blackColor : whiteColor;
  var datasets = [];
  series.forEach( slice => {
    datasets.push({
      label: slice.label,
      data: [slice.value],
      backgroundColor: slice.color,
      borderColor: brushColor,
      borderWidth: 1,
      stack: 'default',
      barPercentage: 0.5,
      maxBarThickness: 20,
    });
  });

  const chartData = {
    labels: [label],
    datasets: datasets,
  };

  const chartOptions = {
    scales: {
      xAxes: [{
        stacked: true,
        display: false,
      }],
      yAxes: [{
        display: false,
      }],
    },
    legend: {
      display: false,
    },
  };

  return <HorizontalBar data={chartData} options={chartOptions}/>;
}
