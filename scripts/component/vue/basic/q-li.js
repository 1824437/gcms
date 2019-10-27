/*
* @Author: tao.zhu
* @Date: 2017-09-13 11:05:09
* @Last Modified by: tao.zhu
* @Last Modified time: 2017-09-13 11:05:09
* @Description:列表
* @dependencies:
* @File Type:
* @Pmo: DUJIATTS-1867
*/

/**
 * @example
 * data
parcel:[{
  text:"", //显示的文字
  url: "",  //点击的链接
  iconStyle :"", //要主控制图标的颜色，有些要求着重
  icon: "" , //图标命名，详情请看element ui的图标，取后面的部分
  active: true | false 
},{...},...]
 */
let __string =require("./q-li.string");

let qLi = Vue.component("q-li", {
  props: ["tabs"],
  template: __string
});

export {qLi};
module.exports = qLi;