import React from "react";
import PropTypes from "prop-types";
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Switch from '@material-ui/core/Switch';
import InputLabel from '@material-ui/core/InputLabel';
import TextField from '@material-ui/core/TextField';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import Grid from "@material-ui/core/Grid";
import Box from '@material-ui/core/Box';
import FormGroup from '@material-ui/core/FormGroup';
import Checkbox from '@material-ui/core/Checkbox';

function InputComponent(props){
  const { type, label, value, onChange, required, oneRow, disabled, options, ...rest } = props;
  let component;
  switch (type) {
    case "text":
      component = (
        <Box m={0} pt={2}>
          <TextField
            label={label}
            onChange={onChange}
            value={value}
            margin="normal"
            required={required}
            disabled={disabled}
            fullWidth
          />
        </Box>
      )
      break;
    case "password":
      component = (
        <Box m={0} pt={2}>
          <TextField
            label={label}
            onChange={onChange}
            value={value}
            type="password"
            margin="normal"
            required={required}
            disabled={disabled}
            fullWidth
          />
        </Box>
      )
      break;
    case "file":
      component = (
        <Box m={0} pt={2}>
          <TextField
            label={label}
            onChange={onChange}
            type="file"
            margin="normal"
            required={required}
            disabled={disabled}
            fullWidth
          />
        </Box>
      )
      break;
    case "textarea":
      var { rows } = props;
      if (rows < 2) {
        rows = 3
      }
      component = (
        <Box m={0} pt={2}>
          <TextField
            label={label}
            onChange={onChange}
            value={value}
            margin="normal"
            required={required}
            disabled={disabled}
            rowsMax={rows}
            multiline
            fullWidth
          />
        </Box>
      )
      break;
    case "select":
      component = (
        <Box m={0} pt={2}>
          <InputLabel>{label}</InputLabel>
          <Select
            value={value}
            onChange={onChange}
            required={required}
            disabled={disabled}
            fullWidth
          >
            {
              options.map((option, key) =>(
                <MenuItem value={option.value} key={key} disabled={option.disabled}>{option.label}</MenuItem>
              ))
            }
          </Select>
        </Box>
      )
      break;
    case "radio":
      component = (
        <Box m={0} pt={2}>
          <FormControl component="fieldset" fullWidth>
            <FormLabel component="legend">{label}</FormLabel>
            <RadioGroup name="type" value={value} onChange={onChange} row>
              <Box display='flex' alignItems='center'>
                {
                  options.map((option, key) =>(
                    <Box key={key}>
                      <FormControlLabel value={option.value} control={<Radio />} label={option.label}/>
                    </Box>
                  ))
                }
              </Box>
            </RadioGroup>
          </FormControl>
        </Box>
      )
      break;
    case "switch":
      const { on, off } = props;
      component = (
        <Box m={0} pt={2}>
          <InputLabel>{label}</InputLabel>
          <Grid item>
            {off}
            <Switch
              checked={value}
              onChange={onChange}
              color="primary"
            />
            {on}
          </Grid>
        </Box>
      )
      break;
    case "checkbox":
      component = (
        <Box m={0} pt={2}>
          <FormControl component="fieldset" fullWidth>
            <FormLabel component="legend">{label}</FormLabel>
            <FormGroup>
              <Grid container>
                {
                    options.map((option, key) => {
                      const tagValue = option.value;
                      const tagLabel = option.label;
                      let checked;
                      if (value.has(tagValue)){
                        checked = value.get(tagValue);
                      }else{
                        checked = false;
                      }
                      return (
                        <Grid item xs={6} sm={3} key={key}>
                          <FormControlLabel
                            control={<Checkbox checked={checked} onChange={onChange(tagValue)} value={tagValue}/>}
                            label={tagLabel}
                          />
                        </Grid>
                      )
                    })
                }
              </Grid>
            </FormGroup>
          </FormControl>
        </Box>
      )
      break;
    default:
      return <div/>;
  }
  var container = (
    <Grid item {...rest}>
      {component}
    </Grid>
  );

  if (oneRow){
    return (
      <Grid item xs={12}>
        {container}
      </Grid>
    );
  }else{
    return container;
  }
}

InputComponent.propTypes = {
  type: PropTypes.oneOf(["text", "password","textarea", "file", "select", "radio", "switch", "checkbox"]).isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.any,
  onChange: PropTypes.func,
  required: PropTypes.bool,
  oneRow: PropTypes.bool,
  xs: PropTypes.number,
  sm: PropTypes.number,
  md: PropTypes.number,
  lg: PropTypes.number,
  xl: PropTypes.number,
  on: PropTypes.string,
  off: PropTypes.string,
  rows: PropTypes.number,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.any.isRequired,
      disabled: PropTypes.bool,
    })
  ),
};

export default function InputList(props){
  const { inputs } = props;
  return (
    <Grid container>
      {
        inputs.map((input, key) => (
          <InputComponent key={key} {...input}/>
        ))
      }
    </Grid>
  )
}
