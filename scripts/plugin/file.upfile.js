/*
* @Author: tao.zhu
* @Date: 2017-07-19
* @Last Modified by: tao.zhu
* @Last Modified time: 2017-08-04
* @Description: 文件上传
* @dependencies: file API
* @File Type: module
* @Pmo: DUJIATTS-1878
*/

/**
   class Uploader constructor
   文件上传类
 *@param {[object]} config 配置参数
 *    @member dom  { element } 文件上传element
 *    @member fileType { array } 判断文件类型是否正确，mime格式
 *    @member ext { array } 有些文件拿不到类型，需要用后缀辅助，如：[".xls"]
 *    @member fileTypeCn { string } 中文标识文件类型，出错时显示
 *    @member fileSize { number } 文件最大尺寸
 *    @member onSelected { function } 选择成功后的回调
 *        @param { object } info 返回的相关信息                    
 *    @member onSelectedError { function } 选择的文件不符约定时的回调
 *        @param { object } errInfo 返回的错误信息
 *    @member onRead { function } 能预览的文件读最后
 *        @param { object } loadInfo 返回的文件信息
 */
const _getExt = str => {
  let ind = str.lastIndexOf(".");
  return ind === -1 ? "" : str.substr(ind);
}
class Uploader {
  constructor (config){
    this.config = config;
    this.files = [];
    this.bindEvent();
  }

  bindEvent(){
    let {dom} = this.config;
    dom.addEventListener("change", eve => {
      this.handle(eve);
    }, false);
  }

  handle (eve){
    if (
      !window.File 
      || !window.FileReader 
      || !window.FileList){
      console && console.log && console.log("请使用高版本浏览器上传文件");
      return;
    }
    let {
      dom,
      onSelected = x => x,
      onSelectedError = x => x,
    } = this.config,
    vm = avalon.vmodels.page,
    validity = this.validate();

    validity.validity
    ? onSelected(validity)
    : onSelectedError(validity);
  }
  //校验文件的合法性
  validate (){
    let validity = false, 
    info = "",    //文件异常信息
    name = "",    //文件名
    {
      dom,
      fileType,
      ext = [],
      fileSize,
      fileTypeCn
    } = this.config;
    //取消文件
    if (!dom.files.length){
      validity = true;

      return {validity, name};
    }

    let file = dom.files[0];
    //文件类型不符
    if (fileType.indexOf(file.type) < 0){
      validity = false;
      info = `文件类型必须为${fileTypeCn}`;

      if (ext === undefined 
      || !ext.length 
      || ext.indexOf(_getExt(file.name)) === -1
      ){
        return {validity, info};
      }
      
    }
    //文件尺寸不符
    if (file.size > fileSize){
      let allowable = parseInt(fileSize / 1024),
          actual = parseInt(file.size / 1024);

      validity = false;
      info = `超出了文件尺寸限制；文件文件限制大小为：${allowable}KB，文件实际大小为：${actual}KB`;

      return {validity, info}; 
    }
    this.files[0] = file;
    validity = true;
    name = file.name;
    //图像文件预览
    if (file.type.indexOf('image/') !== -1){
      this.imgPreview();
    }
    
    return {validity, name};
  }
  imgPreview (){
    let fileSource = new FileReader(),
    {
      onRead = x => x
    } = this.config;

    fileSource.addEventListener("load", loadInfo => {
      onRead({loadInfo});
    }, false);
    fileSource.readAsDataURL(this.files[0]);
  }
}

const uploader = config => new Uploader(config);

export default uploader;
module.exports = uploader;
