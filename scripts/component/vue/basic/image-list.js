/*
* @Author: tao.zhu
* @Date: 2017-09-13 11:05:09
* @Last Modified by: tao.zhu
* @Last Modified time: 2017-09-13 11:05:09
* @Description:上传图片之图片列表模块
* @dependencies:
* @File Type:
* @Pmo: DUJIATTS-1867
*/

/**
 * @props parcel
 *        [{
 *          "url": "", //图片url
 *          "desc": "" //说明文字（非必须的）
 *        }]
 * @events emit 
 * 非必须的，考虑到有些数据源是通过computed来的，所以给一个callback
 * @example
 * <image-list :parcel="tourImages" @emit="changeTourImages"></image-list>
 */
const __string = require("./image-list.string");
//移动数组元素
const {moveElementOfArray} = require("components/tools/array.js");
const imageList = Vue.component("image-list", {
  template: __string,
  props: ["parcel"],
  methods : {
    change(actionType, index){
      let maxIndex = this.parcel.length - 1;

      if (isNaN(index) || index < 0 || index > maxIndex){
        window.console && window.console.log("下标异常");
        return;
      }
      switch (actionType){
        case "delete":
          this.parcel.splice("index", 1);
        break;
        case "up":
          if(index !== 0){
            moveElementOfArray(this.parcel, index, index - 1);
          } else {
            return;
          }
        break;
        case "down":
          if (index !== this.parcel.length - 1){
            moveElementOfArray(this.parcel, index, index + 1);
          } else {
            return;
          }
        break;
      }
      this.$emit("emit", this.parcel);
    }
  }
});


export default imageList;
module.exports = imageList;
