/*
* @Author: zhutao
* @Date: 2017-11-14 11:07:33
 * @Last Modified by: tao.zhu
 * @Last Modified time: 2018-02-01 18:01:03
* @Description: 弹窗装载，检测登录状态。
* @dependencies:
* @File Type:
* @Pmo:
*/
let console;
{
  if (window.console && window.console.log){
    console = window.console;
  } else {
    console = {log: _=>_};
  }
}
const {Fetch, Jsonp} = require("projectCommon/fetch.js");
const __error = {
  failedToLoad: "login module failed to load!"
};
const __static = {
  styleUrl: {},
  scriptUrl: {},
  checkLoginApi: "//user.com/islogin.jsp"
};
/**
 * 登录弹窗所需style,script, https使用=ssl
 */
{
  __static.styleUrl.http = "//user.com/webApi/popup.jsp?css";
  __static.styleUrl.https = __static.styleUrl.http + "=ssl";
  __static.scriptUrl.http = "//user.com/webApi/popup.jsp?js";
  __static.scriptUrl.https = __static.scriptUrl.http + "=ssl";
}

const __reg = {
  protocol: /^(.*?)\:\/\//
};
/**
 * 协议检测
 * @return {[type]} [description]
 */
function getProtocol (){
  let href = window.location.href;
  let result = href.match(__reg.protocol);
  if (result === null){
    return null;
  } else {
    return result[1];
  }
}
/**
 * 获取head
 * @return {[type]} [description]
 */
function getHeader(){
  return document.getElementsByTagName("head")[0] 
  || document.getElementsByTagName("body")[0];
}
/**
 * 动态加载JS,css
 * @param {string} type "script,style,img"
 * @return {promise}
 */
function loader ({type = "script", url}){
  if (!url){
    console && console.log && console.log("没发现url");
    return;
  }
  let element = null;
  switch (type){
    case "style":
      element = document.createElement("link");
      element.setAttribute("rel", "stylesheet");
      element.setAttribute("href", url);
    break;
    case "script":
      element = document.createElement("script");
      element.setAttribute("type", "text/javascript");
      element.setAttribute("src", url);
    break;
    default:
      console && console.log && console.log("哥哥，你想要点啥资源？");
      return;
    break;
  }
  
  let _p = new Promise((resolve, reject) => {
    element.addEventListener("load",()=> {
      resolve(element);
    }, false);
    element.addEventListener("error", err => {
      console.log(__error.failedToLoad, url);
      reject(err);
    }, false);
  });
    getHeader().appendChild(element);
  
  return _p;
  
}

const User = {
  loadLoginPopup (){
    let protocol = getProtocol(), script, style;
    if (protocol === 'http'){
      style = loader({type: "style",url: __static.styleUrl.http});
      script = loader({url: __static.scriptUrl.http});
    } else {
      style = loader({type: "style",url: __static.styleUrl.https});
      script = loader({url: __static.scriptUrl.https});
    }
    let time = new Promise((resolve, reject) => {
    setTimeout(_=> {reject("rejecttime")}, 10);
     setTimeout(_=> {resolve("resolvetime")}, 15);
    });
    Promise.race([script,style,time]).then(
      res => {console.log(res, "then");}
    ).catch(err => {console.log(err, "catch")});
    return Promise.all([style,script]);
  },
  checkLogin (){
    let api = `${__static.checkLoginApi}?conkey=${location.hostname}&n=${new Date()-0}`;
    return Jsonp({api});
  }
};


export default User;