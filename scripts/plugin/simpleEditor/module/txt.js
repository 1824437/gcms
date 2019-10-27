require('common/jquery-resize.js');
require("common/json2.js");
require("common/hogan-2.0.0.js");
require("common/kindeditor/mini_kindeditor.js");
var BASE=require("./base.js");
require("./string/simple_editor_txt.mustache");
var delControllerSting = /[\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u2000-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
/*
	config={
		//容器
		container:$(),
		group:组对象
		注:容器或组必须有一个.此框在simple_editor里必须用group
		//文本内容
		content:"",
		//支持的动作
		action:{
			moveup:true,
			movedown:true,
			delete:true
		}
	}
*/
//文本对象
function TXT(config){
	
	//没有容器滚粗去
	if(!config.container&&!config.group){
		return
	};
	this.type="txt",
	this.No=(Math.random()+"").replace("0.","");
	//图片的索引号
	this.index,
	this.editor,
	this.$container,
	this.btn={},
	//富文本的容器
	this.container=config.container,
	//支持的动作
	this.action=$.extend({
		moveup:true,
		movedown:true,
		"delete":true,
		insert:true
	},config.action);
	
	this.config=config;
	this.init();
	this.initEvent();
}
TXT.prototype=new BASE();
TXT.prototype.getData=function(){
	return {
		content:this.textarea.val().replace(delControllerSting, ""),
		imageModule:0
	}
};
TXT.prototype.getHTMLData=function(){
	return this.textarea.val();
},
TXT.prototype.init=function(){
		
		var str=QTMPL.simple_editor_txt.render({content:this.config.content||"",isFreeDaren:this.config.isFreeDaren});
		
		this.group=this.config.group;
		this.editor=this.group.editor;
		this.group.items.push(this);
		
		this.$container=$(str);
		this.$contentContainer = this.$container.find('.js-text-container');
		this.textarea=this.$container.find("textarea");
		
		if(this.group){
			this.group.dom.append(this.$container)
		}else{
			return;
		}
		this.btn.moveup=this.$container.find('[data-node=moveup]');
		this.btn.movedown=this.$container.find('[data-node=movedown]');
		this.btn.insert=this.$container.find('[data-node=insert]');
		this.btn.delete=this.$container.find('[data-node=delete]');
		this.loadEditor();
	};
TXT.prototype.loadEditor=function(){
	var self=this;
	self.kindEditor&&self.kindEditor.remove();
	self.kindEditor=KindEditor.create(self.textarea.get(0),{
				afterBlur: function() {
				  var text, html;
				  if (this.designMode) {
					html = this.edit.doc.activeElement.innerHTML;
				  } else {
					html = this.edit.textarea.val();
				  }
				  this.sync(html);
				},
		
				afterFocus: function() {
		
				},
				afterCreate: function() {
					//self.group&&self.group.change();
				},
				afterChange: function(e) {
					self.group&&self.group.change();
				},
				resizeType: 1,
				allowPreviewEmoticons: false,
				allowFileManager: false,
				items: ['bold','strikethrough', 'underline',"|",'forecolor','undo', 'redo'],
				htmlTags: {
				  font: ['color', 'size'],
				  span: [
					'.color',
					'.font-weight', '.font-style', '.text-decoration',],
				  'p': [ '.color', 
					'.font-weight', '.font-style', '.text-decoration',
				  ],
				  a: ['href', 'target', 'name', 'style','data-id','data-isquote'],
				  'br,strong,b,sub,sup,i,u,strike': []
				},
				colorTable: [
					['#E53333', '#E56600', '#FF9900', '#64451D'],
					['#009900', '#006600', '#99BB00', '#B8D100'],
					['#337FE5', '#003399', '#4C33E5', '#9933E5']
				],
				filterMode: true
			  
			});

};
TXT.prototype.initEvent=function(){
	var self=this;
	this.btn.delete.click(function(){
		if(!confirm("请确认是否删除该文本?")){return false;}
		//删除组绑定
		self.group.del&&self.group.del();
		//删除组DOM
		self.del();
	});
	this.btn.moveup.click(function(){
		self.moveup();
	});
	this.btn.movedown.click(function(){
		self.movedown();
	});
	this.btn.insert.click(function(){
		self.insert();
	});
	this.$contentContainer.on('resize',function(){
		var $content = $(this);
		var $groupContainer  = $content.closest('.js-group-container');
		$groupContainer.height($content.height());
	})
}


module.exports=TXT;