import React from "react";
import { Route } from "react-router-dom";
import InstancesInScope from "views/Instances/InstancesInScope.js";
// import ControlInstance from "views/Instances/ControlInstance.js";
import InstanceStatus from "views/Instances/InstanceStatus.js";
import Snapshots from "views/Instances/Snapshots.js";
import Details from "views/Instances/Details.js";
import AllInstances from "views/Instances/AllInstances.js";
import SecurityPolicies from "views/Instances/SecurityPolicies.js";

export default function Instances(props){
  return (
    <div>
      <Route path="/admin/instances" exact render={()=> React.createElement(AllInstances, props)}/>
      <Route path="/admin/instances/range/" render={()=> React.createElement(InstancesInScope, props)}/>
      <Route path="/admin/instances/status/:id" render={(childrenProps)=> React.createElement(InstanceStatus, {
        ...childrenProps,
        ...props,
      })}/>
      <Route path="/admin/instances/snapshots/:id" render={(childrenProps)=> React.createElement(Snapshots, {
        ...childrenProps,
        ...props,
      })}/>
      <Route path="/admin/instances/details/:id" render={(childrenProps)=> React.createElement(Details, {
        ...childrenProps,
        ...props,
      })}/>
      <Route path="/admin/instances/policies/:id" render={(childrenProps)=> React.createElement(SecurityPolicies, {
        ...childrenProps,
        ...props,
      })}/>
    </div>
  )
}
