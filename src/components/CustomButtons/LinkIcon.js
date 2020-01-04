import React from "react";
import { Link } from "react-router-dom";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";

export default function LinkIcon(props){
  const { title, icon, href, placement, color } = props;
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
      <Link to={href}>
        <IconButton
          color={buttonColor}
          >
          {React.createElement(icon)}
        </IconButton>
      </Link>
    </Tooltip>
  )
}
