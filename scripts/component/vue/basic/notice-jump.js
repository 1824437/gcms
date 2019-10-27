/*
* @Author: zhutao
* @Date: 2017-11-12 19:32:38
* @Last Modified by: zhutao
* @Last Modified time: 2017-11-13 15:23:30
* @Description:
* @dependencies:
* @File Type:
* @Pmo:
*/
let  TIME_PROCESS = null; //对列中在运行的计时方法的ID
const __string = require("./notice-jump.string");

/**
 * 隔多少秒，提示固定信息，到时跳转，未来：隔多少秒干什么
 * @type {[type]}
 */
const noticeJump = Vue.component("notice-jump", {
  template: __string,
  data(){
    return {
      start: null
    };
  },
  props: [
    "time", //倒计时多少秒
    "url"
  ],
  created (){
    let time = this.$props.time;
    if (isNaN(time) || time < 3){
      this.$props.time = 3;
    }
  },
  mounted (){
    this.start = new Date();
    this.timekeeping();
  },

  methods: {
    timekeeping (){
      TIME_PROCESS = setInterval(this.isFinished, 1000);
    },
    isFinished (){
      if (this.time <= 0){
        clearInterval(TIME_PROCESS);
       window.location.href = this.url;
        return;
      }
      this.time -= 1;
    }
  }
});