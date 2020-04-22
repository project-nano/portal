import React from "react";
import { Redirect } from 'react-router-dom';
// import { Redirect } from "@reach/router";

const SessionTagName = 'nano-session-data';
const LanguageTagName = 'nano-language-data';

export function saveLoggedSession(session){
  localStorage.setItem(SessionTagName, JSON.stringify(session));
}

export function getLoggedSession(){
  var sessionData = localStorage.getItem(SessionTagName);
  if (!sessionData || 0 === sessionData.length){
    //no session available
    return null;
  }
  var s = JSON.parse(sessionData);
  if (!s.id){
    return null;
  }
  return s;
}

export function logoutSession(){
  localStorage.setItem(SessionTagName, "");
}

//KiB based
export function bandwidthToString(bandwidthInKiB){
  const MiB = 1 << 10;
  const GiB = 1 << 20;
  if (bandwidthInKiB >= GiB){
    return (bandwidthInKiB / GiB).toString() + ' GiB/s';
  }else if (bandwidthInKiB >= MiB){
    return (bandwidthInKiB / MiB).toString() + ' MiB/s';
  }else{
    return bandwidthInKiB.toString() + ' KiB/s';
  }
}

//MiB based
export function quotaToString(quotaInMiB){
  const GiB = 1 << 10;
  if (quotaInMiB >= GiB){
    return (quotaInMiB / GiB).toString() + ' GiB';
  }else{
    return quotaInMiB.toString() + ' MiB';
  }
}

//MiB based
export function usageToString(used, quota){
  const GiB = 1 << 10;
  if (quota >= GiB){
    return (used / GiB).toFixed(2) + ' / ' + (quota / GiB).toString() + ' GiB';
  }else{
    return used.toFixed(2) + ' / ' + quota.toString() + ' MiB';
  }
}

export function redirectToLogin(){
  // return  <Redirect to={'/login/?previous=' + encodeURIComponent(window.location.pathname)} noThrow/>;
  return  <Redirect to={'/login/?previous=' + encodeURIComponent(window.location.pathname + window.location.search)}/>;
}

export function getLanguage(){
  const defaultLang = 'cn';
  var langData = localStorage.getItem(LanguageTagName);
  if (!langData || 0 === langData.length){
    return defaultLang;
  }
  var lang = JSON.parse(langData);
  if (!lang.lang){
    return defaultLang;
  }
  return lang.lang;
}

export function changeLanguage(lang){
  var configData = localStorage.getItem(LanguageTagName);
  if (!configData || 0 === configData.length){
    return false;
  }
  var config = JSON.parse(configData);
  if (!config.lang){
    return false;
  }
  if (config.lang === lang){
    return true;
  }
  config.lang = lang;
  localStorage.setItem(LanguageTagName, JSON.stringify(config));
  return true;
}

export function bytesToString(bytes){
  const KiB = 1 << 10;
  const MiB = 1 << 20;
  const GiB = 1 << 30;
  const toString = (size, radix, unit) =>{
    if (0 === size % radix){
      return (size / radix).toString() + ' ' + unit;
    }else{
      return (size / radix).toFixed(2) + ' ' + unit;
    }
  }
  if (bytes >= GiB){
    return toString(bytes, GiB, 'GB');
  }else if (bytes >= MiB){
    return toString(bytes, MiB, 'MB');
  }else if (bytes >= KiB){
    return toString(bytes, KiB, 'KB');
  }else{
    return bytes.toString() + ' Bytes';
  }
}

export function bpsToString(bytes){
  const KiB = 1 << 7;
  const MiB = 1 << 17;
  const GiB = 1 << 27;
  const toString = (size, radix, unit) =>{
    if (0 === size % radix){
      return (size / radix).toString() + ' ' + unit;
    }else{
      return (size / radix).toFixed(2) + ' ' + unit;
    }
  }
  if (bytes >= GiB){
    return toString(bytes, GiB, 'Gb/s');
  }else if (bytes >= MiB){
    return toString(bytes, MiB, 'Mb/s');
  }else if (bytes >= KiB){
    return toString(bytes, KiB, 'Kb/s');
  }else{
    return bytes.toString() + ' Bits/s';
  }
}

export function truncateToRadix(number, radix){
  const base = Math.pow(10, radix);
  return Math.round(number * base) / base;
}
