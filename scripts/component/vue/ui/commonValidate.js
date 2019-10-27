/*
* @Author: tao.zhu
* @Date: 2017-09-13 11:05:09
* @Last Modified by: tao.zhu
* @Last Modified time: 2017-09-13 11:05:09
* @Description: 这是个基类,校验块都需要使用。
* 注意是独立模块。
* 主要是定义了操作按钮的功能，如，删除，上移，下移等。
* @dependencies:
* @File Type:
* @Pmo: DUJIATTS-1867
*/

/**
 * 如果组件需要验证，必须满足3个前置条件。
 * 1. 在组件的 data里面需要有 
 * @data c____validateOptions {array} 需要校验的项放在里面，如 ["time"]
 * 2. 在组件的 data里面需要有总控开关，如
 * @data c_time {boolean} 默认值为false, 默认不校验，"c_"是前缀（固定的）， time是c____validateOptions其中的一项。
 * 3. 在computed里要有v_time的计算项
 * @computed v_time {function} 计算校验结果 "v_"是前缀（固定的），time是c____validateOptions其中的一项。
 *
 * 在模版string里如何使用？
 * todo
 */

const validate = {

  methods: {
    ____reset_all_validates (){
      console.log("mixin");

      let opts = this.c____validateOptions;
      if (opts.constructor === Array){
        opts.forEach((el, ind) => {
          this["c_" + el] = false;
        });
      }
    },
    ____close_validate (validateName){
      this["c_" + validateName] = false;
    },
    ____validates (){
      //校验
      let opts = this.c____validateOptions;
      
      if (opts.constructor !== Array){
        console.log("c____validateOptions格式错误");
        return [];
      }
      let res = [];
      let prefix_c = "c_", prefix_v = "v_";

      opts.forEach((el, ind) => {
        //isShowHidClass为true 说明验证通过了
        if (this[prefix_v + el]){
          let {isPass} = this[prefix_v + el];
          this[prefix_c + el] = true;
          res.push(isPass);
        } else {
          console.log("校验项：'"+ el + "'在computed中未定义");
        }
        
      });

      return res;
    },

  }
};
export default validate;
module.exports = validate;