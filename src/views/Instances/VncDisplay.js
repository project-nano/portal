import React from 'react';
import RFB from '@novnc/novnc';

export default function VncDisplay(props){
  const { url, password, bindFuncs } = props;
  const [ canvas, setCanvas ] = React.useState(null);
  // const [ initialed, setInitialed ] = React.useState(false);
  const [ connection, setConnection ] = React.useState(null);
  const [ mounted, setMounted ] = React.useState(false);

  const sendEmergencyKeys = React.useCallback(() =>{
    if (!mounted){
      return;
    }
    if (!connection){
      return;
    }
    connection.sendCtrlAltDel();
  }, [mounted, connection]);

  const disconnect = React.useCallback(() =>{
    if (!connection){
      return;
    }
    connection.disconnect();
    setConnection(null);
  }, [connection]);

  const connect = React.useCallback(() =>{
    if (connection){
      disconnect();
    }

    if (!canvas) {
      return;
    }

    const options = {
      credentials: {
        password: password,
      },
      focusOnClick: true,
    };

    var conn = new RFB(canvas, url, options);
    conn.focus();
    setConnection(conn);
  }, [connection, canvas, disconnect, password, url]);

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
    if (!canvas || connection){
      return;
    }
    setMounted(true);
    connect();
    return () => {
      disconnect();
      setMounted(false);
    }
  }, [canvas, connect, disconnect, connection]);

  bindFuncs(sendEmergencyKeys);

  return (
    <div
      ref={bindRef}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    />
  )
}
