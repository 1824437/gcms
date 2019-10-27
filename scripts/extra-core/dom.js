const extraDomMethods = {};
{


  // resize、scroll等频繁触发页面回流的操作要进行函数节流
  extraDomMethods.throttle = (fn, delay, mustRunDelay, args) => {
    var timer = null;
    var t_start;
    return function () {
        var context = this, t_curr = +new Date();
        clearTimeout(timer);
        if (!t_start) {
            t_start = t_curr;
        }
        if (t_curr - t_start >= mustRunDelay) {
            fn.apply(context, args);
            t_start = t_curr;
        } else {
            timer = setTimeout(function () {
                fn.apply(context, args);
            }, delay);
        }
    };
  };
  /**
   * 检查浏览器及版本,获取浏览器真实品牌及版本，但不利调试，所以业务性判断浏览器不适合使用
   * @return 当未定义exp时，返回浏览器级版本号 IE_,Edge_,Firefox_,Safari_,Chrome_
   * @return 当定义了exp时，返回boolean
   */
  extraDomMethods.browser = (exp) => {
    // todo
    let _functionString = "[native code]";
    let browser = "";
    
    if (window.xDomainRequest 
        && window.xDomainRequest.toString()
          .indexOf(_functionString) !== -1
    ){
      //判断出是IE8或9
    } else if (window.XMLHttpRequest === undefined){
      browser = "IE6";
    }

    if (exp === undefined){
      return browser;
    } else {

    }

  };
  extraDomMethods.css = dom => {
    return getComputedStyle ? getComputedStyle(dom, null) : dom.currentStyle;
  };
  /**
   * 获得元素或body下最大的zIndex + 1
   * @param  {dom} dom [description]
   * @return {number}
   */
  extraDomMethods.getMaxZIndex = (dom) => {
    if (dom !== undefined && dom.nodeType !== 1){
      console.log(`${dom}并非dom。`);
      return;
    }
    let zIndex = 10;
    let childNodes = (dom || document.body).childNodes;
    for (let ind = 0, len = childNodes.length; ind < len; ind++){
      let childNode = childNodes[ind];

      if (childNode.nodeType === 1){
        zIndex = Math.max(zIndex, ~~ childNode.style.zIndex);
      }
    }
    return ++ zIndex;
  };
  /**
   * [windowInfo description]
   * @return {[type]} [description]
   */
  extraDomMethods.windowInfo =() => {
    let _win = window,
        _doc = document,
        _root = _doc.documentElement,
        _body = _doc.body;

    let clientWidth = _root.clientWidth || _body.clientWidth,
        clientHeight = _root.clientHeight || _body.clientHeight,
        scrollTop = Math.max(_win.pageYOffset || 0, _root.scrollTop, _body.scrollTop),//文档向下滚动的距离
        scrollLeft = Math.max(_win.pageXOffset || 0, _root.scrollLeft, _body.scrollLeft);//文档向右滚动的距离

    return {clientWidth, clientHeight, scrollTop, scrollLeft};
  };
  /**
   * 获取元素的高度和宽度
   * @param {dom} dom 原生dom
   * @return {obj} {width: "", height: ""}
   */
  extraDomMethods.size = (node) => {
    let size = {};
    if (node.getBoundingClientRect/*ie8+*/) {
      size = node.getBoundingClientRect(); 
    }
    let {width, height, left, top, right, bottom} = size;
    if (width === undefined){
      width = right - left;
    }
    if(height === undefined){
      height = bottom - top;
    }
    return {width, height};
  };
  /**
   * 获取元素的边框和外边距
   * @param {node} dom 原生dom
   * @param {boolean} isboxSizing 是否考虑boxSizings样式，默认是考虑的。考虑的情况下，边框永远是0
   * @return {obj} {border: [,,,], margin: [,,,]} 数组顺序 上右下左。
   */
  extraDomMethods.getBorderMagin = (node, isboxSizing = true) => {
    let res = {
      border: [0,0,0,0],
      margin: [0,0,0,0]
    };
    if (node !== undefined && node.nodeType !== 1){
      console.log(`${node}并非dom。`);
      return res;
    }

    let domCss = extraDomMethods.css(node);
    if (isboxSizing !== true){
      res.border = [
        parseInt(domCss.borderTopWidth) || 0,
        parseInt(domCss.borderRightWidth) || 0,
        parseInt(domCss.borderBottomWidth) || 0,
        parseInt(domCss.borderLeftWidth) || 0
      ];
    }
    res.margin = [
        parseInt(domCss.marginTop) || 0,
        parseInt(domCss.marginRight) || 0,
        parseInt(domCss.marginBottom) || 0,
        parseInt(domCss.marginLeft) || 0
      ];

    return res;
  };
  /**
   * 获取元素的高度和宽度，包括边框和外边距
   * @param {node} dom 原生dom
   * @param {boolean} isboxSizing 是否考虑boxSizings样式，默认是考虑的。考虑的情况下，边框永远是0
   * @return {obj} {width: "", height: ""}
   */
  extraDomMethods.outSize = (node, isboxSizing = true) => {
    let {border, margin} = extraDomMethods.getBorderMagin(node, isboxSizing);
    let {width, height} = extraDomMethods.size(node);
     width += border[1] + border[3] + margin[1] + margin[3];
     height += border[0] + border[2] + margin[0] + margin[2];

    return {width, height};
  };
  /**
   * 元素距离页面的距离，用于窗口滚动定位到此元素，等等
   * @param  {[type]} node [description]
   * @return {[type]}      [description]
   */
  extraDomMethods.offset = (node) => {
    let box = {
      top: 0,
      left: 0
    };
    let _doc = node.ownerDocument, //document对象
        _body = _doc.body,
        _root = _doc.documentElement, //<html> dom.
        _win = _doc.defaultView || _doc.parentWindow/*ie8-*/; //文档对象所关联的window
    //getBoundingClientRect 是元素到视口的相关位置信息
    if (node.getBoundingClientRect/*ie8+*/) {
      box = node.getBoundingClientRect(); 
    }
    //top, left 是node的边框（如果有的话）到视口上，左的距离。边框哦。
    //ie8-无法获取width，height.
    let {width, height, left, top, right, bottom} = box;

    /*clientTop,clientLeft并没有什么意义, 但avalon147 使用的是reviseTop，reviseLeft 实测是错误的 */
    let clientTop = _root.clientTop || _body.clientTop; //html || body的上边框
    let clientLeft = _root.clientLeft || _body.clientLeft;//html || body的左边框

    let scrollTop = Math.max(_win.pageYOffset || 0, _root.scrollTop, _body.scrollTop);//文档向下滚动的距离
    let scrollLeft = Math.max(_win.pageXOffset || 0, _root.scrollLeft, _body.scrollLeft);//文档向下滚动的距离

    top = top + scrollTop;
    left = left + scrollLeft;

    let reviseTop = top - clientTop;
    let reviseLeft = left - clientLeft;
    
    // 测试代码
    // let list = "";
    // list += "rect.top   : " + top + "<br>";
    // list += "rect.bottom: " + bottom + "<br>";
    // list += "rect.height: " + height + "<br>";

    // list += "rect.left  : " + left + "<br>";
    // list += "rect.right : " + right + "<br>";
    // list += "rect.width : " + width + "<br>";
    // list += "rect.clientTop : " + clientTop + "<br>";
    // list += "rect.scrollTop : " + scrollTop + "<br>";

    return {/*list,*/ top, left/*, reviseTop, reviseLeft*/};

  }

};
export default extraDomMethods;
module.exports = extraDomMethods;