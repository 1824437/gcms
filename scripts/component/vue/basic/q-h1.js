/*
* @Author: tao.zhu
* @Date: 2017-09-13 11:05:09
* @Last Modified by: tao.zhu
* @Last Modified time: 2017-09-13 11:05:09
* @Description:h1标题
* @dependencies:
* @File Type:
* @Pmo: DUJIATTS-1867
*/

/**
 * @example
 * data
parcel: 100, //标题下划线宽度
 * slot
 text //标题文本
 small //小标
 */


let __string =require("./q-h1.string");

let qH1 = Vue.component("q-h1", {
  props: ["parcel"],
  template: __string
});

export {qH1};
module.exports = qH1;