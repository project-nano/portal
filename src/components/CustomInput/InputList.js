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
  type: PropTypes.oneOf(["text", "select", "radio", "switch"]).isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.any.isRequired,
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
