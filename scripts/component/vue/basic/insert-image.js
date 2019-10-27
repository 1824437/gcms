/*
* @Author: tao.zhu
* @Date: 2017-09-13 11:05:09
 * @Last Modified by: tao.zhu
 * @Last Modified time: 2018-02-01 18:17:32
* @Description:上传图片按钮
* @dependencies:
* @File Type:
* @Pmo: DUJIATTS-1867
*/

//上传的静态配置

const uploadConfig = require("components/tools/upload-config.js");

//文件选择，校验
const UpLoader = require("common/fileLoader/fileLoader.js");
//上传
const fileTransfer = require("common/fileLoader/fileTransfer.js");

const __string = require("./insert-image.string");

//对服务器返回的url进行处理
// const _parseResultImageUrl = (url)=> {
//   return "//img1.qunarzz.com" + url;
// };
const _parseResultImageUrl = (url)=> {

  return url;
};
/**
 *
 * @events emit //自定义事件，必须的，上传回调会触发。
 * 
 */
const insertImage = Vue.component("insert-image", {
  template: __string,
  props: [
  "imageLibraryParam", //获得图库的参数
  "uploadType", //必须的, 映射关系在upload-config.js内。如 "scheduleSightImage"
  "extraApiParam" //上传接口需要的动态参数
  ],
  data (){
    return {
      showSuccessTip: false,
      showErrorTip: false,
      successInfo: "上传成功",
      errorInfo: "文件类型必须为图片",
    };
  },
  mounted(){
    let {fileType, api, data} = uploadConfig[this.uploadType];

    let selecter = UpLoader({
      dom: this.$refs.inputFile,
      fileType: fileType,
      //ext:
      fileTypeCn: "图片",
      fileSize: 1024 * 1024 * 2,
      onSelected: info => {
        fileTransfer({
          api: api,
          data: Object.assign({}, this.extraApiParam, data),
          files: selecter.files[0],
          onSuccess: (res) => {
            if (res && res.ret){
              this.showErrorTip = false;
              this.showSuccessTip = true;
              this.hideTip();
              this.$emit("emit", _parseResultImageUrl(res.imgUrl));
            } else {
              this.errorInfo = res.errmsg;
              this.showErrorTip = true;
              this.hideTip();
            }
          },
          onFail: (ex) => {
            throw ex;
          }
        });
      },
      onSelectedError: errorInfo => {
        this.errorInfo = errorInfo.info;
        this.showErrorTip = true;
        this.hideTip();
      }
    });

    QNR.event.bind('layer-close', (e, result) => {
      if (window.____handleThatOpenedTheImage !== this){
        return;
      }
      if (result.data.length){
        let urls = [];
        result.data.forEach((el, ind) => {
          if (el.id){
            urls.push(_parseResultImageUrl(el.id));
          }
        });
        this.$emit("emit", urls);
      }
      });
  },
  methods: {
    hideTip(){
      setTimeout(() => {
        this.showErrorTip = false;
        this.showSuccessTip = false;
      }, 2000);
    },
    //上传按钮分发到真正的input file
    upload (){
      this.$emit("____close_validate");
      let evt = new MouseEvent("click", {
        bubbles: false,
        cancelable: true,
        view: window
      });
      this.$refs.inputFile.dispatchEvent(evt);
    }
  }
});


