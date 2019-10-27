/**
 * --------------------------------------------------------------------------- *
 *
 * @Project: package_b2c_admin
 * @Dependence: --
 * @Description: 
 * @CreatedBy: t.z
 * @CreateDate: 2016/03/21
 * @LastModifiedBy: t.z
 * @LastModifiedDate: 2016/03/21
 * 创建日历DOM结构,绑定事件
 * --------------------------------------------------------------------------- *
 *实例参数
 //{
 ********
 
 // weekTop:周的头一天,1:周一,否则周日
 // date:可以是一个字串如"2015-12-12",可以是一个日期型数据:如new Date()
 ********
 // container:需要渲染的容器
 // api:"",//数据API,必须有
 //	tmpl:模版,日历DOM结构的DOM
 //	multiple:true||false//可选,开启单选还是多选模式,默认值是单选
 //	dataList:[] //该月的业务数据,会成生业务数据属性,this.data,最终会合并到月基础数据中(monthdata)去.
 //	onSelect:function(data){}data已选的数据对象数组(),这个数据就是业务数据.
 //	dayBoxActiveClass:"",某天被选中的样式名,没有就不设置.
 // urlKey:"ym",默认的接口URL月份的key是"ym".
 // }
 //注意,每天的dom里面有一个checkbox,隐藏用class=hide控制,没有配置项.

 */
require("common/jquery-1.7.2.min.js");
var DateUtil=require("common/util/DateUtil.js");
require("common/plugins/Hogan/src/hogan-2.0.0-fix.js");

var MonthData=require("business/utils/stockset/monthData.js");
var MonthHeader=require("business/utils/stockset/monthHeader.js");
//浅扩展
var extend=function(o1,o2){
	for(x in o2){
		o1[x]=o2[x];
	};
	return o1;
};



//默认opts
defaultOpts={
	weekTop:1,//可选,1周的头1天是周日还是周一,1:周一,其它:周日;默认1
	showOtherMonth:true,//可选,默认不显示其它月份数据
	urlKey:"ym"
};

var CalendarTable=function(opts){
	if(!opts.date||!opts.api||!opts.api.url||!opts.container||!opts.tmpl){
		this.inited=false;
		console&&console.log&&console.log("参数不足");
		return;
	}else{
		this.inited=true;
	};
	this.opts=extend(defaultOpts,opts);
	this.opts.defaultDate=DateUtil.parse(this.opts.date);
	this.opts.date=DateUtil.parse(this.opts.date);
	this.header=new MonthHeader(this.opts.date);
	this.monthData=new MonthData(this.opts);
	this.$dom=$("<div></div>");
	if(this.opts.hidden){
		this.$hidden=$("#"+this.opts.hidden);
	};
	this.mode=this.opts.multiple||false;
	
	$("#"+this.opts.container).append(this.$dom);
	/*
	if(this.opts.dataList&&this.opts.dataList.length){
		this.data=CalendarTable.dateArrToObj(this.opts.dataList);
		this.render();
	};
	*/
	this.initEvents();
	this.request();
};
CalendarTable.dateArrToObj=function(arr){
	var obj={};
	$.each(arr,function(i,n){
        n.displayFloorMode = window.configData.floorMode || false; // 为了处理是否展示加价底价
		obj[n.date]=n;
	});
	return obj;
};
//-------------------------
CalendarTable.prototype.initEvents=function(){
	var self=this;
	var cls=self.opts.dayBoxActiveClass;
	//全选
	this.$dom.on("click","[data-op=sel_all]",function(){
		var c=$(this).prop("checked");
		var $days=self.$dom.find("[data-node=sel]");
		$days.prop("checked",c);
		$days.closest("[data-node='daybox']")[!c?"removeClass":"addClass"](cls);
		self.setSelectedAfter();
	});
	//星期选择
	this.$dom.on("click","[data-op=sel_week]",function(){
		var c=$(this).prop("checked");
		var index=$(this).data("index");
		var $days=self.$dom.find("[node=sel]").filter("[data-index="+index+"]");
		//$days.prop("checked",c)[c?"removeClass":"addClass"]("hide");
		$days.prop("checked",c);
		if(!self.mode){
			$days.css("display",c?"inline-block":"none");
		};
		$days.closest("[data-node='daybox']")[!c?"removeClass":"addClass"](cls);
		self.setSelectedAfter();
	});
	//天的选择
	this.$dom.on("click","[data-node=daybox]",function(e){
		var _this=$(this);
		if(!self.mode){
			self.clearSelected();
		};
		var target=e.target?e.target : e.srcElement;
		var targetName=target.nodeName.toUpperCase();
		var $checkbox=$(this).find('input[node=sel]');
		var isCheck=$checkbox.prop("checked");
		if(targetName=="INPUT"){
			_this[!isCheck?"removeClass":"addClass"](cls);
		}else{
			$checkbox.prop("checked",!isCheck);
			_this[isCheck?"removeClass":"addClass"](cls);
			//$checkbox[!isCheck?"removeClass":"addClass"]("hide");
			if(!self.mode){
			 $checkbox.css("display",!isCheck?"inline-block":"none");
			};
		};
		self.setSelectedAfter();
	});
	//选择上一个月
	this.$dom.on("click","[data-node=prev]",function(e){
		self.prevMonth();
		self.request();
		
	});
	//选择下一个月
	this.$dom.on("click","[data-node=next]",function(e){
		self.nextMonth();
		self.request();
		
	});
};
//初始化日历数据,并填充到容器
CalendarTable.prototype.render=function(list){
	//渲染步骤
	//1.业务数据合并
	this.data=CalendarTable.dateArrToObj(list);
	
	//先merge
	this.monthData.merge(this.opts.date,this.data);
	//var mergeMonthData=MonthData(this.opts).merge(this.data).DATA;
	var x=this.opts.tmpl.render(
		{
			//月头部数据
			monthHeader:this.header.getResult(),
			//是否渲染checkbox来支持多选
			multiple:this.opts.multiple,
			//是否渲染其它月数据
			showOtherMonth:this.opts.showOtherMonth,
			mergeMonthData:this.monthData.DATA
		}
	);
	this.$dom.html(x);
	this.setMode(this.mode);
};
//一般用于单选模式下的清除其它天的选择
CalendarTable.prototype.clearSelected=function(){
	this.$dom.find("[node=sel]").prop("checked",false).css("display","none");
	this.$dom.find("[data-node=daybox]").removeClass(this.opts.dayBoxActiveClass);
};
//mode="multiple"|"single"(多选,单选)模式切换
CalendarTable.prototype.setMode=function(bool){
	if(!this.inited){return;}
	this.mode=bool;
	var $checkbox=this.$dom.find("[data-node=sel]").prop("checked",false);
	this.$dom.find("[data-node=daybox]").removeClass(this.opts.dayBoxActiveClass);
	if(this.mode){
		//$checkbox.removeClass("hide");
		$checkbox.css("display","inline-block");
	}else{
		//$checkbox.addClass("hide");
		$checkbox.css("display","none");
	};
	this.setSelectedAfter();
};


//选择之后要发生的
CalendarTable.prototype.setSelectedAfter=function(){
	var self=this;
	//after做以下几件事
	//1.如果有隐藏数据框,给它赋值
	//2.触发初始化代入的onSelect事件所需要数据
	//3.解发onSelect
	var $selected=this.$dom.find("[node=sel]:checked");
	var dateArr=[],dataArr=[];//小注,有个字母不一样哦.
	$selected.each(function(i,n){
		dateArr.push($(this).data("date"));
	});
	if(this.$hidden){
		this.$hidden.val(dateArr.join(","));
	};
	
	$.each(dateArr,function(i,n){
		if(self.data[n]){
			dataArr.push(self.data[n]);
		}else{
			dataArr.push({date:n});
		}
		
	});
	this.opts.onSelect&&this.opts.onSelect.call(this,dataArr);
};
//渲染上一个月
CalendarTable.prototype.prevMonth=function(){
	this.opts.date=MonthHeader.prev(this.opts.date);
	this.header.setDate(this.opts.date);
	this.opts.onChangeMonth&&this.opts.onChangeMonth.call(this,this.opts.date);
};
//渲染下一个月
CalendarTable.prototype.nextMonth=function(){
	this.opts.date=MonthHeader.next(this.opts.date);
	this.header.setDate(this.opts.date);
	this.opts.onChangeMonth&&this.opts.onChangeMonth.call(this,this.opts.date);
};

//数据请求
CalendarTable.prototype.request=function(){
	var self=this;
	if(!this.opts.api.url){
		console&&console.log&&console.log("api.url不存在");
		return;
	};
	var data={};
	data[this.opts.urlKey]=MonthHeader.getYMstr(this.opts.date);
	$.ajax({
		url:this.opts.api.url,
		type:this.opts.api.type||"get",
		cache:this.opts.api.cache||false,
		data:data,
		dataType: 'json',
		success: function(res){
			if(res&&res.ret){
				self.opts.api.callback&&self.opts.api.callback.call(self,res);
				self.render(res.data.content||[]);
			}
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			alert("请求异常");
		}
	});
};

module.exports=CalendarTable;