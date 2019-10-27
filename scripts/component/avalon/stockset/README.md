stockset 库存,日期组件

	monthData.js 	基础的月内的日期数据,返回的数据已生成是否本月,是否节日,节日名称.节日依耐俩节日JS文件

	calendarTable.js 日历DOM生成,事件初始化
	
	_string/default_table.mustache 	日历模版默认的,这个是可以定制的




关于staticHolidays是根据传入的日期将当年及下一年的公历节日合并到日期数据里面.
{mmdd:"01-01",holidayName:"元旦节",holidayMiniName:"元旦",holidayClass:"yuandan"},
{mmdd:"03-08",holidayName:"妇女节",holidayMiniName:"妇女",holidayClass:"funv"},
{mmdd:"05-01",holidayName:"劳动节",holidayMiniName:"劳动",holidayClass:"laodong"},
{mmdd:"06-01",holidayName:"儿童节",holidayMiniName:"儿童",holidayClass:"ertong"},
{mmdd:"09-03",holidayName:"胜利日",holidayMiniName:"胜利",holidayClass:"shengli"},
{mmdd:"09-10",holidayName:"教师节",holidayMiniName:"教师",holidayClass:"jiaoshi"},
{mmdd:"10-01",holidayName:"国庆节",holidayMiniName:"国庆",holidayClass:"guoqing"},
{mmdd:"12-25",holidayName:"圣诞节",holidayMiniName:"圣诞",holidayClass:"shengdan"}
基本应用例子
var Class_calendarTable=require("business/utils/stockset/calendarTable.js");
var dateTable=new Class_calendarTable({
    date:"2016-03-25",
    container:"stockbox",
    tmpl:require("business/utils/stockset/_string/default_table.mustache"),
    api:{
        url:"/supplier/product/getProductTeamsByMonth.jsp",
        type:"get",
        cache:true
    },
    onSelect:function(arr){
        console.log(arr);
    }
});
参数详解
date:必填,日期型或日期型的串化,根据这个日期请求当月数据,判断是否逾期等.一切的一切都和它有关.(一般是后台系统给出的当天)
container,必填,id名,日历DOM会渲染到这个DOM里面
api,其中api.url必填,type默认get,cache默认false,获取业务数据的接口.
//请求url的拼接
api.url?ym=2016-03
//注意月份的参数名可以定制,后面会讲到.
 
//数据的返回(咱们现在日期返回的格式)
 
"data": {
        "content": [{
            "isTension": false,
            "floor_price": "",
            "count": 100,
            "teamPriceLock": null,
            "expectedSales": 4,
            "is_taocan": "off",
            "room_price": 0,
            "date": "2016-04-30",
            "room_type": 2,
            "taocan_room_count": 0,
            "id": 570913290,
            "child_price_desc": "",
            "min_buy_count": 1,
            "st": 1,
            "is_child_price": false,
            "child_price": 0,
            "sold": 0,
            "profit": 0.0,
            "price_desc": "",
            "taocan_child_count": 0,
            "max_buy_count": 10,
            "adult_price": 4000,
            "is_floorprice_set": false,
            "taocan_price": 0,
            "isYoosure": "off",
            "market_price": 5000,
            "taocan_adult_count": 0,
            "guarantee_stock": 0
        },...]...}
onSelect,fn,选中日期后需要做的操作;默认的参数arr,是所选日期的数据集合,如果是单选模式的话,arr长度会是1.
例:如果选中了2016-04-30的话,arr会push一个对象,包含所有的业务数据属性(参照上面的返回值),如果是新设置的选中日期,只包含date属性,后续你想做啥就做啥,都写在fn里就OK了.
*tmpl,这个是重点,就是日历数据的模版,可以完全定制.但是关键字一定要绑定.
*以下是关键字列表

data-node="prev",向上翻页按钮
data-node="next",向下翻页按钮
data-op="sel_all" data-node="sel",全选按钮必须绑俩.(多选模式)
data-node="sel" data-index="{{i}}" data-op="sel_week",周几多选按钮(input.checkbox),index是周几,日历数据的每天也会绑上.(多选模式)
data-date="{{_date}}",每个日期的容器,单击后可以选中
node="sel" data-node="sel" data-date="{{_date}}" data-index="{{_weekIndex}}",日期容器下的input.checkbox,单击切换选中与取消选中.
*所有的业务数据可以自行应用到模版.
*还有一些日期自带的固定属性也可以应用

_day:获取当天日的数字1~31
_weekIndex:周几,0~6
_otherMonth:是否非本月
_isHoliday:是否节假日
_holidayName:节日全名
_holidayMiniName:2个字的节日名
_holidayType:节日的类型,现在仅提供"holiday",这些内是为了在日期上打不同的标志,可以在holidays.js里面写其它的类型,如"work","rest"等.
_overdue:是否逾期,该日期与小于当前日期
_weekend:是否周末,周六和周日会有这个标记
初始化可选的参数之hidden
hidden,值为id名,一般是一个input.hidden,如果设置了这个input,那么,选中后,会将所有选中的日期通过join(",")连接后传入val().
var Class_calendarTable=require("business/utils/stockset/calendarTable.js");
var dateTable=new Class_calendarTable({
    date:"2016-03-25",
    container:"stockbox",
    hidden:"abc",//这是一个input.hidden的id
    tmpl:require("business/utils/stockset/_string/default_table.mustache"),
    api:{
        url:"/supplier/product/getProductTeamsByMonth.jsp",
        type:"get",
        cache:true
    },
    onSelect:function(arr){
        console.log(arr);
    }
});
初始化可选的参数之dayBoxActiveClass
设置这个参数,是选中后的某天的dom增加高亮显示,取消选择后,会清空这个class
初始化可选的参数之multiple,bool型
设置为true时,默认渲染日历dom时,可以多选.
初始化可选的参数之showOtherMonth,bool型
设置为true时,会在当月也展示其6*7格中的其它月的日期
初始化可选的参数之weekTop,1或其它,默认是1.
设置为1时,每周以周一开头,其它值,会以周日开头
初始化可选的参数之urlKey,string
api拼接时,默认用ym作为当前月份的参数名,用这个可以定制
提供的接口
setMode(bool);
切换单选及多选模式.true,清空当前所选,转为多选模式;false,清空当前所选,转多单选模式
request();
重新请求数据,原参不变.场景:比较在弹窗里渲染了这个日历,关掉弹窗后,再次打开,如果需要重新拿数据,就执行一下这个.
api属性内还可以增加callback
有一个参数,res,参数为接口返回值,内部this指向本对象.callback的执行优先级最高,所以这个方法可以用来处理返回数据(有时候后端传回的数据需要fix一下,就可以在这里搞),默认这个类渲染的数据源会使用接口返回的data.data.content节点.