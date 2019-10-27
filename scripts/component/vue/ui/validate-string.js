/*
* @Author: tao.zhu
* @Date: 2017-09-13 11:05:09
* @Last Modified by: tao.zhu
* @Last Modified time: 2017-09-13 11:05:09
* @Description:透明行程是的添加景点模块
* @dependencies:
* @File Type:
* @Pmo: DUJIATTS-1867
*/
 /**
  * 校验要注意
  * 1. 焦点在表单元素上，隐藏相关的校验提示
  * 2. 提示时，全局校验，批量显示校验提示。
  * 
  * 
  */

const __string = require("./validate-string.string");

const validateString = Vue.component("validate-string", {
  template: __string,
  data () {
    return {
      showMessage: true
    };
  },
  /**
   * @props parcel
   * @props parcel.isValidate //是否校验，这个为false ,不显示
   * @props parcel.isPass //校验的情况下，如果校验不成功 为 true
   * @props parcel.message //校验要显示的信息
   */
  props: [
    "parcel"
  ],
  computed: {
    //是否激活 hid样式名(占位隐藏)
    isActiveClass (){
      if (this.parcel.isValidate === false){
        return true;
      } else if (this.parcel.isPass === true){
        return true;
      } else {
        return false;
      }
    }
  }
});

export default validateString;
module.exports = validateString;