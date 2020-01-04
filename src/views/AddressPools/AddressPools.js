import React from "react";
import { Route } from "react-router-dom";
import PoolList from "views/AddressPools/PoolList";
import PoolStatus from "views/AddressPools/PoolStatus";
import RangeStatus from "views/AddressPools/RangeStatus";

export default function AddressPools(props){
  return (
    <div>
      <Route path="/admin/address_pools" exact render={()=> React.createElement(PoolList, props)}/>
      <Route path="/admin/address_pools/:pool" exact render={(current)=> React.createElement(PoolStatus, {
        ...props,
        ...current,
      })}/>
      <Route path="/admin/address_pools/:pool/:type/ranges/:start" render={(current)=> React.createElement(RangeStatus, {
        ...props,
        ...current,
      })}/>
    </div>
  )
}
