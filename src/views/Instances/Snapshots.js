import React from "react";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import Skeleton from '@material-ui/lab/Skeleton';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import TreeView from '@material-ui/lab/TreeView';
import TreeItem from '@material-ui/lab/TreeItem';
import Divider from '@material-ui/core/Divider';
import AddIcon from '@material-ui/icons/Add';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import CameraAltIcon from '@material-ui/icons/CameraAlt';
import SubdirectoryArrowRightIcon from '@material-ui/icons/SubdirectoryArrowRight';
import FolderIcon from '@material-ui/icons/Folder';
import DoubleArrowIcon from '@material-ui/icons/DoubleArrow';
import DeleteIcon from '@material-ui/icons/Delete';
import RestoreIcon from '@material-ui/icons/Restore';
import grey from '@material-ui/core/colors/grey';

// dashboard components
import Button from "components/CustomButtons/Button.js";
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import Snackbar from "components/Snackbar/Snackbar.js";
import CreateSnapshotDialog from "views/Instances/CreateSnapshotDialog.js";
import DeleteSnapshotDialog from "views/Instances/DeleteSnapshotDialog.js";
import RevertSnapshotDialog from "views/Instances/RevertSnapshotDialog.js";
import { getLoggedSession, redirectToLogin } from 'utils.js';
import { getInstanceConfig, queryInstanceSnapshots, getInstanceSnapshot, writeLog } from "nano_api.js";

const styles = {
  panel: {
    background: grey[100],
  }
}

const i18n = {
  'en':{
    title: 'Snapshots of ',
    noResource: 'No snapshots created',
    back: 'Back',
    create: 'Create New Snapshot',
    delete: 'Delete',
    revert: 'Revert',
    current: 'Current',
    name: 'Name',
    description: 'Description',
    createdTime: 'Created Time',
    type: 'Type',
    offline: 'Offline Snapshot',
    realtime: 'Realtime Snapshot',
  },
  'cn':{
    title: '云主机快照:',
    noResource: '尚未创建云主机快照',
    back: '返回',
    create: '创建新快照',
    delete: '删除',
    revert: '恢复',
    current: '当前',
    name: '快照名称',
    description: '描述',
    createdTime: '创建时间',
    type: '类型',
    offline: '离线快照',
    realtime: '实时快照',
  }
}

export default function Snapshots(props){
    const useStyles = makeStyles(styles);
    const classes = useStyles();
    const instanceID = props.match.params.id;
    const [ snapshots, setSnapshots ] = React.useState(null);
    const [ selectedSnapshot, setSelectedSnapshot] = React.useState(null);

    //for dialog
    const [ createDialogVisible, setCreateDialogVisible ] = React.useState(false);
    const [ deleteDialogVisible, setDeleteDialogVisible ] = React.useState(false);
    const [ revertDialogVisible, setRevertDialogVisible ] = React.useState(false);
    const [ notifyColor, setNotifyColor ] = React.useState('warning');
    const [ notifyMessage, setNotifyMessage ] = React.useState("");

    const closeNotify = () => {
      setNotifyMessage("");
    }

    const showErrorMessage = React.useCallback((msg) => {
      const notifyDuration = 3000;
      setNotifyColor('warning');
      setNotifyMessage(msg);
      setTimeout(closeNotify, notifyDuration);
    }, [setNotifyColor, setNotifyMessage]);

    const showNotifyMessage = (msg) => {
      const notifyDuration = 3000;
      setNotifyColor('info');
      setNotifyMessage(msg);
      writeLog(msg);
      setTimeout(closeNotify, notifyDuration);
    };

    const onFail = React.useCallback(msg =>{
      showErrorMessage(msg);
    }, [showErrorMessage]);

    const buildChildrenNode = React.useCallback((parent, current, dependent) =>{
      var nodes = [];
      var children = dependent.get(parent);
      children.forEach( name => {
        var node = {
          name: name,
        }
        if (current === name){
          node.isCurrent = true;
        }
        if (dependent.has(name)){
          node.children = buildChildrenNode(name, current, dependent);
        }
        nodes.push(node);
      });
      return nodes;
    }, []);

    const reloadSnapshots = React.useCallback(instanceName => {
      const onQuerySnapshotSuccess = data =>{
        var rootName = '';
        var current = '';
        var rootNode = {};

        //convert object to Map
        var snapshotMap = new Map();
        Object.keys(data).forEach((key) =>{
          snapshotMap.set(key, data[key]);
        });
        if (0 !== snapshotMap.length){
          var dependentMap = new Map();
          //build tree
          snapshotMap.forEach( (snapshot, name) =>{
            if (snapshot.is_root){
              rootName = name;
            }
            if (snapshot.is_current){
              current = name;
            }
            if (snapshot.backing){
              var parentName = snapshot.backing;
              if (dependentMap.has(parentName)){
                dependentMap.get(parentName).push(name);
              }else{
                dependentMap.set(parentName, [name]);
              }
            }
          });
          if('' !== rootName){
            rootNode.name = rootName;
            if(rootName === current){
              rootNode.isCurrent = true;
            }
            if(dependentMap.has(rootName)){
              rootNode.children = buildChildrenNode(rootName, current, dependentMap);
            }
          }
        }

        if(instanceName){
          setSnapshots({
            name: instanceName,
            rootName: rootName,
            current: current,
            rootNode: rootNode,
          });
        }else{
          setSnapshots(previous =>({
            ...previous,
            rootName: rootName,
            current: current,
            rootNode: rootNode,
          }));
        }

      }
      queryInstanceSnapshots(instanceID, onQuerySnapshotSuccess, onFail);
    }, [instanceID, onFail, buildChildrenNode]);

    //create
    const showCreateDialog = () =>{
      setCreateDialogVisible(true);
    };

    const closeCreateDialog = () =>{
      setCreateDialogVisible(false);
    }

    const onCreateSuccess = snapshotName =>{
      closeCreateDialog();
      showNotifyMessage('new snapshot '+ snapshotName + ' created for ' + snapshots.name);
      reloadSnapshots();
    };

    //delete
    const showDeleteDialog = () =>{
      setDeleteDialogVisible(true);
    };

    const closeDeleteDialog = () =>{
      setDeleteDialogVisible(false);
    }

    const onDeleteSuccess = snapshotName =>{
      closeDeleteDialog();
      showNotifyMessage('snapshot '+ snapshotName + ' deleted');
      reloadSnapshots();
    };

    //revert
    const showRevertDialog = () =>{
      setRevertDialogVisible(true);
    };

    const closeRevertDialog = () =>{
      setRevertDialogVisible(false);
    }

    const onRevertSuccess = snapshotName =>{
      closeRevertDialog();
      showNotifyMessage('restored to snapshot '+ snapshotName);
      reloadSnapshots();
    };

    const onSelectSnapshot = name =>{
      const onQuerySuccess = snapshot =>{
        setSelectedSnapshot({
          ...snapshot,
          name: name,
        });
      }
      getInstanceSnapshot(instanceID, name, onQuerySuccess, onFail);
    }

    React.useEffect(() =>{
      const onGetInstanceSuccess = status =>{
        reloadSnapshots(status.name);
      }
      getInstanceConfig(instanceID, onGetInstanceSuccess, onFail);
    }, [instanceID, onFail, reloadSnapshots]);


    //reder begin
    var session = getLoggedSession();
    if (null === session){
      return redirectToLogin();
    }

    const { lang } = props;
    const texts = i18n[lang];
    let content, title;
    var buttons = [];
    if (null === snapshots){
      content = <Skeleton variant="rect" style={{height: '10rem'}}/>;
      title = '';
    }else{
      if ('' === snapshots.rootName){
        content = <Box display='flex' justifyContent="center">{texts.noResource}</Box>;
      }else{
        var expanded = [];
        const nodeToTree = node => {
          let label;
          if(node.isCurrent){
            label = node.name + '( '+ texts.current +' )';
          }else{
            label = node.name;
          }
          expanded.push(node.name);
          var props = {
            nodeId: node.name,
            label: label,
            key: node.name,
            onClick: e =>{
              e.preventDefault();
              onSelectSnapshot(node.name);
            },
          }
          if(node.name === snapshots.rootName){
            props.icon = <FolderIcon/>
          }else if (node.name === snapshots.current){
            props.icon = <DoubleArrowIcon/>
          }
          if(node.children){
            var childrenNodes = [];
            node.children.forEach(child =>{
              childrenNodes.push(nodeToTree(child));
            })
            props.children = childrenNodes;
          }
          return React.createElement(TreeItem, props);
        }

        const rootFolder = nodeToTree(snapshots.rootNode);
        const snapshotTree = (
          <TreeView
            defaultCollapseIcon={<SubdirectoryArrowRightIcon />}
            defaultExpandIcon={<ChevronRightIcon />}
            defaultEndIcon={<CameraAltIcon/>}
            defaultExpanded={expanded}
            >
            {rootFolder}
          </TreeView>);

        let selectPanel;
        if(selectedSnapshot){
          var tableData = [
            {
              title: texts.name,
              value: selectedSnapshot.name,
            },
            {
              title: texts.description,
              value: selectedSnapshot.description,
            },
            {
              title: texts.createdTime,
              value: selectedSnapshot.create_time,
            },
            {
              title: texts.type,
              value: selectedSnapshot.running? texts.realtime : texts.offline,
            },
          ];
          const panelButtons = [
            <Button size="sm" color="info" onClick={showRevertDialog}>
              <RestoreIcon />{texts.revert}
            </Button>,
            <Button size="sm" color="info" onClick={showDeleteDialog}>
              <DeleteIcon />{texts.delete}
            </Button>,
          ];

          selectPanel = (
            <Paper className={classes.panel}>
              <Box p={2} m={1}>
                <Table  size="small">
                  <TableBody>
                    {
                      tableData.map(row => (
                        <TableRow key={row.title}>
                          <TableCell component='th'>
                            <Typography component='span' variant='subtitle1'>
                              {row.title}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography component='span'>
                              {row.value}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))
                    }
                  </TableBody>
                </Table>
              </Box>
              <Box display='flex' m={2}>
                {
                  panelButtons.map((button, key) => (
                    <Box key={key} m={2} p={1}>
                      {button}
                    </Box>
                  ))
                }
              </Box>
            </Paper>
          )
        }else{
          selectPanel = <div/>
        }
        content = (
          <GridContainer>
            <GridItem xs={12} sm={6}>
              {snapshotTree}
            </GridItem>
            <GridItem xs={12} sm={6}>
              {selectPanel}
            </GridItem>
          </GridContainer>
        );
      }

      title = texts.title + snapshots.name;
      buttons = [
        <Button size="sm" color="info" round onClick={() =>{
          props.history.goBack();
        }}><NavigateBeforeIcon />{texts.back}</Button>,
        <Button size="sm" color="info" round onClick={showCreateDialog}><AddIcon />{texts.create}</Button>,
      ];
    }

    return (
      <GridContainer>
        <GridItem xs={12}>
          <Box display='flex'>
          {
            buttons.map((button, key) => (
              <Box key={key} pl={2} pr={2}>
                {button}
              </Box>
            ))
          }
          </Box>
        </GridItem>
        <GridItem xs={12}>
          <Box mt={3} mb={3}>
            <Divider/>
          </Box>
        </GridItem>
        <GridItem xs={12} sm={12} md={12}>
          <Card>
            <CardHeader color="primary">
              {title}
            </CardHeader>
            <CardBody>
              {content}
            </CardBody>
          </Card>
        </GridItem>
        <GridItem>
          <Snackbar
            place="tr"
            color={notifyColor}
            message={notifyMessage}
            open={"" !== notifyMessage}
            closeNotification={closeNotify}
            close
          />
        </GridItem>
        <GridItem>
          <CreateSnapshotDialog
            lang={lang}
            open={createDialogVisible}
            instanceID={instanceID}
            onSuccess={onCreateSuccess}
            onCancel={closeCreateDialog}
            />
        </GridItem>
        <GridItem>
          <DeleteSnapshotDialog
            lang={lang}
            open={deleteDialogVisible}
            instanceID={instanceID}
            snapshotName={selectedSnapshot? selectedSnapshot.name: ''}
            onSuccess={onDeleteSuccess}
            onCancel={closeDeleteDialog}
            />
        </GridItem>
        <GridItem>
          <RevertSnapshotDialog
            lang={lang}
            open={revertDialogVisible}
            instanceID={instanceID}
            snapshotName={selectedSnapshot? selectedSnapshot.name: ''}
            onSuccess={onRevertSuccess}
            onCancel={closeRevertDialog}
            />
        </GridItem>
      </GridContainer>
    );
}
