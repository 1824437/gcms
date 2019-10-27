require('common/jquery.form.js');
require('common/plugins/uploader/src/normal-upload.js');
var BASE=require("./base.js");
require("./string/simple_editor_img.mustache");
/*
	config={
		//容器
		//图片地址
		url:"",
		//图片支持的动作
		action:{
			clip:true,
			moveup:true,
			movedown:true,
			delete:true,
			replace:true
		},
		type:""//NormalImage||CustomImage
		
	}
*/

var apiPrefix = location.pathname.indexOf('/admin') != -1 ? "/admin" : "/supplier";

//图对象
var loadEditor=function(el){};
function IMG(config){
	if(!config.url || !config.type){
		return
	};
	this.No=(Math.random()+"").replace("0.","");
	this.type=config.type;
	//图片的索引号
	this.index,
	//图片地址
	this.imgUrl=config.url,
	//所在group
	this.group=config.group,
	this.editor=this.group.editor,
	//产生的DOM
	this.dom,
	//支持的动作
	this.action=$.extend({
		clip:true,
		moveup:true,
		movedown:true,
		"delete":true,
		replace:true
	},config.action),
	this.btn={},
	//DOM的cls
	this.className,
	//是否需要裁剪
	this.needClip=config.needCrop;
	this.needReplace = false;
	this.name=config.name;
	
	this.init(config);
	
};
IMG.prototype=new BASE();


IMG.prototype.autoCenterTool = function(){
	var $btnList = this.dom.find('.highlight-tool-btn');

	//此时dom树中的节点已经被摘下来，始终返回false
	//if(!$btn.is(':visible')){
	//	return;
	//}

	$btnList.each(function(){
		var $btn = $(this);
		if($btn.css('display') === 'none'){
			return true;
		}

		var $container = $btn.parent();
		var lastLeftValue = 0,lastTopValue = 0;
		var timer = setInterval(function(){
			var leftValue = ($container.width() - $btn.width())/2;
			var topValue = ($container.height() - $btn.height())/2;
			if(leftValue > 0 && topValue > 0){
				$btn.css({
					left:leftValue,
					top: topValue
				});

				if(lastLeftValue === leftValue && lastTopValue === topValue){
					clearInterval(timer);
				}else{
					lastLeftValue = leftValue;
					lastTopValue = topValue;
				}
			}
		},100);
	});
}

IMG.prototype.init=function(){
	var str=QTMPL.simple_editor_img.render({className:this.className,url:this.imgUrl,isNormalImage:this.type=="NormalImage"});
	this.dom=$(str);
	this.img=this.dom.find('[data-node=images]');
	this.btn.moveup=this.dom.find('[data-node=moveup]');
	this.btn.movedown=this.dom.find('[data-node=movedown]');
	this.btn.clip=this.dom.find('[data-node=clip]');
	this.btn.replace=this.dom.find('[data-node=replace]');
	this.btn.delete=this.dom.find('[data-node=delete]');
	if(this.group){
		this.group.dom.append(this.dom);
	}else{
	}

	this.initSpecialTool();

	this.initEvent();
};


IMG.prototype.showBigReplace = function(){
	var $img = this.img;
	var btnObj = this.btn;
	var $replaceContainer = btnObj.replace.parent();
	$replaceContainer.addClass('highlight-tool-btn');
	$replaceContainer.insertBefore($replaceContainer.parent());
	$img.addClass('need-replace-border');
	this.editor.showReplaceWarn();
	this.autoCenterTool();
}

IMG.prototype.hideBigReplace = function(){
	var btnObj = this.btn;
	var $img = this.img;
	var $replaceContainer = btnObj.replace.parent();
	$replaceContainer.removeClass('highlight-tool-btn');
	$replaceContainer.insertBefore(btnObj.delete);
	$replaceContainer.removeAttr('style');
	$img.removeClass('need-replace-border');
	if(this.editor.isAllImageSizeValid()){
		this.editor.hideReplaceWarn();
	}
}

IMG.prototype.showBigCrop = function(){
	this.btn.clip.css("display","inline-block");
	this.img.addClass("need-crop-border");
	this.autoCenterTool();
}

IMG.prototype.hideBigCrop = function(){
	this.btn.clip.css("display","none");
	this.img.removeClass("need-crop-border");
}

IMG.prototype.initSpecialTool = function(){
	//替换比裁剪优先级更更高

	var btnObj = this.btn;
	var $img = this.img;

	if(this.needReplace){
		this.showBigReplace();
	}else{

		this.hideBigReplace();

		if(this.needClip){
			this.showBigCrop();
		}else{
			this.hideBigCrop();
		}
	}
	this.autoCenterTool();
}

//替换
IMG.prototype.replace=function(data){
	var list=data;
	var btnObj = this.btn;
	if(!list[0].url){
		alert('"'+list[0].imgName+'",上传失败,'+list[0].msg);
		return;
	}
	this.needClip=list[0].needCrop;
	//name:data.data[i].imgName,
	this.imgUrl=list[0].url;
	this.img.attr("src",this.imgUrl);
	//裁剪按钮
	if(this.needClip){
		btnObj.clip.css("display","inline-block");
		this.autoCenterTool();
	}else{
		btnObj.clip.css("display","none");
	};

	this.hideBigReplace();

	this.group&&this.group.change();
},
IMG.prototype.getData=function(){
	/*
	switch(this.type){
		case "NormalImage":
		break;
		case "CustomImage":
		break;
	}*/
	return {content:encodeURIComponent(this.img.attr("src"))}
};

IMG.prototype.getHTMLData=function(){
	var imgDom = this.img[0];
	return imgDom?imgDom.outerHTML:'';
}
//初始化按钮事件
IMG.prototype.initEvent=function(){
		var self=this;
		var url= apiPrefix + "/product/image/upload.json?ie=9&left=0&top=0&height=-1&width=-1&isCustomImage=";
		self.type=="normalImage"?url+="false":url+="true";
		//初始化替换按钮
		new normalUploader({
			limit:"",
			type:"*.jpg;*.png",
			uploadUrl: url,
			fileInput: this.btn.replace,
			onProgress:function(file, loaded, tota){
			}, //文件上传进度
			onSuccess: function(x,data){
				if(data&&data.ret){
					self.replace(data.data);
				}else{
					alert(data.msg);
				}
			}, //文件上传成功时
			onFailure: function(data){
				//console.log(data);
			}, //文件上传失败时
			onComplete: function(){
				
			}, //文件全部上传完毕
			onBefore:function(upObj){
				//upObj.config.uploadUrl= apiPrefix + "/product/image/upload.json?ie=9&left=0&top=0&height=-1&width=-1&isCustomImage=true";
			}//文件上传前要干啥可以干啥
		});
		//
		this.btn.delete.click(function(){
			
			if(!confirm("请确认是否删除该图片?")){return false;}
			if(self.type=="customImage"){
				//删除组绑定
				//self.group.deleteItem&&self.group.deleteItem(self.No);
				self.group.del&&self.group.del();
			};
			//删除组DOM
			self.del();
			if(self.type=="normalImage"){
				self.group.deleteItem&&self.group.deleteItem(self.No);
			};
			if(self.editor.isAllImageSizeValid()){
				self.editor.hideReplaceWarn();
			}
		});
		this.btn.moveup.click(function(){
			self.moveup();
		});
		this.btn.movedown.click(function(){
			self.movedown();
		});
		this.btn.clip.click(function(){
			window.simpleEditorClipDlg.fire(self);
		});
		//鼠标移上去后
		this.dom.bind("mouseenter",function(){
			var status = self.needReplace?'need-replace':self.needClip?'need-cut':'focus';
			self.showStatus(status);

		});
		this.dom.bind("mouseleave",function(){
			var status = self.needReplace?'need-replace':self.needClip?'need-cut':'clear';
			self.showStatus(status);
		});

		this.img.on('load',function(){
			var $this = $(this);
			var $testImg = $('<img />');
			$testImg.attr('src',$this.attr('src'));

			//原图小于650的需要重新上传
			if($testImg.prop('width') < 650){
				self.showStatus('need-replace');
				self.needReplace = true;
				self.showBigReplace();
			}else{
				self.showStatus('focus-border');
				self.needReplace = false;
				self.hideBigReplace();
			}
		});
}

IMG.prototype.showStatus = function(status){
	var $img = this.img;
	$img.removeClass('need-crop-border need-replace-border focus-border plain-border');
	switch(status){
		case 'need-cut':
			//this.img.css("border","4px solid #de3232");
			$img.addClass('need-crop-border');
			break;
		case 'need-replace':
			//this.img.css("border","4px solid #ff9900");
			$img.addClass('need-replace-border');
			break;
		case 'focus':
			//this.img.css("border","4px solid #3775c0");
			$img.addClass('focus-border');
			break;
		case 'clear':
			//this.img.css("border","4px solid #fff");
			//this.img.css("border","none");
			$img.addClass('plain-border');
			break;
		default:
			break
	}
}
module.exports=IMG;