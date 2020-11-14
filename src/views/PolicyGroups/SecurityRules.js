import React from "react";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import Skeleton from '@material-ui/lab/Skeleton';
import AddIcon from '@material-ui/icons/Add';
import Divider from '@material-ui/core/Divider';
import DeleteIcon from '@material-ui/icons/Delete';
import BuildIcon from '@material-ui/icons/Build';
import CheckIcon from '@material-ui/icons/Check';
import BlockIcon from '@material-ui/icons/Block';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import Box from '@material-ui/core/Box';
import Tooltip from "@material-ui/core/Tooltip";

// dashboard components
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import Info from "components/Typography/Info.js";
import Snackbar from "components/Snackbar/Snackbar.js";
import Button from "components/CustomButtons/Button.js";
import Table from "components/Table/ObjectTable.js";
import IconButton from "components/CustomButtons/IconButton.js";
import RemoveDialog from "views/PolicyGroups/RemoveRuleDialog.js";
import AddDialog from "views/PolicyGroups/AddRuleDialog.js";
import ModifyDialog from "views/PolicyGroups/ModifyRuleDialog.js";
import fontStyles from "assets/jss/material-dashboard-react/components/typographyStyle.js";
import { getSecurityPolicyRules, moveUpSecurityPolicyRule,
  moveDownSecurityPolicyRule, writeLog } from "nano_api.js";

const styles = {
  ...fontStyles,
  cardTitleWhite: {
    color: "#FFFFFF",
    marginTop: "0px",
    minHeight: "auto",
    fontWeight: "300",
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    marginBottom: "3px",
    textDecoration: "none",
    "& small": {
      color: "#777",
      fontSize: "65%",
      fontWeight: "400",
      lineHeight: "1"
    }
  }
};

const useStyles = makeStyles(styles);

const i18n = {
  'en':{
    createButton: "Add New Rule",
    tableTitle: "Security Policy Rules",
    rule: 'Rule',
    action: 'Action',
    protocol: 'Protocol',
    sourceAddress: 'Source Address',
    targetPort: 'Target Port',
    accept: 'Accept',
    reject: 'Reject',
    operates: "Operates",
    noResource: "No security policy available",
    modify: 'Modify',
    remove: 'Remove',
    moveUp: 'Move Up',
    moveDown: 'Move Down',
    back: 'Back',
  },
  'cn':{
    createButton: "添加新规则",
    tableTitle: "安全规则",
    rule: '规则',
    action: '处理',
    protocol: '协议',
    sourceAddress: '来源地址',
    targetPort: '目标端口',
    accept: '接受',
    reject: '拒绝',
    operates: "操作",
    noResource: "没有安全策略组",
    modify: '修改',
    remove: '移除',
    moveUp: '上移',
    moveDown: '下移',
    back: '返回',
  }
}

export default function SystemTemplates(props){
    const policyID = props.match.params.id;
    const { lang } = props;
    const texts = i18n[lang];
    const classes = useStyles();
    const [ mounted, setMounted ] = React.useState(false);
    const [ datalist, setDatalist ] = React.useState(null);
    //for dialog
    const [ addDialogVisible, setAddDialogVisible ] = React.useState(false);
    const [ modifyDialogVisible, setModifyDialogVisible ] = React.useState(false);
    const [ remoeDialogVisible, setRemoveDialogVisible ] = React.useState(false);
    const [ selected, setSelected ] = React.useState('');

    const [ notifyColor, setNotifyColor ] = React.useState('warning');
    const [ notifyMessage, setNotifyMessage ] = React.useState("");

    const closeNotify = () => {
      setNotifyMessage("");
    }

    const showErrorMessage = React.useCallback((msg) => {
      if (!mounted){
        return;
      }
      const notifyDuration = 3000;
      setNotifyColor('warning');
      setNotifyMessage(msg);
      setTimeout(closeNotify, notifyDuration);
    }, [setNotifyColor, setNotifyMessage, mounted]);

    const reloadAllData = React.useCallback(() => {
      if (!mounted){
        return;
      }
      getSecurityPolicyRules(policyID, setDatalist, showErrorMessage);
    }, [policyID, showErrorMessage, mounted]);

    const showNotifyMessage = msg => {
      if (!mounted){
        return;
      }
      const notifyDuration = 3000;
      setNotifyColor('info');
      setNotifyMessage(msg);
      writeLog(msg);
      setTimeout(closeNotify, notifyDuration);
    };

    //modify
    const showModifyDialog = rule =>{
      setModifyDialogVisible(true);
      setSelected(rule);
    }

    const closeModifyDialog = () =>{
      setModifyDialogVisible(false);
    }

    const onModifySuccess = index =>{
      closeModifyDialog();
      showNotifyMessage(index + 'th rule modified');
      reloadAllData();
    };

    //delete
    const showRemoveDialog = rule =>{
      setRemoveDialogVisible(true);
      setSelected(rule);
    }

    const closeRemoveDialog = () =>{
      setRemoveDialogVisible(false);
    }

    const onRemoveSuccess = (id, index) =>{
      closeRemoveDialog();
      showNotifyMessage(index + 'the rule removed');
      reloadAllData();
    };

    //create
    const showAddDialog = () =>{
      setAddDialogVisible(true);
    };

    const closeAddDialog = () =>{
      setAddDialogVisible(false);
    }

    const onAddSuccess = () =>{
      closeAddDialog();
      showNotifyMessage('new security policy rule added');
      reloadAllData();
    };

    //move rule
    const moveUp = rule =>{
      const onMoveUpSuccess = (id, i) =>{
        showNotifyMessage(i + 'th rule moved up');
        reloadAllData();
      }
      moveUpSecurityPolicyRule(policyID, rule.index, onMoveUpSuccess, showErrorMessage);
    }

    const moveDown = rule =>{
      const onMoveDownSuccess = (id, i) =>{
        showNotifyMessage(i + 'th rule moved down');
        reloadAllData();
      }
      moveDownSecurityPolicyRule(policyID, rule.index, onMoveDownSuccess, showErrorMessage);
    }

    React.useEffect(() =>{
      setMounted(true);
      reloadAllData();
      return () =>{
        setMounted(false);
      }
    }, [reloadAllData]);

    function dataToNodes(index, datalist, buttons){
      const operates = buttons.map((button, key) => (
        <IconButton label={button.label} icon={button.icon} onClick={button.onClick} key={key}/>
      ))
      const { action, protocol, from_address, to_port } = datalist;
      let actionIcon;
      if ('accept' === action){
        actionIcon = (
          <Tooltip title={texts.accept} placement="top">
            <CheckIcon className={classes.successText}/>
          </Tooltip>);
      }else{
        actionIcon = (
          <Tooltip title={texts.reject} placement="top">
            <BlockIcon className={classes.dangerText}/>
          </Tooltip>);
      }
      return [ index, actionIcon, protocol, from_address, to_port, operates];
    }

    //begin rendering
    let content;
    if (null === datalist){
      content = <Skeleton variant="rect" style={{height: '10rem'}}/>;
    }else if (0 === datalist.length){
      content = <Box display="flex" justifyContent="center"><Info>{texts.noResource}</Info></Box>;
    }else{
      var rows = [];
      datalist.forEach( (rule, index) => {
        var item = {
          index: index,
          action: rule.action,
          protocol: rule.protocol,
          to_port: rule.to_port,
        }
        var buttons = [
          {
            onClick: e => showModifyDialog(item),
            icon: BuildIcon,
            label: texts.modify,
          },
          {
            onClick: e => showRemoveDialog(item),
            icon: DeleteIcon,
            label: texts.remove,
          },
        ];
        if (datalist.length - 1 !== index){
          buttons.push({
            onClick: e => moveDown(item),
            icon: ArrowDownwardIcon,
            label: texts.moveDown,
          });
        }
        if (0 !== index){
          buttons.push({
            onClick: e => moveUp(item),
            icon: ArrowUpwardIcon,
            label: texts.moveUp,
          });
        }

        rows.push(dataToNodes(index, rule, buttons));
      });

      content = (
        <Table
          color="primary"
          headers={[texts.rule, texts.action, texts.protocol, texts.sourceAddress, texts.targetPort, texts.operates]}
          rows={rows}/>
      );

    }

    var buttonProps = [
      {
        href: '/admin/security_policies/',
        icon: NavigateBeforeIcon,
        label: texts.back,
      },
      {
        onClick: showAddDialog,
        icon: AddIcon,
        label: texts.createButton,
      },
    ];

    return (
      <GridContainer>
        <GridItem xs={12}>
          <Box mt={3} mb={3}>
          <Divider/>
          </Box>
        </GridItem>
        <GridItem xs={12}>
          <GridContainer>
            <GridItem xs={12} sm={6} md={4}>
              <Box display="flex">
              {
                buttonProps.map( (p, key) => {
                  if (p.href){
                    return (
                      <Box p={1} key={key}>
                        <Button size="sm" color="info" round href={p.href}>
                          {React.createElement(p.icon)}{p.label}
                        </Button>
                      </Box>
                    );
                  }else{
                    return (
                      <Box p={1} key={key}>
                        <Button size="sm" color="info" round onClick={p.onClick}>
                          {React.createElement(p.icon)}{p.label}
                        </Button>
                      </Box>
                    );
                  }
                })
              }
              </Box>
            </GridItem>
          </GridContainer>
        </GridItem>
        <GridItem xs={12}>
          <Card>
            <CardHeader color="primary">
              <h4 className={classes.cardTitleWhite}>{texts.tableTitle}</h4>
            </CardHeader>
            <CardBody>
              {content}
            </CardBody>
          </Card>
        </GridItem>
        <Snackbar
          place="tr"
          color={notifyColor}
          message={notifyMessage}
          open={"" !== notifyMessage}
          closeNotification={closeNotify}
          close
        />
        <AddDialog
          lang={lang}
          open={addDialogVisible}
          policyID={policyID}
          onSuccess={onAddSuccess}
          onCancel={closeAddDialog}
          />
        <ModifyDialog
          lang={lang}
          open={modifyDialogVisible}
          policyID={policyID}
          rule={selected}
          onSuccess={onModifySuccess}
          onCancel={closeModifyDialog}
          />
        <RemoveDialog
          lang={lang}
          open={remoeDialogVisible}
          policyID={policyID}
          index={selected.index}
          onSuccess={onRemoveSuccess}
          onCancel={closeRemoveDialog}
          />
      </GridContainer>
    );
}
