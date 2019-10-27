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
 * 
 * @porps value 动态初始值
 * @porps list //option列表
 * @return {Object} 一个数据项，包括 label, value
 * @example
 * <q-select 
    v-model="schedule.travelType" 
    @emit="changeTravelType" 
    :list="isFreeTimeUL">
    </q-select>
 */
let __string =require("./q-select.string");

let qSelect = Vue.component("q-select", {
  template: __string,
  props: ["value", "list"],
  methods: {
    change (eve){
      let item = this.list[eve.target.selectedIndex];
      this.$emit("emit", item);
    },
    click (eve){
      this.$emit("____close_validate");
    }
  }
  
});

export {qSelect}; 
module.exports = qSelect; 