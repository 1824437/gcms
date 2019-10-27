/**
 * --------------------------------------------------------------------------- *
 *
 * @Project: package_b2c_admin
 * @Dependence: --
 * @Description: 
 * @CreatedBy: t.z
 * @CreateDate: 2016/03/17
 * @LastModifiedBy: t.z
 * @LastModifiedDate: 2016/03/17
 * 月份的数据模型,输出日历型数据及相关
 * --------------------------------------------------------------------------- *
 * monthData类
 * 参数opts{weekTop:1|x,date:date}
 * weekTop:周的头一天,1:周一,否则周日
 * date:可以是一个字串如"2015-12-12",可以是一个日期型数据:如new Date()
 *
 */
var DateUtil=require("common/util/DateUtil.js");
var StaticHolidays=require("common/staticHolidays.js");

var holidays=require("common/holidays.js");
//获取数据某个元素所在位置,扒的JQ
var inArray=function( elem, array, i ) {
	var len;

	if ( array ) {
		if ( Array.prototype.indexOf ) {
			return Array.prototype.indexOf.call( array, elem, i );
		}

		len = array.length;
		i = i ? i < 0 ? Math.max( 0, len + i ) : i : 0;

		for ( ; i < len; i++ ) {
			// Skip accessing in sparse arrays
			if ( i in array && array[ i ] === elem ) {
				return i;
			}
		}
	}

	return -1;
};

//浅扩展
var extend=function(o1,o2){
	for(x in o2){
		if(o1[x]==undefined){
			o1[x]=o2[x];
		}
		
	};
	return o1;
};

//周的头部
var weekHeaderLabel=[
	{t:"一",i:1},
	{t:"二",i:2},
	{t:"三",i:3},
	{t:"四",i:4},
	{t:"五",i:5},
	{t:"六",i:6,weekend:true},
	{t:"日",i:0,weekend:true}
];
function monthData(opts){
	//获取当前日期
	var currentDate=opts&&opts.date?DateUtil.parse(opts.date):new Date();
	currentDate=DateUtil.parse(DateUtil.format(currentDate));
	this.DATA={
		//定义一周的顺序
		weekHeader:opts&&opts.weekTop==1?[1,2,3,4,5,6,0]:[0,1,2,3,4,5,6],
		weekHeaderLabel:opts&&opts.weekTop==1?weekHeaderLabel:function(){weekHeaderLabel.unshift(weekHeaderLabel.pop());return weekHeaderLabel}(),
		//当前的日期
		date:currentDate,
		defaultDate:currentDate,
		//串化当前日期
		dateStr:DateUtil.format(currentDate),
		daysList:[]
	};
};

//这个方法完全依赖DATA.date;以date所在月获得月数据
monthData.prototype._set=function(){
	this.DATA.daysList=[];
	var rows=[],rowLen=6,colLen=7;//数据是6行7列
	//本月第1天
	var first = DateUtil.getFirstByMonth(this.DATA.date);
	//数据从哪天开始
	var startDate = this._findClosestDateByDay(first,true);
	
	var currentMonth=this.DATA.date.getMonth();
	var staticHolidays=StaticHolidays(this.DATA.date.getFullYear());
	for(var i=0;i<rowLen;i++){
		var cols=[];
		for(var n=0;n<colLen;n++){
			//每一天的默认数据
			var h,o={
				_date:DateUtil.format(startDate),
				_day:startDate.getDate(),
				_weekIndex:startDate.getDay()
			};
			//标记非本月
			if(currentMonth!=startDate.getMonth()){
				o._otherMonth=true;
			}
			//标记节假日
			if(h=staticHolidays[o._date]||holidays[o._date]){
				o._isHoliday=true;
				o._holidayName=h.holidayName;
				o._holidayMiniName=h.holidayMiniName;
				o._holidayClass=h.holidayClass;
				o._holidayType=h.holidayType;
				
			};
			//日期是否过期
			if(startDate-0<this.DATA.defaultDate-0){
				o._overdue=true;
			};
			//标记周末
			if(this.DATA.weekHeader[0]==0?(n==0||n==6):(n==5||n==6)){
				o._weekend=true;
			}
			cols.push(o);
			startDate=DateUtil.addDay(startDate,1)
		};
		rows.push(cols);
	}
	this.DATA.daysList=rows;
};

//获取当天前所在周的第一天,这个和weekHeader有关系(周一在前,还是周日在前)
monthData.prototype._findClosestDateByDay=function(date, isPrev) {
	var list = this.DATA.weekHeader;
	var index = inArray(date.getDay(), list);
	
	if (isPrev) {
		return DateUtil.addDay(date, -index);
	} else {
		return DateUtil.addDay(date, list.length - index - 1);
	}
};

monthData.prototype.changeDate=function(date){
	this.DATA.date=DateUtil.parse(date);
	this._set();

};
monthData.prototype.next=function(){
	return this.DATA;
};
monthData.prototype.prev=function(){
	return this.DATA;
};
//listObj是业务数据,合并到
monthData.prototype.merge=function(date,listObj){
	this.changeDate(date);
	var monthData=this.DATA.daysList;
	//循环7*6二维数据
	for(var m=0,mlen=monthData.length;m<mlen;m++){
		for(var n=0,nlen=monthData[m].length;n<nlen;n++){
			var xDayData=listObj[monthData[m][n]._date];
			if(xDayData){
				extend(monthData[m][n],xDayData);
			}
		}
	}
};
//module.exports=monthData;
/*
//单例
module.exports=function(opts){
	var m=new monthData(opts);
	return {
		DATA:m.DATA,
		next:function(){
			m.next();
			return this;
		},
		prev:function(){
			m.prev();
			return this;
		},
		changeDate:function(date){
			m.changeDate(date);
			return this;
		},
		merge:function(list){
			m.merge(list);
			return this;
		}
	}
};
*/
module.exports=monthData;