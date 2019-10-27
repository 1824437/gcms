/*
* @Author: tao.zhu
* @Date: 2017-08-01
* @Last Modified by: tao.zhu
* @Last Modified time: 2017-08-03
* @Description: 
* @dependencies: 
* @File Type: module
*/
const _ = x => x;
const FS = require("fs");
const Path = require("path");


/**
 * 循环目录
 * @param  {String}   path      需在循环的路径
 * @param  {Function} forEachCb 每个节点循环后想干点啥                            
 * @param  {Function} cb        最后循环完了想干点啥
 * @return cb()
 */
const forEachDirectory = ({depth = 1, path, forEachCb = _, cb = _} = config) => {
  // {array} 路径下的文件及目录
  let childs = [];
  // 校验路径是否存在。
  try {
   var dirState = FS.statSync(path); 
  } catch (e){
    console.error("[路径异常] " + path + " " + new Error(e).message);
    return;
  }
  //目录
  if (dirState.isDirectory()){
    let childs = FS.readdirSync(path);
    
    forEachCb({path});
    depth !== 0 && childs.forEach((mem, index) => {
      forEachDirectory({
        depth,
        path : path + "/" + mem,
        forEachCb,
        cb: _
      });
    });
  }
  
  return cb();
};

/**
 * 同步读文件
 * @param  {regexp}  ext 读哪些扩展名
 * @param  {Function}  cb 读完做啥
 * @return cb()
 */
const readFile = ({path, ext = /.*/g, cb = _} = config) => {

  return cb();
};

module.exports = {forEachDirectory, readFile};