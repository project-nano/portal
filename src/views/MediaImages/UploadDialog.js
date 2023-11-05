import React from "react";
import Grid from "@material-ui/core/Grid";
import Skeleton from '@material-ui/lab/Skeleton';
import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';
import InputList from "components/CustomInput/InputList";
import CustomDialog from "components/Dialog/CustomDialog.js";
import { createMediaImage, deleteMediaImage, uploadMediaImage } from 'nano_api.js';

const i18n = {
  'en': {
    title: 'Upload New Image',
    name: 'Image Name',
    description: 'Description',
    tags: 'Tags',
    file: 'Image File',
    choose: 'Choose File',
    cancel: 'Cancel',
    confirm: 'Upload',
  },
  'cn': {
    title: '上传新镜像',
    name: '镜像名称',
    description: '描述',
    tags: '标签',
    file: '镜像文件',
    choose: '浏览文件',
    cancel: '取消',
    confirm: '上传',
  },
}

export default function UploadDialog(props) {
  const defaultValues = {
    name: '',
    description: '',
    tags: new Map(),
    file: null,
  };
  const { lang, open, onSuccess, onCancel } = props;
  const [initialed, setInitialed] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [operatable, setOperatable] = React.useState(true);
  const [prompt, setPrompt] = React.useState('');
  const [mounted, setMounted] = React.useState(false);
  const [request, setRequest] = React.useState(defaultValues);
  const [options, setOptions] = React.useState({
    tags: [],
  });

  const texts = i18n[lang];
  const title = texts.title;
  const onUploadFail = React.useCallback(msg => {
    if (!mounted) {
      return;
    }
    setOperatable(true);
    setPrompt(msg);
  }, [mounted]);

  const resetDialog = () => {
    setPrompt('');
    setRequest(defaultValues);
    setInitialed(false);
    setUploading(false);
    setProgress(0);
  }

  const closeDialog = () => {
    resetDialog();
    onCancel();
  }

  const onUploadSuccess = imageID => {
    if (!mounted) {
      return;
    }
    setOperatable(true);
    resetDialog();
    onSuccess(imageID);
  }

  const onUploadProgress = progress => {
    if (!mounted) {
      return;
    }
    setProgress(progress);
  }

  const handleConfirm = () => {
    setPrompt('');
    setOperatable(false);
    const imageName = request.name;
    if ('' === imageName) {
      onUploadFail('must specify image name');
      return;
    }
    const description = request.description;
    if ('' === description) {
      onUploadFail('desciption required');
      return;
    }

    if (!request.tags) {
      onUploadFail('image tags required');
      return;
    }
    var tags = [];
    request.tags.forEach((value, key) => {
      if (value) {
        //checked
        tags.push(key);
      }
    });
    if (0 === tags.length) {
      onUploadFail('image tags required');
      return;
    }

    if (!request.file) {
      onUploadFail('must specify upload file');
      return;
    }

    const onCreateSuccess = (imageID) => {
      if (!mounted) {
        return;
      }
      const onDeleteSuccess = () => {
        onUploadFail('new image ' + imageName + ' deleted');
      }
      const onDeleteFail = (msg) => {
        onUploadFail('delete new image ' + imageName + ' fail: ' + msg);
      }
      const onFailAfterCreated = () => {
        deleteMediaImage(imageID, onDeleteSuccess, onDeleteFail);
      }
      setUploading(true);
      uploadMediaImage(imageID, request.file, onUploadProgress, onUploadSuccess, onFailAfterCreated);
    }

    createMediaImage(imageName, description, tags, onCreateSuccess, onUploadFail);
  }

  const handleRequestPropsChanged = name => e => {
    if (!mounted) {
      return;
    }
    var value = e.target.value
    setRequest(previous => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleTagsChanged = name => e => {
    if (!mounted) {
      return;
    }
    var value = e.target.checked
    setRequest(previous => ({
      ...previous,
      tags: previous.tags.set(name, value),
    }));
  };

  const handleFileChanged = name => e => {
    if (!mounted) {
      return;
    }
    setPrompt('');
    var file = e.target.files[0];
    e.preventDefault();
    //check extension
    if (file && file.name) {
      let ext = file.name.split('.').pop().toLowerCase();
      if (ext === 'iso') {
        setRequest(previous => ({
          ...previous,
          [name]: file,
        }));
        return;
      }
    }
    //invalid file
    if ('en' === lang){
      setPrompt('invalid file, only iso file supported');
    }else{
      setPrompt('无效文件，仅支持iso格式');
    }

  };

  React.useEffect(() => {
    if (!open) {
      return;
    }
    const imageTags = [
      ['linux', 'Linux'],
      ['windows', 'Windows'],
      ['centos', 'Centos'],
      ['ubuntu', 'Ubuntu'],
      ['64bit', '64Bit'],
      ['32bit', '32Bit']
    ];

    setMounted(true);
    var tagOptions = [];
    imageTags.forEach(tag => {
      tagOptions.push({
        label: tag[1],
        value: tag[0],
      });
    });
    setOptions({
      tags: tagOptions,
    });
    setInitialed(true);

    return () => {
      setMounted(false);
    }
  }, [open]);

  //begin render
  var buttons = [{
    color: 'transparent',
    label: texts.cancel,
    onClick: closeDialog,
  }];
  let content;
  if (!initialed) {
    content = <Skeleton variant="rect" style={{ height: '10rem' }} />;
  } else if (uploading) {
    content = (
      <Grid container>
        <Grid item xs={12}>
          <LinearProgress variant="determinate" value={progress} />
        </Grid>
        <Grid item xs={12}>
          <Typography align="center">
            {progress.toFixed(2) + '%'}
          </Typography>
        </Grid>
      </Grid>
    )
  } else {
    const inputs = [
      {
        type: "text",
        label: texts.name,
        value: request.name,
        onChange: handleRequestPropsChanged('name'),
        required: true,
        oneRow: true,
        xs: 8,
      },
      {
        type: "textarea",
        label: texts.description,
        value: request.description,
        onChange: handleRequestPropsChanged('description'),
        required: true,
        oneRow: true,
        rows: 4,
        xs: 12,
      },
      {
        type: "checkbox",
        label: texts.tags,
        onChange: handleTagsChanged,
        value: request.tags,
        options: options.tags,
        required: true,
        oneRow: true,
        xs: 10,
      },
      {
        type: "file",
        label: texts.file,
        onChange: handleFileChanged('file'),
        required: true,
        oneRow: true,
        xs: 12,
      },
    ];

    content = <InputList inputs={inputs} />

    buttons.push(
      {
        color: 'info',
        label: texts.confirm,
        onClick: handleConfirm,
      }
    );

  }

  return <CustomDialog size='sm' open={open} prompt={prompt} hideBackdrop
    title={title} buttons={buttons} content={content} operatable={operatable} />;
};
