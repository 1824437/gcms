/*
* @Author: tao.zhu
* @Date: 2017-09-13 11:05:09
 * @Last Modified by: tao.zhu
 * @Last Modified time: 2018-02-01 18:00:51
* @Description: input-suggest
* @dependencies:
* @File Type:
* @Pmo: DUJIATTS-1867
*/

/**
 * 
 * 保证了数据必须从下拉列表中出输入。
 * @example
 * <input-suggest :parcel="tourSpotData" type="sight" @emit="changeTourName"></input-suggest>
 */
//指令
const v_suggest = require("common/components/vue/directive/suggest.js");
const __string = require("./input-suggest.string");
const __ajax = {
  common: {
    url: "//sgt.package.com/suggest/sight/sgt?query=*",
    dataType: "jsonp",
    cache: true
  },
  hotel: {
    url: "//sgt.package.com/suggest/hotel/sgt?query=*",
    dataType: "jsonp",
    cache: true
  }
};
const hotelDefault = {"name": "系统无该酒店？自定义", "hotelSeq": null};
/**
 * 景点suggest数据
 * @props type //suggest类型
 * @props parcel //所需的数据
 * @props inputStyle //给input加样式
 * @events emit  //自定义的事件，当suggest修改后，向上层发射结果。
 */
const inputSuggest = Vue.component("input-suggest", {
  template: __string,
  props: {
    "placeholder" : {
      default: ""
    },
    "inputStyle": {
      default: ""
    },
    "parcel": {
      default: {
        sightName: "",
        name: ""
      }
    }, //景点数据
    "type": {
      default: ""
    } //suggest类型
  },
  computed: {
    value (){
      switch (this.type){
        case "sight":
          return this.parcel.sightName;
        break;
        case "hotel":
          return this.parcel.name;
        break;
        default:
          return "";
        break;

      }
    },
    suggest(){
      let ajax = __ajax[this.type] || __ajax.common;
      let extraData = () => "";
      let onReaderAfter = () => "";
      switch (this.type){
        case "sight":
          extraData = () => {
            var {cityName, cityType} = this.parcel;
            let _extraData = {
              type: '(景点 景区)',
              start: 0,
              rows: 20,
              isContain: true
            };
            if (cityType === "country"){
              _extraData.country = cityName;
            } else {
              _extraData.city = cityName;
            }
            return _extraData;
          };
        break;

        case "hotel":
          extraData = () => {
            var {name, id, address} = this.parcel;
            let _extraData = {
              "isNgram": true,
              "rows": 20,
              "isContain": true,
              "city": address,
              "cityfuzzy": true
            };
            return _extraData;
          };
          onReaderAfter = (result) => {
            if(!result.length){
              result.push(hotelDefault);
            }
          };
        break;

        case "countryAndCity":
          extraData = () => {
            let _extraData = {
              rows: 20,
              isContain: true,
              type: "国家,城市",
              flMore: "cityCode"
            };
            return _extraData;
          };
        break;
        default: 
          extraData = () => {
            let _extraData = {
              rows: 20,
              isContain: true,
              flMore: "cityCode"
            };
            return _extraData;
          };
        break;
      }

      return {
          ajax,
          extraData,
          select: this.select,
          onReaderAfter
      };
    }
  },
  methods: {
    clear (eve){
      if (this.type === "hotel"){
        if(this.parcel.name === hotelDefault.name){
          eve.target.value = "";
        }
      }
    },
    focus (){
      this.$emit("____close_validate");
    },
    blur (eve) {
      switch (this.type){
        case "sight":
          eve.target.value = this.parcel.sightName;
        break;
        case "hotel":
          eve.target.value = this.parcel.name;
        break;
        default:
          return eve.target.value = "";
        break;
      }
    },
    //suggest选出来的数据走这里。
    select(data) {
      this.$emit("emit", data);
    }

  }
});