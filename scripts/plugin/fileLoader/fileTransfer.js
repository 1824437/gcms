/*
* @Author: tao.zhu
* @Date: 2017-07-19
* @Last Modified by: tao.zhu
* @Last Modified time: 2017-11-10 15:33:03
* @Description: 文件上传
* @dependencies: file API
* @File Type: module
* @Pmo: DUJIATTS-1878
*/

/**
   class Uploader constructor
   文件上传类
 *@param {[object]} config 配置参数
  isForm,
  api,
  data,
  files,
  onSuccess,
  onFail
*/
const {Fetch, Jsonp} = require("projectCommon/fetch.js");

class FileTransfer {
  constructor (config){
    this.config = config;
    this.fileKey = config.fileKey || "file";
    this.transfer();
  }
  transfer (){
    let {
      api,
      data,
      files,
      onSuccess,
      onFail
    } = this.config;
    let datas = new FormData();
    //api += "?sourceType=4&ie=false";
    for (let key in data){
      datas.append(key, data[key]);
    }
    datas.append(this.fileKey, files);
    Fetch({
      isForm: true,
      header: {
        'Accept': '*/*'
        //加这个在chrome里不好使。
        //'Content-Type': 'multipart/form-data; boundary=----qunarFormBoundaryDbiB0Bk8M7Q7GUew'
      },
      type: "post",
      api,
      data: datas
    }).then(data => {
      onSuccess(data);
    }).catch(ex => {
      onFail(ex);
    });
  }
}

const fileTransfer = config => new FileTransfer(config);

export default fileTransfer;
module.exports = fileTransfer;
