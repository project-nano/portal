import React from "react";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";

export default function TooltipButton(props){
  const { title, icon, placement, color, onClick } = props;
  let tooltipPlacement, buttonColor;
  if(placement){
    tooltipPlacement = placement;
  }else{
    tooltipPlacement = 'top';
  }
  if(color){
    buttonColor = color;
  }else{
    buttonColor = 'inherit';
  }

  return (
    <Tooltip
      title={title}
      placement={tooltipPlacement}
      >
      <IconButton
        color={buttonColor}
        onClick={onClick}
        >
        {React.createElement(icon)}
      </IconButton>
    </Tooltip>
  )
}
