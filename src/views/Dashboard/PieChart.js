import React from "react";
// react plugin for creating charts
import { Pie } from 'react-chartjs-2';

export default function PieChart(props){
  const { series } = props;
  var labels = [];
  var valueList = [];
  var colorList = [];
  series.forEach( slice => {
    labels.push(slice.label);
    valueList.push(slice.value);
    colorList.push(slice.color);
  });

  const chartData = {
    labels: labels,
    datasets: [
      {
        data: valueList,
        backgroundColor: colorList,
        borderWidth: 1,
        hoverBorderWidth: 0,
      }
    ],
  };

  const chartOptions = {
    cutoutPercentage: 5,
    legend: {
      display: false,
    },
    layout: {
            padding: {
                left: 0,
                right: 0,
                top: 0,
                bottom: 0
            }
        }
  };

  return <Pie data={chartData} options={chartOptions}/>;
}
