/*
* @Author: tao.zhu
* @Date: 2017-09-13 11:05:09
* @Last Modified by: tao.zhu
* @Last Modified time: 2017-09-13 11:05:09
* @Description:小手机预览框
* @dependencies:
* @File Type:
* @Pmo: DUJIATTS-1867
*/

/**
 *  message 标准格式
    JSON.stringify({
      "name": "",   //来信窗口的名称
      "origin": "", //窗口的location.origin
      "type": "",   //数据弄个数据类型，特别是数据比较多的时候，由这个属性来判断做何种处理
      "message": "" //数据本身
    })
 */

const __string = require("./preview-phone.string");


const previewPhone = Vue.component("preview-phone", {
  template: __string,
  data (){
    return {
      isLoad: !!window.postMessage,
      random: new Date() - 0,
      previewPhoneOrigin: null
    };
  },
  props: ["parcel", "src"],
  watch: {
      parcel: {
        handler (v, ov){
          this.previewPhoneOrigin && this.sendMessage("previewPhone");
        },
        deep: true
      }
    },
  mounted (){
    window.addEventListener("message", data => {
      if (data && data.data && data.data.constructor === String){
        try {
          let {name, type, origin, data: message} = JSON.parse(data.data);
          this.receiveMessage({name, message, type, origin});
        } catch (ex){
        }
      }
    }, false);
  },

  methods: {
    /**
     * 接收消息分类并处理
     * @param //请看头部注释
     * @return 
     */
    receiveMessage ({name, origin, type, message}){
      if (!origin){
        console.log("小心哦，没有消息来源哦。", message);
      }
      switch (name){
        //行程数据预览小手机页面
        case "previewPhone":
          //页面已准备好，可以开撩
          if (message.isLoad){
            this.previewPhoneOrigin = origin;
            this.sendMessage("previewPhone");
          }
        break;
        default:
          console.log("咦，发生了什么？这是个啥 ->", message);
        break;
      }
    },
    /**
     * 发消息分类
     * @param  {String} originName 组件内data上定义的一个key, value为窗口的origin.
     * @return {[type]}            [description]
     */
    sendMessage (originName){
      //窗口未准备好
      if (this[originName] === null){
        return;
      }
      let message = {};
      switch (originName){
        case "previewPhone":
          message = JSON.stringify({
            name: "transparentSchedule",
            origin: window.location.origin,
            data: this.parcel
          });
          this.$refs.frame.contentWindow.postMessage(
            message,
            this["previewPhoneOrigin"]
          );
        break;
        default:
          console.log("搭讪先要有对象！", originName);
        break;
      }
    }
  }
});

export default previewPhone;
module.exports = previewPhone;