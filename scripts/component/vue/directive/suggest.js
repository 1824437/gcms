/*
* @Author: tao.zhu
* @Date: 2017-09-13 11:05:09
* @Last Modified by: tao.zhu
* @Last Modified time: 2017-09-13 11:05:09
* @Description: suggest
* @dependencies:
* @File Type:
* @Pmo: DUJIATTS-1867
*/

/**
 * @binding {Object}
 *        extraData () //需要传递的额外数据,必须是函数以达到数据是动态的
 *        readerAfter() //列表数据获得后callback
 *        ajax {api,dataType,cache} //非必须
 *        select() //选择后调用的方法。
 *        
 */
require("common/jquery.qsuggest.js");

Vue.directive("suggest", {
  bind (el, binding){
    let self = this;
    let {value: {extraData, select, ajax, onReaderAfter = null} } = binding;
    let $el = $(el);
    
    $el.data("handle", select);
    $el.qsuggest({
      ajax,
      extraData,
      reader (resp){
        let result = [],
        list = resp.data;
        if (resp && list){
          result = list;
        }
        onReaderAfter && onReaderAfter(result);
        return result;
      },
      on: {
        "q-suggest-show" (){},
        "q-suggest-user-action" (a, b, c){
          let $input = $(a.target);
          let handle = $input.data("handle");
          handle(c);
        },
        "q-suggest-hide" (){}
      }
    });
  }
});