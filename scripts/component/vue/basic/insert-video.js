/*
* @Author: tao.zhu
* @Date: 2017-09-13 11:05:09
* @Last Modified by: tao.zhu
* @Last Modified time: 2017-09-13 11:05:09
* @Description:插入视频
* @dependencies:
* @File Type:
* @Pmo: DUJIATTS-1867
*/


const __string = require("./insert-video.string");
const SelectVideoDlg = require("scriptRoot/business/utils/select_video/select_video.js");

/**
 *
 * @events emit //自定义事件，必须的，上传回调会触发。
 * 
 */
const insertVideo = Vue.component("insert-video", {
  template: __string,
  props: [
    "covers",
    "videos"
  ],

  methods: {
    //上传按钮分发到真正的input file
    add (){
      this.$emit("____close_validate");
      SelectVideoDlg(data => {
        let {videoId, cover} = data;
        this.covers.splice(0, 1, cover);
        this.videos.splice(0, 1, videoId);
        this.$emit("changeTourVideos", data);
      });
    },

  }
});



