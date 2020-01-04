import React from "react";
import { Route } from "react-router-dom";
import ZoneStatus from "views/Dashboard/ZoneStatus.js";
import PoolStatus from "views/Dashboard/PoolStatus.js";
import CellStatus from "views/Dashboard/CellStatus.js";

export default function Dashboard(props){
  return (
    <div>
      <Route path="/admin/dashboard" exact render={(childrenProps) => React.createElement(ZoneStatus, {
        ...childrenProps,
        ...props,
      })}/>
      <Route path="/admin/dashboard/pools/" exact render={(childrenProps) => React.createElement(PoolStatus, {
        ...childrenProps,
        ...props,
      })}/>

      <Route path="/admin/dashboard/pools/:pool" exact render={(childrenProps) => React.createElement(CellStatus, {
        ...childrenProps,
        ...props,
      })}/>

    </div>
  )
}
