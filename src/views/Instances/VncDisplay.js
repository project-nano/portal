import React from 'react';
import { arrayOf, string, bool, func, number, object } from 'prop-types';
import RFB from '@novnc/novnc';

/**
 * React component to connect and display a remote VNC connection.
 */
export default class VncDisplay extends React.Component {
  static propTypes = {
    /**
     * The URL for which to create a remote VNC connection.
     * Should include the protocol, host, port, and path.
     */
    url: string.isRequired,
    /**
     * Customize the CSS styles of the canvas element with an object.
     */
    style: object,
    /**
     * Set the width of the canvas element.
     */
    width: number,
    /**
     * Set the height of the canvas element.
     */
    height: number,
    /**
     * Force a URL to be communicated with as encrypted.
     */
    encrypt: bool,
    /**
     * Specify a list of WebSocket protocols this connection should support.
     */
    wsProtocols: arrayOf(string),
    /**
     * Execute a function when the VNC connection's clipboard updates.
     */
    onClipboard: func,
    /**
     * Execute a function when the state of the VNC connection changes.
     */
    onUpdateState: func,
    /**
     * Execute a function when the password of the VNC is required.
     */
    onPasswordRequired: func,
    /**
     * Execute a function when an alert is raised on the VNC connection.
     */
    onBell: func,
    /**
     * Execute a function when the desktop name is entered for the connection.
     */
    onDesktopName: func,
    /**
     * Specify the connection timeout for the VNC connection.
     */
    connectTimeout: number,
    /**
     * Specify the timeout for disconnection of the VNC connection.
     */
    disconnectTimeout: number,
    /**
     * Specify whether a VNC connection should disconnect other connections
     * before connecting.
     */
    shared: bool,
  };

  static defaultProps = {
    style: null,
    encrypt: null,
    wsProtocols: ['binary'],
    trueColor: true,
    localCursor: true,
    connectTimeout: 5,
    disconnectTimeout: 5,
    width: 1280,
    height: 720,
    onClipboard: null,
    onUpdateState: null,
    onPasswordRequired: null,
    onBell: null,
    onDesktopName: null,
    shared: false,
  };

  constructor(props){
    super(props);
    const { delegate } = props;
    delegate.sendEmergencyKeys = this.sendEmergencyKeys.bind(this);
  }

  componentDidMount() {
    this.connect();
  }

  componentWillUnmount() {
    this.disconnect();
  }

  componentWillReceiveProps(nextProps) {
    if (!this.rfb) {
      return;
    }
    //
    // if (nextProps.scale !== this.props.scale) {
    //   this.rfb.get_display().set_scale(nextProps.scale || 1);
    //   this.get_mouse().set_scale(nextProps.scale || 1);
    // }
  }

  sendEmergencyKeys(){
    if(!this.rfb){
      return;
    }
    this.rfb.sendCtrlAltDel();
  }

  disconnect = () => {
    if (!this.rfb) {
      return;
    }

    this.rfb.disconnect();
    this.rfb = null;
  };

  connect = () => {
    this.disconnect();

    if (!this.container) {
      return;
    }

    const { url, password } = this.props;
    const options = {
      credentials: {
        password: password,
      },
      focusOnClick: true,
    };

    this.rfb = new RFB(this.container, url, options);
    // this.rfb.connect(url);
  };

  bindContainer = ref => {
    this.container = ref;
  };

  handleMouseEnter = () => {
    if (!this.rfb) {
      return;
    }
    this.rfb.focus();
    // document.activeElement && document.activeElement.blur();
    // this.rfb.get_keyboard().grab();
    // this.rfb.get_mouse().grab();
  };

  handleMouseLeave = () => {
    if (!this.rfb) {
      return;
    }
    this.rfb.blur();
    // this.rfb.get_keyboard().ungrab();
    // this.rfb.get_mouse().ungrab();
  };

  render() {
    return (
      <div
        style={this.props.style}
        ref={this.bindContainer}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      />
    );
  }
}

// export default function VncDisplay(props){
//   const { url, password, bindFuncs, unbindFuncs } = props;
//   const [ canvas, setCanvas ] = React.useState(null);
//   const [ initialed, setInitialed ] = React.useState(false);
//   const [ connection, setConnection ] = React.useState(null);
//   const [ mounted, setMounted ] = React.useState(false);
//
//   const sendEmergencyKeys = React.useCallback(() =>{
//     if (!mounted){
//       return;
//     }
//     if (!connection){
//       return;
//     }
//     connection.sendCtrlAltDel();
//   }, [mounted, connection]);
//
//   const disconnect = React.useCallback(() =>{
//     if (!connection){
//       return;
//     }
//     connection.disconnect();
//     setConnection(null);
//   }, [connection]);
//
//   const connect = React.useCallback(() =>{
//     if (connection){
//       disconnect();
//     }
//
//     if (!canvas) {
//       return;
//     }
//
//     const options = {
//       credentials: {
//         password: password,
//       },
//       focusOnClick: true,
//     };
//
//     var conn = new RFB(canvas, url, options);
//     setConnection(conn);
//   }, [connection, canvas, disconnect, password, url]);
//
//   const bindRef = ref =>{
//     setCanvas(ref);
//   }
//
//   const onMouseEnter = () =>{
//     if (!mounted){
//       return;
//     }
//     if (!connection){
//       return;
//     }
//     connection.focus();
//   }
//
//   const onMouseLeave = () =>{
//     if (!mounted){
//       return;
//     }
//     if (!connection){
//       return;
//     }
//     connection.blur();
//   }
//
//   React.useEffect(()=>{
//     if (!canvas || initialed){
//       return;
//     }
//     setMounted(true);
//     connect();
//     bindFuncs(sendEmergencyKeys);
//     setInitialed(true);
//     return () => {
//       unbindFuncs();
//       disconnect();
//       setMounted(false);
//       setInitialed(false);
//     }
//   }, [canvas, initialed, connect, bindFuncs, unbindFuncs,
//     disconnect, sendEmergencyKeys]);
//
//   return (
//     <div
//       ref={bindRef}
//       onMouseEnter={onMouseEnter}
//       onMouseLeave={onMouseLeave}
//     />
//   )
// }
