import React from "react";
import LoggedUser from "components/LoggedUser/LoggedUser.js";


export default function AdminNavbarLinks(props) {
  return (
    <div>
      <LoggedUser {...props}/>
    </div>
  );
}
