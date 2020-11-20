import React from 'react';
import RFB from '@novnc/novnc';

export default function VncDisplay(props){
  const { url, password, callback, focus } = props;
  const canvas = React.createRef();
  const [ connection, setConnection ] = React.useState(null);
  const [ mounted, setMounted ] = React.useState(false);
  const [ initialed, setInitialed ] = React.useState(false);

  // const bindRef = ref =>{
  //   setCanvas(ref);
  // }
  //
  // const onMouseEnter = () =>{
  //   if (!connection){
  //     return;
  //   }
  //   connection.focus();
  // }
  //
  // const onMouseLeave = () =>{
  //   if (!connection){
  //     return;
  //   }
  //   connection.blur();
  // }
  const sendEmergencyKeys = React.useCallback(() =>{
    if (!mounted){
      return;
    }
    if (!connection){
      return;
    }
    connection.sendCtrlAltDel();
  }, [mounted, connection]);

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
      console.log('connection ready');
    }

    return () => {
      // disconnect();
      setMounted(false);
    }
  }, [canvas, password, url, initialed]);

  //render

  callback.onEmergency = sendEmergencyKeys;
  if (initialed){
    if (focus){
      connection.focus();
      console.log('set focus');
    }else{
      connection.blur();
      console.log('set blur');
    }
  }
  return (
    <div
      ref={canvas}
    />
  )
}
