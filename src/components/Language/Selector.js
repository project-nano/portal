
import React from "react";
import Typography from '@material-ui/core/Typography';
import Button from "components/CustomButtons/Button.js";
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ChatBubbleOutlineIcon from '@material-ui/icons/ChatBubbleOutline';
import { changeLanguage } from 'utils.js';

class Selector extends React.Component{
  constructor(props) {
    super(props);
    this.openMenu = this.openMenu.bind(this);
    this.closeMenu = this.closeMenu.bind(this);
    this.languages = [
      {
        locale: 'cn',
        name: '简体中文',
      },
      {
        locale: 'en',
        name: 'English',
      },
    ];
    const { lang, setLang, ...rest } = props;
    this.restProps = rest;
    this.changeLanguage = setLang;
    let initialText;
    this.languages.forEach(current => {
      if(lang === current.locale){
        initialText = current.name;
      }
    })

    this.state = {
      language: lang,
      anchorEl: null,
      displayText: initialText,
    };
  }

  updateLanguage(lang){
    this.languages.forEach(current => {
      if(lang === current.locale){
        this.setState({
          displayText: current.name,
          anchorEl: null,
        })
      }
    })
    changeLanguage(lang);
    this.changeLanguage(lang);
  }

  openMenu(event){
    this.setState({
      anchorEl: event.currentTarget,
    });
  }

  closeMenu() {
    this.setState({
      anchorEl: null,
    });
  }

  render(){
    const currentLang = this.state.language;
    const { buttonClass, ...others } = this.restProps;
    return (
      <Typography component='div'>
        <Button {...others} onClick={this.openMenu} color='transparent' size='sm'>
          <ChatBubbleOutlineIcon fontSize='small' className={buttonClass}/>
           {this.state.displayText}
        </Button>
        <Menu
          keepMounted
          anchorEl={this.state.anchorEl}
          onClose={this.closeMenu}
          open={Boolean(this.state.anchorEl)}
        >
          {
            this.languages.map((lang) => (
              <MenuItem
                key={lang.locale}
                selected={lang.locale === currentLang}
                onClick={() => {
                    this.updateLanguage(lang.locale);
                }}
                >
                <Typography component='div' variant='overline'>
                  {lang.name}
                </Typography>
              </MenuItem>
            ))
          }
        </Menu>
      </Typography>
    );
  }
}

export default Selector;
