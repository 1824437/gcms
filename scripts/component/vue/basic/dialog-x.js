const Dom = require("components/tools/dom.js");
const __string = require("./dialog-x.string");

/**
 * 弹窗
 * @props {object} options 弹窗选项
 * @props {boolean} useMask 是否使用遮罩, 默认使用
 * @props {boolean} title 标题文本
 * @props {boolean} width 宽度
 * @props {boolean} showClose 是否显示关闭按钮 ,默认显示 
 * @props {boolean} model 可以指定为alert模式 
 * @props {boolean} centerButton booter的按钮是否居中，默认false,不居中。
 * @props {boolean} confirmButtonStyle 给确定按钮增加样式
 * model list:
 * alert, 无取消按钮
 * must, 无取消及关闭按钮
 * wait, 无任何按钮，由插槽的功能操作，一定要注意必须要有操作，否则就假死了。
 * @props {boolean} onCancel 取消回调
 * @props {boolean} onConfirm 确定回调
 * @props {boolean} 
 * @return {[type]}            [description]
 */
const dialogX = Vue.component("dialog-x", {
  template: __string,
  data (){
    return {
      //dialog容器样式
      containerCss: {
        visibility: "hidden",
        position: "static",
        width: "0px",
        height: "0px",
        zIndex: 0,
        top: 0,
        left: 0,
        overflow: "auto"
      },
      //遮罩样式
      maskCss: {
        position: "absolute",
        top: 0, 
        left: 0, 
        display: "none",
        background: "#000",
        opacity: 0.6,
        width: "100%",
        height: "100%"
      },
      //dialog 框
      blockCss: {
        outline: "6px solid rgba(0,0,0,.3)",
        width: this.width + "px",
        position: "absolute",
        boxSizing: "border-box",
        top: 0,
        left: 0
      }
    };
  },

  props:{
    //slot所需数据由这个属性传递
    "parcel": {
      default: {}
    },

    //以下都是dialog自身的参属，详情见头部
    "useMask": {
      default: true
    },
    "width": {
      default: 500
    },
    "title": {
      default: "提示"
    },
    "model": {
      default: undefined
    },
    "showClose": {
      default: true
    },
    "onConfirm": {
      "type": null
    },
    "centerButton": {
      default: false
    },
    confirmButtonStyle: {
      default: {}
    }
  },
  computed: {
    //是否显示关闭按钮
    _showCloseBtn (){
      if (this.model === "must"){
        return false;
      }
      return true;
    },
    //是否显示取消按钮
    _showCancelBtn (){
      if (this.model === "must" || this.model === "alert"){
        return false;
      };
      return true;
    },
    //是否显示按钮
    _showConfirmBtn (){
      if (this.model === "wait"){
        return false;
      };
      return true;
    }
  },
  mounted (){
    this.____ = {};
    this.____.adjustDialog = Dom.throttle(this.adjustDialog, 50, 500);
    window.addEventListener("resize", this.____.adjustDialog, false);
  },
  beforeDestroy (){
    window.removeEventListenter("resize", this.____.adjustDialog);
  },
  methods: {
    confirm (){
      if (this.onConfirm){
        let _async = this.onConfirm();
        if (_async && _async.then){
          _async.then(()=>{
            //nothing; 预留异步后可能要干啥。
          });
        }
      } else {
        this.hide();
      }
    },
    cancel (){
      if (this.onCancel){
        this.cancel();
      } else {
        this.hide();
      }
    },
    close (){
      this.hide();
    },
    
    hide (){
      this.containerCss.visibility = "hidden";
      document.documentElement.style.overflow = "auto";
    },
    show (){
      this.containerCss.visibility = "visible";
      this.adjustDialog();
      
    },
    adjustDialog (){
      if (this.containerCss.visibility === "hidden"){
        return;
      }

      let _unit = "px";
      //获取视口
      let {clientWidth, clientHeight, scrollTop, scrollLeft} = Dom.windowInfo();

      document.documentElement.style.overflow = "hidden";

      this.containerCss.width = clientWidth + _unit;
      this.containerCss.height = clientHeight + _unit;

      if (Dom.browser() === "IE6"){
        this.containerCss.position = "absolute";
        this.containerCss.top = scrollTop + _unit;
        this.containerCss.left = scrollLeft + _unit;
      } else {
        this.containerCss.position = "fixed";
        this.containerCss.top = "0px";
        this.containerCss.left = "0px";
      }
      let zIndex = Dom.getMaxZIndex();
      this.containerCss.zIndex = zIndex;
      
      
      //内容块设置
      let {width, height} = Dom.outSize(this.$refs.body);
      if (this.useMask){
        this.maskCss.display = "block";
        this.maskCss.height = `${Math.max(height,clientHeight)}px`;
      }

      if (height >= clientHeight){
        this.blockCss.top = 0;
      } else {
       this.blockCss.top = (clientHeight - height)/2 + "px";
      }

      if (width >= clientWidth){
        this.blockCss.left = 0;
      } else {
       this.blockCss.left = (clientWidth - width)/2 + scrollLeft + "px";
      }

    },
    hide (){
      this.containerCss.visibility = "hidden";
    }


  }
});

export default dialogX;
module.exports = dialogX;