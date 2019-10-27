/**
 * --------------------------------------------------------------------------- *
 *
 * @Project: package_b2c_admin
 * @Dependence: --
 * @Description: 
 * @CreatedBy: t.z
 * @CreateDate: 2016/03/28
 * @LastModifiedBy: t.z
 * @LastModifiedDate: 2016/03/28
 * 当月,下月,上月的读取
 * --------------------------------------------------------------------------- *
 * monthHeader.js类
 * 参数date,当前日期,必选(日期型)
 * validMonths,有效月份数组,非必选,标明限定月份.
 */
var DateUtil=require("common/util/DateUtil.js");
var MonthHeader=function(date,validMonths){
	if(date.constructor!=Date){
		console&&console.log&&console.log("参数异常");
		return;
	};
	this.date=date;
	this.current=new Date(date.getFullYear(),date.getMonth(),1);
	//有效月份限制,//todo
	/*
	if(validMonths){
		this.validMonths=validMonths;
	}*/
};
//类方法
MonthHeader.next=function(date){
	return new Date( date.getFullYear() , date.getMonth() + 1 , 1 );
};
MonthHeader.prev=function(date){
	
	return new Date( date.getFullYear() , date.getMonth() - 1 , 1 );
};
MonthHeader.getYMstr=function(date){
	var y=date.getFullYear();
	var m=date.getMonth()+1;
	m=m<10?"0"+m:m+"";
	return y+"-"+m;
};
MonthHeader.fixMonthStr=function(num){
	num=parseInt(num);
	return num<10?"0"+num:num+"";
};
MonthHeader.prototype.getResult=function(){
	//当前月,非系统当月(current)
	var d=this.date;
	var mm=d.getMonth()+1;
	var p=MonthHeader.prev(d);
	var n=MonthHeader.next(d);
	return {
		date:d,
		year:d.getFullYear(),
		month:{
			p:{str:p.getMonth()+1,visible:p<this.current?false:true},
			c:{str:MonthHeader.fixMonthStr(d.getMonth()+1),visible:true},
			n:{str:n.getMonth()+1,visible:true}
		}
	};
};
MonthHeader.prototype.setDate=function(date){
	if(date.constructor!=Date){
		console&&console.log&&console.log("参数异常");
		return;
	};
	this.date=date;
};
MonthHeader.prototype.getNext=function(){
	var d=this.date;
	this.date=MonthHeader.next(d);
	return this.getResult();
};
MonthHeader.prototype.getPrev=function(){
	var d=this.date;
	this.date=MonthHeader.prev(d);
	return this.getResult();
};
module.exports=MonthHeader;