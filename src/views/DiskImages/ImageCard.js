import React from "react";
import { Link } from "react-router-dom";
import DeleteIcon from '@material-ui/icons/Delete';
import SettingsIcon from '@material-ui/icons/Settings';
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import Chip from '@material-ui/core/Chip';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';

import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import { bytesToString } from 'utils.js';

const i18n = {
  'en':{
    modify: 'Modify Info',
    delete: 'Delete Image',
    createTime: 'Created Time',
    modifyTime: 'Modified Time',
  },
  'cn':{
    modify: '修改镜像信息',
    delete: '删除镜像',
    createTime: '创建时间',
    modifyTime: '修改时间',
  },
};

export default function ImageCard(props){
  const { lang, image, onModify, onDelete } = props;
  const texts = i18n[lang];

  const deleteOperator = {
    tips: texts.delete,
    icon: DeleteIcon,
    handler: onDelete,
  };
  const modifyOperator = {
    tips: texts.modify,
    icon: SettingsIcon,
    handler: onModify,
  };

  const operators = [modifyOperator, deleteOperator];
  const sizeLabel = bytesToString(image.size);

  return (
    <Card>
      <CardHeader color="primary">
        <h4>{image.name}</h4>
        <Box display="flex" alignItems="center">
          <Box m={1}>{sizeLabel}</Box>
          {
            image.tags.map(tag=> <Box m={0} p={1} key={tag}><Chip label={tag}/></Box>)
          }
        </Box>
      </CardHeader>
      <CardBody>
        <Typography variant='body1' component='p' noWrap>
          {image.description}
        </Typography>
        <p>
          {texts.createTime + ': ' + image.create_time}
        </p>
        <p>
          {texts.modifyTime + ': ' + image.modify_time}
        </p>
        {
          operators.map((operator, key) => {
            var icon = React.createElement(operator.icon);
            let button;
            if (operator.href){
              button = (
                <Link to={operator.href}>
                  <IconButton
                    color="inherit"
                    >
                    {icon}
                  </IconButton>
                </Link>
              );
            }else{
              button = (
                <IconButton
                  color="inherit"
                  onClick={()=>{
                    if(null !== operator.handler){
                      operator.handler(image.id);
                    }
                  }}
                  >
                  {icon}
                </IconButton>
              );
            }
            return (
              <Tooltip
                title={operator.tips}
                placement="top"
                key={key}
                >
                {button}
              </Tooltip>
            )
          })
        }
      </CardBody>
    </Card>
  )
}
