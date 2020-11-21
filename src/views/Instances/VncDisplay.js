import React from 'react';
import RFB from '@novnc/novnc';

export default function VncDisplay(props){
  const { url, password, callback, onFocusChanged } = props;
  const canvas = React.createRef();
  const [ connection, setConnection ] = React.useState(null);
  const [ mounted, setMounted ] = React.useState(false);
  const [ initialed, setInitialed ] = React.useState(false);

  const activateFocus = () =>{
    if (!mounted){
      return;
    }
    if (!connection){
      return;
    }
    connection.focus();
    onFocusChanged(true);
  };

  const deactivateFocus = () =>{
    if (!mounted){
      return;
    }
    if (!connection){
      return;
    }
    connection.blur();
    onFocusChanged(false);
  };

  const sendEmergencyKeys = () =>{
    if (!mounted){
      return;
    }
    if (!connection){
      return;
    }
    connection.sendCtrlAltDel();
  };

  const clickScreen = e => {
    e.preventDefault();
    activateFocus();
  }

  React.useEffect(()=>{
    if (!canvas ||!canvas.current || !url || !password){
      return;
    }

    setMounted(true);
    if (!initialed){
      const options = {
        credentials: {
          password: password,
        },
        clipViewport: true,
        focusOnClick: false,
        // scaleViewport: true,
        qualityLevel: 8,
      };


      var conn = new RFB(canvas.current, url, options);
      // const disconnect = () =>{
      //   conn.disconnect();
      //   setConnection(null);
      // }
      // conn.focus();
      setConnection(conn);
      setInitialed(true);
    }

    return () => {
      // disconnect();
      setMounted(false);
    }
  }, [canvas, password, url, initialed]);

  //render
  //bind callback
  callback.onEmergency = sendEmergencyKeys;
  return (
    <div
      ref={canvas}
      onMouseOver={activateFocus}
      onMouseOut={deactivateFocus}
      onMouseDown={clickScreen}
    />
  )
}
