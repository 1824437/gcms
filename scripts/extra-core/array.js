const polyfillOfArray = {
  /**
   * 移动数组元素
   * 
   * @param  {Array} arr         操作数组
   * @param  {number} originalIndex 原下标
   * @param  {number} destIndex   目标下标
   * @return {[type]}
   */
  moveElementOfArray: (arr, originalIndex, destIndex) => {
    //1.将目标下标的元素替换成原下标,arrayOfRemovedElements为被替换掉的元素生成的数组。
    let arrayOfRemovedElements = arr.splice(destIndex, 1, arr[originalIndex]);
    //原下标的元素重新赋值
    arr[originalIndex] = arrayOfRemovedElements[0];
    
    return arr;
  }
};

Array.prototype.unique2 = function(prop){
  var n = {},r=[];
  for(var i = 0; i < this.length; i++)
  {
    if(prop){
      if (!n[this[i][prop]]) {
        n[this[i][prop]] = true;
        r.push(this[i]);
      }
    }else{
      if (!n[this[i]]) {
        n[this[i]] = true;
        r.push(this[i]);
      }
    }
    
  }
  return r;
};

export default polyfillOfArray;

module.exports = polyfillOfArray;