/*
* @Author: zhutao
* @Date: 2017-11-15 13:57:49
* @Last Modified by: zhutao
* @Last Modified time: 2017-11-15 15:52:15
* @Description:web常用函数
* @dependencies:
* @File Type:
* @Pmo:
*/
let console;
{
  if (window.console && window.console.log){
    console = window.console;
  } else {
    console = {log: _=>_};
  }
}

export default {
  /**
   * 获取url中的参数，同名参数取第一个。
   * @param  {string} url 查找的字串，默认的locaion.
   * @param  {string} name 查找的字段名。
   * @return {string|null} 查找到了参数值则返回值，否则返回null
   */
  getParam ({url = window.location.href, name = 0}){
    if (name.constructor !== String){
      console.log("请正确传入参数名");
      return;
    }
    const _get = _name => new RegExp(`\\b${_name}=(.*?)(?=(&|#|$))`);
    let result = url.match(_get(name));
    if (result){
      return result[1];
    } else {
      return null;
    }
  }
};
