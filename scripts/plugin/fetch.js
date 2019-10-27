require("whatwg-fetch");
require("es6-promise");
const fetchJsonp = require("fetch-jsonp");

let __header = {
  'Accept': 'application/json',
  'Content-Type': 'application/json'
};
let __parseJSON = response => response.json();
let __checkStatus = response => {
  if (response.status >= 200 && response.status < 300) {
      return response;
  } else {
    let error = new Error(response.statusText);
    error.response = response;
    throw error;
  }
};

/**
 * fetch包了一层
 * @param  {object} opt 
  opt.api
  opt.type
  opt.data
 * @return 
 */
let Fetch = opt => {
  return fetch(
    opt.api, opt.type == "post" 
    ? {
      method: opt.type,
      headers: opt.header || __header,
      credentials: 'same-origin',
      body: opt.isForm ? opt.data : JSON.stringify(opt.data)
    } 
  : {
      method: opt.type || 'get',
      credentials: 'same-origin',
      headers: opt.header || __header
    })
  .then(__checkStatus)
  .then(__parseJSON)
  .then( data => Promise.resolve(data))
  .catch( ex => Promise.reject(ex));
};
/**
 * fetch jsonp
 * @param  {[type]} opt [description]
 * @return {[type]}     [description]
 */
let Jsonp = opt => {
  let {api, timeout, callbackName} = opt;

  let params = {};
  if (callbackName) {
    params.jsonpCallback = callbackName;
  }
  if (timeout) {
    params.timeout = timeout;
  }
  return fetchJsonp(api, params)
  .then(__parseJSON)
  .then(data => {
    return Promise.resolve(data);
  })
  .catch( ex => Promise.reject(ex));
};

export {Fetch, Jsonp};
module.exports = {Fetch,Jsonp};

