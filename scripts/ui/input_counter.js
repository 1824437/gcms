/**
 * --------------------------------------------------------------------------- *
 *
 * @Project: package_b2c_admin
 * @FileName: 
 * @Dependence: jquery
 * @Description: 文本框计数
 * @CreatedBy: t.z
 * @CreateDate: 2017-05-18
 * @LastModifiedBy: 
 * @LastModifiedDate: 
 *
 * --------------------------------------------------------------------------- *
 注意：只统计字数，不做校验，请用别的方式验证，当前字数可以在data-count里面获得。
 使用方法
 在dom上data一个json串，如
<input type="text" class="in" data-imax="15" data-iexact="true" data-isql=".next('.abc')">
  imax:必填，最大值，不填的话，只计数，不标红
  isql:必填 ，这个牛B了，以当前输入框的dom为参照，用jquery语法查找到字数显示的dom。

  imin：非必填，最小值，默认为0 //未开发，你想要用，你，你，你来补下
  icolor:超限标红的颜色，非必填，默认红色,
  iexact:为"true"时，汉字算2个字符
  

占用dom上的一个data属性"counter",作为绑定生成的实例,如要拿到当前长度
$(".in").data("counter").getLength() //输出当前字串长度

html
<input type="text" data-title="接驳备注" data-jvalidator-pattern="transhipDesc" 
class="form-txtctr js-tranship-desc" data-imax="15" 
data-isql=".closest('[data-node=transhipDesc]').find('[data-node=counterTip]')" 
maxlength=15 placeholder="">
 */

let CounterGroup = []; //计数器记录
class InputCounter{

  constructor(config){
    let {$dom,inputMax = 0,inputMin = 0,showElementSql,exact = false,color = "red"} = config;
    this.$dom = $dom;
    this.color = color;
    this.min = inputMin;
    this.max = inputMax;
    this.exact = exact;
    this.$CounterDom = new Function("$dom","return $dom" + showElementSql)(this.$dom);
    this.render();
    this.bindEvent();
    this.$dom.data("counter",this);
    CounterGroup.push(this);
  };

  render(){
    let {color,max,current} = this.getData();
    this.$CounterDom.html(`<span style="color:${color}">${current}</span>/<span>${max}</span>`);
  };
  getData(){
    let {color,max,exact,$dom} = this,
      current = exact ? $.trim($dom.val()).replace(/[^\x00-\xff]/g, '¡¸').length : $.trim($dom.val()).length;
      if(current <= max){
        color = "";
      }
    return {color,max,current};
  };
  getLength(){
    let {$dom,exact} = this;
    return exact ? $.trim($dom.val()).replace(/[^\x00-\xff]/g, '¡¸').length : $.trim($dom.val()).length;
  };
  bindEvent(){
    this.$dom.bind("input paste",function(){
      $(this).data("counter").render();
    })
  };

};

let inputCounter = {
  create($dom){
    if(!$ || !jQuery){
      console && console.err("InputCounter模块依赖jQuery");
      return;
    };
    $dom.each(function(){
      let $this = $(this),
        inputMin = parseInt($this.data("imin")),
        inputMax = parseInt($this.data("imax")),
        exact = $this.data("iexact"),
        color = $this.data("icolor"),
        showElementSql = $this.data("isql");
      showElementSql && new InputCounter({$dom : $this,inputMax,inputMin,showElementSql,exact,color});
    })
  },
  upDateStatus(){
    $.each(CounterGroup,function(i,n){
      n.render();
    })
  }
};


export {inputCounter};
module.exports = inputCounter;