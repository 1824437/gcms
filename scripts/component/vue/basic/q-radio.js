/*
* @Author: tao.zhu
* @Date: 2017-09-13 11:05:09
* @Last Modified by: tao.zhu
* @Last Modified time: 2017-09-13 11:05:09
* @Description:radio
* @dependencies:
* @File Type:
* @Pmo: DUJIATTS-1867
*/

/**
 * @model(v-model) 默认:value @input, 这里改了一下。
 * @model prop radioValue
 * @model event change
 * @props name 为了群组一套radio元素，由父层设置（此组件为单个radio,所以由上次设置，以后可以增加radio-group组件).
 * @props value 此radio的值
 * @props radioValue radio群组的选中值。
 */
let __string =require("./q-radio.string");

let qRadio = Vue.component("q-radio", {
  template: __string,
  model:{
    prop: "radioValue",
    event: "change"
  },
  props: ["name", "value", "radioValue"],
  computed: {
    "checked":function (){
      return this.radioValue === this.value;
    }
  },
  methods: {
    cli (eve){
      this.$emit("emit", this.value);
    }

  }
  
});

export {qRadio}; 
module.exports = qRadio; 