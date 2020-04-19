import React from "react";
// @material-ui/core components
import Skeleton from '@material-ui/lab/Skeleton';
import PublishIcon from '@material-ui/icons/Publish';
import DeleteIcon from '@material-ui/icons/Delete';
import SettingsIcon from '@material-ui/icons/Settings';
import Divider from '@material-ui/core/Divider';
import Box from '@material-ui/core/Box';
import Chip from '@material-ui/core/Chip';
import Typography from '@material-ui/core/Typography';

import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
// dashboard components
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Info from "components/Typography/Info.js";
import Snackbar from "components/Snackbar/Snackbar.js";
import Button from "components/CustomButtons/Button.js";

import IconButton from "components/CustomButtons/IconButton.js";
import DeleteDialog from "views/MediaImages/DeleteDialog.js";
import UploadDialog from "views/MediaImages/UploadDialog.js";
import ModifyDialog from "views/MediaImages/ModifyDialog.js";
import { bytesToString } from 'utils.js';
import { searchMediaImages, writeLog } from "nano_api.js";

const i18n = {
  'en':{
    modify: 'Modify Info',
    delete: 'Delete Image',
    createTime: 'Created Time',
    modifyTime: 'Modified Time',
    uploadButton: "Upload New ISO",
    noResource: "No images available",
  },
  'cn':{
    modify: '修改镜像信息',
    delete: '删除镜像',
    createTime: '创建时间',
    modifyTime: '修改时间',
    uploadButton: "上传新光盘镜像",
    noResource: "没有光盘镜像",
  }
}

function dataToNode(data, buttons, createLabel, modifyLabel){
  const { name, size, tags, description, create_time, modify_time, id } = data;
  const sizeLabel = bytesToString(size);
  const operates = buttons.map((button, key) => (
    React.createElement(IconButton, {
      ...button,
      key: key,
    })
  ));
  return (
    <Card>
      <CardHeader color="primary">
        <h4>{name}</h4>
        <span>{id}</span>
        <Box display="flex" alignItems="center">
          <Box m={1}>{sizeLabel}</Box>
          {
            tags.map(tag => <Box m={0} p={1} key={tag}><Chip label={tag}/></Box>)
          }
        </Box>
      </CardHeader>
      <CardBody>
        <Typography variant='body1' component='p' noWrap>
          {description}
        </Typography>
        <p>
          {createLabel + ': ' + create_time}
        </p>
        <p>
          {modifyLabel + ': ' + modify_time}
        </p>
        {operates}
      </CardBody>
    </Card>
  )
}

export default function MediaImages(props){
    const { lang } = props;
    const texts = i18n[lang];
    const [ mounted, setMounted ] = React.useState(false);
    const [ dataList, setDataList ] = React.useState(null);
    const [ uploadDialogVisible, setUploadDialogVisible ] = React.useState(false);
    const [ modifyDialogVisible, setModifyDialogVisible ] = React.useState(false);
    const [ deleteDialogVisible, setDeleteDialogVisible ] = React.useState(false);
    const [ selected, setSelected ] = React.useState('');
    const [ notifyColor, setNotifyColor ] = React.useState('warning');
    const [ notifyMessage, setNotifyMessage ] = React.useState("");

    const closeNotify = () => {
      setNotifyMessage("");
    }

    const showErrorMessage = React.useCallback(msg => {
      if (!mounted){
        return;
      }
      const notifyDuration = 3000;
      setNotifyColor('warning');
      setNotifyMessage(msg);
      setTimeout(closeNotify, notifyDuration);
    }, [setNotifyColor, setNotifyMessage, mounted]);

    const showNotifyMessage = (msg) => {
      const notifyDuration = 3000;
      setNotifyColor('info');
      setNotifyMessage(msg);
      writeLog(msg);
      setTimeout(closeNotify, notifyDuration);
    };

    const reloadAllData = React.useCallback(() => {
      if (!mounted){
        return;
      }
      const onLoadFail = err =>{
        if (!mounted){
          return;
        }
        showErrorMessage(err);
      }
      const onLoadSuccess = payload => {
        if (!mounted){
          return;
        }
        if (!payload){
          setDataList([]);
        }else{
          setDataList(payload);
        }
      }
      searchMediaImages(onLoadSuccess, onLoadFail);
    }, [showErrorMessage, mounted]);

    //detail
    const showModifyDialog = (imageID) =>{
      setModifyDialogVisible(true);
      setSelected(imageID);
    }

    const closeModifyDialog = () =>{
      setModifyDialogVisible(false);
    }

    const onModifySuccess = (imageID) =>{
      closeModifyDialog();
      showNotifyMessage('image '+ imageID + ' modified');
      reloadAllData();
    };

    //delete
    const showDeleteDialog = (imageID) =>{
      setDeleteDialogVisible(true);
      setSelected(imageID);
    }

    const closeDeleteDialog = () =>{
      setDeleteDialogVisible(false);
    }

    const onDeleteSuccess = (imageID) =>{
      closeDeleteDialog();
      showNotifyMessage('image '+ imageID + ' deleted');
      reloadAllData();
    };

    //create
    const showUploadDialog = () =>{
      setUploadDialogVisible(true);
    };

    const closeUploadDialog = () =>{
      setUploadDialogVisible(false);
    }

    const onUploadSuccess = (id) =>{
      closeUploadDialog();
      showNotifyMessage('new image ' + id + ' uploaded');
      reloadAllData();
    };

    React.useEffect(() =>{
      setMounted(true);
      reloadAllData();
      const updateInterval = 5 * 1000;
      var timerID = setInterval(()=>{
        reloadAllData();
      }, updateInterval);
      return () =>{
        setMounted(false);
        clearInterval(timerID);
      }
    }, [reloadAllData]);

    let content;
    if (null === dataList){
      content = <Skeleton variant="rect" style={{height: '10rem'}}/>;
    }else if (0 === dataList.length){
      content = <Box display="flex" justifyContent="center"><Info>{texts.noResource}</Info></Box>;
    }else{

      content = (
        <GridContainer>
        {
          dataList.map((image, key) =>{
            const buttons = [
              {
                label: texts.modify,
                icon: SettingsIcon,
                onClick: () => showModifyDialog(image.id),
              },
              {
                label: texts.delete,
                icon: DeleteIcon,
                onClick: () => showDeleteDialog(image.id),
              },

            ];
            var node = dataToNode(image, buttons, texts.createTime, texts.modifyTime);
            return (
              <GridItem xs={12} sm={6} md={4} key={key}>
                {node}
              </GridItem>
            )
          })
        }
        </GridContainer>
      );
    }

    return (
      <GridContainer>
        <GridItem xs={12} sm={12} md={12}>
          <GridContainer>
            <GridItem xs={3} sm={3} md={3}>
              <Button size="sm" color="info" round onClick={showUploadDialog}><PublishIcon />{texts.uploadButton}</Button>
            </GridItem>
          </GridContainer>
        </GridItem>
        <GridItem xs={12}>
          <Box mt={3} mb={3}>
          <Divider/>
          </Box>
        </GridItem>
        <GridItem xs={12} sm={12} md={12}>
          {content}
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
          <UploadDialog
            lang={lang}
            open={uploadDialogVisible}
            onSuccess={onUploadSuccess}
            onCancel={closeUploadDialog}
            />
        </GridItem>
        <GridItem>
          <ModifyDialog
            lang={lang}
            imageID={selected}
            open={modifyDialogVisible}
            onSuccess={onModifySuccess}
            onCancel={closeModifyDialog}
            />
        </GridItem>
        <GridItem>
          <DeleteDialog
            lang={lang}
            imageID={selected}
            open={deleteDialogVisible}
            onSuccess={onDeleteSuccess}
            onCancel={closeDeleteDialog}
            />
        </GridItem>
      </GridContainer>
    );
}
