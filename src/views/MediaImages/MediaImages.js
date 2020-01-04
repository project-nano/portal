import React from "react";
// @material-ui/core components
import Skeleton from '@material-ui/lab/Skeleton';
import PublishIcon from '@material-ui/icons/Publish';
import Divider from '@material-ui/core/Divider';
import Box from '@material-ui/core/Box';

// dashboard components
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Info from "components/Typography/Info.js";
import Snackbar from "components/Snackbar/Snackbar.js";
import Button from "components/CustomButtons/Button.js";

import ImageCard from "views/MediaImages/ImageCard.js";
import DeleteDialog from "views/MediaImages/DeleteDialog.js";
import UploadDialog from "views/MediaImages/UploadDialog.js";
import ModifyDialog from "views/MediaImages/ModifyDialog.js";
import { getLoggedSession, logoutSession, redirectToLogin } from 'utils.js';
import { searchMediaImages, writeLog } from "nano_api.js";

const i18n = {
  'en':{
    uploadButton: "Upload New ISO",
    noResource: "No images available",
  },
  'cn':{
    uploadButton: "上传新光盘镜像",
    noResource: "没有光盘镜像",
  }
}

export default function MediaImages(props){
    const [ imageList, setImageList ] = React.useState(null);

    //for dialog
    const [ uploadDialogVisible, setUploadDialogVisible ] = React.useState(false);
    const [ modifyDialogVisible, setModifyDialogVisible ] = React.useState(false);
    const [ deleteDialogVisible, setDeleteDialogVisible ] = React.useState(false);
    const [ currentImage, setCurrentImage ] = React.useState('');

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

    const reloadAllImages = React.useCallback(() => {
      const onLoadFail = (err) =>{
        showErrorMessage(err);
        logoutSession();
      }
      const onLoadSuccess = (dataList) => {
        if (!dataList){
          setImageList([]);
        }else{
          setImageList(dataList);
        }
      }
      searchMediaImages(onLoadSuccess, onLoadFail);
    }, [showErrorMessage]);

    //detail
    const showModifyDialog = (imageID) =>{
      setModifyDialogVisible(true);
      setCurrentImage(imageID);
    }

    const closeModifyDialog = () =>{
      setModifyDialogVisible(false);
    }

    const onModifySuccess = (imageID) =>{
      closeModifyDialog();
      showNotifyMessage('image '+ imageID + ' modified');
      reloadAllImages();
    };

    //delete
    const showDeleteDialog = (imageID) =>{
      setDeleteDialogVisible(true);
      setCurrentImage(imageID);
    }

    const closeDeleteDialog = () =>{
      setDeleteDialogVisible(false);
    }

    const onDeleteSuccess = (imageID) =>{
      closeDeleteDialog();
      showNotifyMessage('image '+ imageID + ' deleted');
      reloadAllImages();
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
      reloadAllImages();
    };

    React.useEffect(() =>{
      var mounted = true
      reloadAllImages();
      const updateInterval = 5 * 1000;
      var timerID = setInterval(()=>{
        if (mounted){
          reloadAllImages();
        }
      }, updateInterval);
      return () =>{
        mounted = false;
        clearInterval(timerID);
      }
    }, [reloadAllImages]);

    //reder begin
    var session = getLoggedSession();
    if (null === session){
      return redirectToLogin();
    }

    const { lang } = props;
    const texts = i18n[lang];
    let content;
    if (null === imageList){
      content = <Skeleton variant="rect" style={{height: '10rem'}}/>;
    }else if (0 === imageList.length){
      content = <Info>{texts.noResource}</Info>;
    }else{
      content = (
        <GridContainer>
        {
          imageList.map(image =>(
            <GridItem xs={12} sm={6} md={4} key={image.id}>
              <ImageCard
                image={image}
                lang={lang}
                onModify={showModifyDialog}
                onDelete={showDeleteDialog}
                />
            </GridItem>
          ))
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
            imageID={currentImage}
            open={modifyDialogVisible}
            onSuccess={onModifySuccess}
            onCancel={closeModifyDialog}
            />
        </GridItem>
        <GridItem>
          <DeleteDialog
            lang={lang}
            imageID={currentImage}
            open={deleteDialogVisible}
            onSuccess={onDeleteSuccess}
            onCancel={closeDeleteDialog}
            />
        </GridItem>
      </GridContainer>
    );
}
