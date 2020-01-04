import React from "react";
import PersonIcon from '@material-ui/icons/Person';
import GroupIcon from '@material-ui/icons/Group';
import ListAltIcon from '@material-ui/icons/ListAlt';

import Tabs from "components/CustomTabs/CustomTabs.js";
import UserTab from "views/Users/UserTab";
import GroupTab from "views/Users/GroupTab";
import GroupMemberTab from "views/Users/GroupMemberTab";
import RoleTab from "views/Users/RoleTab";

const i18n = {
  'en':{
    title: 'Permissions',
    user: 'Users',
    group: 'User Groups',
    role: 'Roles',
  },
  'cn':{
    title: '权限管理',
    user: '用户',
    group: '用户组',
    role: '角色',
  },
}

const MutableGroupTab = props => {
  const { lang } = props;
  const [ group, setGroup ] = React.useState('');
  if(group){
    return <GroupMemberTab lang={lang} group={group} onBack={() => setGroup('')}/>;
  }else{
    return <GroupTab lang={lang} setGroup={setGroup}/>;
  }
}

export default function Main(props){
  const { lang } = props;
  const texts = i18n[lang];
  return (
    <Tabs
      title={texts.title}
      headerColor="primary"
      tabs={[
        {
          tabName: texts.user,
          tabIcon: PersonIcon,
          tabContent: <UserTab lang={lang}/>,
        },
        {
          tabName: texts.group,
          tabIcon: GroupIcon,
          tabContent: <MutableGroupTab lang={lang}/>,
        },
        {
          tabName: texts.role,
          tabIcon: ListAltIcon,
          tabContent: <RoleTab lang={lang}/>,
        },
      ]}
    />
  )

}
