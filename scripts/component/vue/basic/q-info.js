/*
* @Author: tao.zhu
* @Date: 2017-09-13 11:05:09
* @Last Modified by: tao.zhu
* @Last Modified time: 2017-09-13 11:05:09
* @Description:信息框
* @dependencies:
* @File Type:
* @Pmo: DUJIATTS-1867
*/

/**
 * @example
 * data
parcel: {
  scheme: "warning"|"success"|"info"|"error"|"silver"

}, 
 */
let __string =require("./q-info.string");

let qInfo = Vue.component("q-info", {
  props: ["scheme"],
  template: __string
});

export {qInfo};
module.exports = qInfo;