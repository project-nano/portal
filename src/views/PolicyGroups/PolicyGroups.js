import React from "react";
import { Route } from "react-router-dom";
import PolicyGroupList from "views/PolicyGroups/PolicyGroupList.js";
import SecurityRules from "views/PolicyGroups/SecurityRules";

export default function Instances(props){
  return (
    <div>
      <Route path="/admin/security_policies/" exact render={()=> React.createElement(PolicyGroupList, props)}/>
      <Route path="/admin/security_policies/:id/rules/" render={(childrenProps)=> React.createElement(SecurityRules, {
        ...childrenProps,
        ...props,
      })}/>
    </div>
  )
}
