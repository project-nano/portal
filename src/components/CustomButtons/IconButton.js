import React from "react";
import { Link } from "react-router-dom";
import Tooltip from "@material-ui/core/Tooltip";
import InnerButton from "@material-ui/core/IconButton";

export default function IconButton(props){
  const { label, icon, href, placement, color, onClick } = props;
  let tooltipPlacement, iconColor;
  if(placement){
    tooltipPlacement = placement;
  }else{
    tooltipPlacement = 'top';
  }
  if(color){
    iconColor = color;
  }else{
    iconColor = 'inherit';
  }
  let innerButton;
  if (onClick){
    innerButton = <InnerButton onClick={onClick} color={iconColor}>{React.createElement(icon)}</InnerButton>;
  }else if (href){
    innerButton = <Link to={href}><InnerButton color={iconColor}>{React.createElement(icon)}</InnerButton></Link>;
  }else{
    innerButton = <InnerButton color={iconColor}>{React.createElement(icon)}</InnerButton>;
  }

  return (
    <Tooltip
      title={label}
      placement={tooltipPlacement}
      >
      {innerButton}
    </Tooltip>
  )
}
