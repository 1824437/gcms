/*
* @Author: tao.zhu
* @Date: 2017-09-13 11:05:09
* @Last Modified by: tao.zhu
* @Last Modified time: 2017-09-13 11:05:09
* @Description:简单的富文本框
* @dependencies:
* @File Type:
* @Pmo: DUJIATTS-1867
*/

let __string =require("./simple-editor.string");
const SimpleEditor = require('common/simpleEditor/module/simpleEditor.js');

/**
 * simpleEditor 简单的富文本框
 * @props json 默认值
 * @props opts 富文本插件的动态参数
 * @Events emit 动态往上传递变更过的值。
 *
 * @template eg
 <simple-editor :json="feature" @emit="change"></simple-editor>
 */
const galleryOption = {
  imageGallery: {
          enabled: true,
          initFunc: function(editor) {
              QNR.event.bind('layer-close', function(e, result) {
                  if (result.elem) {
                      return;
                  }
                  //var currentEditor = this.$refs.se_description.simpleEditor;
                  if (currentEditor && currentEditor === editor) {
                      currentEditor.$container.trigger('imageGalleryInsertEvent', result);
                  }
              });
              editor.btn.$imageGallery.on('click', function() {
                  window.currentSimpleEditorObj = editor;
                  QNR.event.trigger('open-layer', {
                      max: -1,
                      showQunar: true,
                      params: {
                          type: 'baseinfo',
                          arrivals: ''
                      }
                  });
              });
          }
      }
};
let simpleEditor = Vue.component("simple-editor", {
  template: __string,
  props: [
    "json",
    "opts",
    "name"
  ],
  data (){
    return {
      simpleEditor: null
    };
  },
  beforeMount (){
  },
  mounted(){
    let self = this;
    let opts = this.opts ? JSON.parse(JSON.stringify(this.opts)) : {};
    delete opts.contentChangeCallback;

    let useImageGallery = opts.useImageGallery;
    delete opts.useImageGallery;
    this.simpleEditor = new SimpleEditor(self.$el, this.name, Object.assign(
      useImageGallery 
      ? {
          imageGallery: {
            enabled: true,
            initFunc: function(editor) {
                QNR.event.bind('layer-close', function(e, result) {
                    if (result.elem) {
                        return;
                    }
                    var currentEditor = window.currentSimpleEditorObj;
                    if (currentEditor && currentEditor === editor) {
                      editor.$container.trigger('imageGalleryInsertEvent', result);
                    }
                });
                editor.btn.$imageGallery.on('click', function() {
                    window.currentSimpleEditorObj = editor;
                    QNR.event.trigger('open-layer', {
                        max: -1,
                        showQunar: true,
                        params: {
                            type: 'baseinfo',
                            arrivals: ''
                        }
                    });
                });
            }
        }
      }
      : {}, opts,

     {
      contentChangeCallback: function (editor, data){
       self.$emit("emit", data === "[]" ? "" : data);
      },
      onFocus: function (){
        self.$emit("____close_validate");
      }
    }));
  }
});
