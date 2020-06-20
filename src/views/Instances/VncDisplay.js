import React from 'react';
import RFB from '@novnc/novnc';

export default function VncDisplay(props){
  const { url, password, callback } = props;
  const [ canvas, setCanvas ] = React.useState(null);
  const [ connection, setConnection ] = React.useState(null);

  const bindRef = ref =>{
    setCanvas(ref);
  }

  const onMouseEnter = () =>{
    if (!connection){
      return;
    }
    connection.focus();
  }

  const onMouseLeave = () =>{
    if (!connection){
      return;
    }
    connection.blur();
  }

  React.useEffect(()=>{
    if (!canvas){
      return;
    }
    var mounted = false;
    let conn;
    const sendEmergencyKeys = () =>{
      if (!mounted){
        return;
      }
      if (!conn){
        return;
      }
      conn.sendCtrlAltDel();
    };

    const disconnect = () => {
      if (!mounted){
        return;
      }
      if (!conn){
        return;
      }
      conn.disconnect();
      conn = null;
      setConnection(null);
    };

    const connect = () =>{
      if (!mounted){
        return;
      }
      const options = {
        credentials: {
          password: password,
        },
        focusOnClick: true,
      };

      conn = new RFB(canvas, url, options);
      conn.focus();
      setConnection(conn);
    };

    mounted = true;
    connect();
    callback.onEmergency = sendEmergencyKeys;

    return () => {
      disconnect();
      mounted = false;
    }
  }, [canvas, password, url, callback]);

  return (
    <div
      ref={bindRef}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    />
  )
}
