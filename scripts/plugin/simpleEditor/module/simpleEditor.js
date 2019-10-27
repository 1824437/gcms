/**
 *	@author: t.z
 *	@lastModify：t.z
 *	@lastModiftDate: 2015/12/11
 *	@fileoverview: TTS后台专用编辑器
 */
require("common/avalon-base.js");

//require('common/jquery-1.7.2.min.js');
require('common/jquery.form.js');
require('common/plugins/uploader/src/normal-upload.js');
require("common/json2.js");
require("common/hogan-2.0.0.js");
require('common/modules/Proxy/index.js');
require("./string/simple_editor_editor.mustache");
require("./string/simple_editor_clip.mustache");
//require("common/dlg.js");
require("common/dialog.js");
var SelectVideoDlg = require("scriptRoot/business/utils/select_video/select_video");
//var avalonPopup = require('avalonUI/avalonPopup/avalon-popup.js');
require("common/jquery.Jcrop.js");
var IMG=require("./img.js");
var Video=require("./video.esx");
var TXT=require("./txt.js");
var GROUP=require("./group.js");

var imageUtil = require('scriptRoot/common/modules/utils/ImageUtil.js');
var apiPrefix = location.pathname.indexOf('/admin') != -1 ? "/admin" : "/supplier";

/*
 *selector,textarea的 选择器，默认为id,
 *name:取个名字
*/
function EDITOR(selector,name,config){
	if(!selector){
		return null;
	}else if(typeof selector === 'string'){
		var firstChar = selector.charAt(0);
		//不是标准选ID，CLASS，属性选择器，则默认ID选择器
		if(firstChar !== '#' && firstChar !== '.' && firstChar !== '['){
			selector = '#' + selector;
		}
	}else{
		//jQuery object
	}

	var $elements = $(selector);
	if ($elements.length === 0) {
		return null;
	}else{
		this.init($elements,name,config);
	}
}


EDITOR.init = function($elements,name,config){
	return new EDITOR($elements,name,config);
}

EDITOR.initAll = function($elements,name,config){
	var resultList = [];
	var tmpEditor;
	$elements.each(function(){
		tmpEditor = new EDITOR($(this),name,config);
		resultList.push(tmpEditor);
	});

	return resultList;
}

EDITOR.contentToHTML = function(content){
	var contentList;
	content = content || '[]';
	try{
		contentList = JSON.parse(content);
	}catch(e){
		throw new Error('数据解析错误');
		return '';
	}

	var tmpObj,resultList = [],tmpImgList;
	var i,objLen, j,imgLen;
	for(i = 0, objLen = contentList.length; i < objLen; i++){
		tmpObj = contentList[i];
		if(tmpObj.type === 'text'){
			resultList.push(tmpObj.content);
		}else{
			//customImage || standardImage
			tmpImgList = tmpObj.type === 'video'
			? [tmpObj.cover]
			: tmpObj.content.split(',');
			for(j = 0, imgLen = tmpImgList.length; j <imgLen; j++){
				resultList.push('<img src="' + decodeURIComponent(tmpImgList[j]) + '" />');
			}
		}
	}

	return resultList.join('');
}

EDITOR.prototype={
	defaultValue:[],
	defaultConfig:{
        text:{
            enabled:true,     //启用自定义图片上传
            required:false    //至少上传一张自定义图片
        },
		standardImage:{
			enabled:true,    //启用标准图片上传
			required:false,  //至少上传一张标准图片
		},
		customImage:{
			enabled:true,     //启用自定义图片上传
			required:false    //至少上传一张自定义图片
		},
		imageGallery:{
			enabled:false,
			required:false,
			dataGetter:function(){
				return '';
			}
		},
		fullScreen:true,

		//@param maxNumOfVideo {number} 编辑器内允许的最大视频数
		maxNumOfVideo: 1,
		//@param canInsertVideo {boolean} 编辑器内允许的最大视频数
		canInsertVideo: false
	},
	getImageCount:function(){
		var imageCount = 0;
		var resultList = this.getData();
		var group;
		for(var i = resultList.length;i--;){
			group = resultList[i];
			if(group.type === 'customImage' || group.type === 'standardImage'){
				imageCount += group.content.split(',').length;
			}
		}

		return imageCount;
	},
	isImageCountValid:function(needCount){
		var self = this;
		var configObj = this.config;
		var needImage = false,configItem;
		var imageCount = 0;
		for(var key in configObj){
			configItem = configObj[key];
			if(configItem && configItem.required){
				needImage = true;
				break;
			}
		}

		if(needImage){
			imageCount = self.getImageCount();
			return imageCount >= needCount;
		}else{
			return true;
		}
	},
	isAllImageSizeValid:function(){
		var $needReplaceImages = this.$container.find('img.need-replace-border');
		return $needReplaceImages.length === 0;
	},
	init:function($el,name,config){
		if(typeof name !== 'string'){
			config = name;
		}else{
			this.name = name || "";
		}
		this.initConfig(config);
		this.initElements($el);
		this.initEvents();
		//初始化值
		this.renderGroup();
		//初始化剪裁框
		this.initClipDlg();
	},
	initConfig:function(config){
		this.config = $.extend(true,{},this.defaultConfig);
		config && $.extend(true,this.config,config);
	},
	initEvents:function(){
		var self = this;
		self.$container.bind('imageGalleryInsertEvent',function(e,result){
			var data = result.data;
			if(!Array.isArray(data) || data.length === 0){
				return;
			}
			var imageList = [],imgObj;
			for(var i = 0, len = data.length; i < len; i++){
				imgObj = data[i];
				imageList.push({
					url:imageUtil.getAbsoluteUrl(imgObj.id),
					needCrop:false
				});
			}
			self.insertCustomImage({
				data:imageList
			});
		});

		$(document).on('click',function(evt){
			var $src = $(evt.target);
			if(!$src.hasClass('uploadTipBox')){
				self.$tipsContainer.hide();
			}
		});
	},
	initElements:function($el){
		this.$targetElement = $($el);
		this.$targetElement.hide();
		this.groups=[];
		this.btn = {};
		this.No=(Math.random()+"").replace("0.","");
		this.inited=true;
		this.$container=$(QTMPL.simple_editor_editor.render(this.config));
		this.$headerWarn = this.$container.find('.editor-content-warning');
		this.$tools = this.$container.find('.js-tools-container');
		this.$content=this.$container.find('[data-node="body"]');

		this.btn.insertEditor=this.$container.find("[data-node=insertEditor]");

		this.$tipsContainer = this.$container.find('.js-editor-tips');

		this._initTextEditor();
		this._initStandardUploader();
		this._initCustomUploader();
		this._initImageGallery();
		this._initFullScreen();
		this._initSelectVideo();

		this.$targetElement.before(this.$container);
		this.$targetElement.data("simpleditor",this);

		this.initialized = true;
	},
	scrollBottom:function(){
		this.$content.scrollTop(this.$content.get(0).scrollHeight);
	},
	showReplaceWarn:function(){
		this.$headerWarn.show();
	},
	hideReplaceWarn:function(){
		this.$headerWarn.hide();
	},
	initClipDlg:function(){
		/*
		this.clipDlg=new avalonPopup({
			id: 'dialog',
			type: 'alert',
			title: '警告',
			content: '请检查所有必填项'
		});
		*/
	},
	getFirstGroup:function(){
		return this.groups[0];
	},
	getLastGroup:function(){
		return this.groups[this.groups.length-1];
	},
	//获取某个组的索引号
	getGroupIndex:function(groupNo){
		var index;
		$.each(this.groups,function(i,n){
			if(n.No==groupNo){
				index=i;
				return false;
			}
		});
		return index;
	},
	getSiblingGroup:function(dir,groupNo){
		var groupIndex=this.getGroupIndex(groupNo);
		if(dir=="up"){
			return this.groups[groupIndex-1];
		};
		if(dir=="down"){
			return this.groups[groupIndex+1];
		}
		alert("未指定获取相邻组的方向");
	},
	//交换组位置,用于文本组与自定义图像组交换位置(这俩类组不存在拆组);
	changeOfPosition:function(g1No,g2No){
		var g1Index=this.getGroupIndex(g1No);
		var g2Index=this.getGroupIndex(g2No);
		var groups=this.groups;

		if(g1Index==g2Index||groups[g1Index]==undefined||groups[g2Index]==undefined){
			return;
		}
		//交换数组位置
		var min=Math.min(g1Index,g2Index);
		var max=Math.max(g1Index,g2Index);
		var e1=groups.splice(max,1)[0];
		var e2=groups.splice(min,1)[0];
		groups.splice(min,0,e1);
		groups.splice(max,0,e2);

		//交换DOM位置,目前仅仅交换相邻的
		e1.box.after(e2.box);
		if(e1.type=="text"){
			e1.items[0].loadEditor();
		};
		if(e2.type=="text"){
			e2.items[0].loadEditor();
		};
		this.change();
	},
	//设置边距
	setMargin:function(){
		for(var i=0,len=this.groups.length;i<len;i++){
			var g=this.groups[i];
			var next_g=this.groups[i+1];
			g.bottomPadding=true;
			if(g.type=="CustomImage"){
				if(next_g&&next_g.type=="CustomImage"){
					g.bottomPadding=false;
					g.box.css("marginBottom","0px");
				}else{
					g.bottomPadding=true;
					g.box.css("marginBottom","10px");
				}
			};
		}
	},
	cache:"",
	//获取当前编辑的数据
	getData:function(){
		var resultList = [],tmpArr;
		for (var i = 0, len = this.groups.length; i < len; i++) {
			tmpArr = this.groups[i].getData();
			resultList = resultList.concat(tmpArr)
		}
		$.each(resultList, function (i, n) {
			n.order = i;
		});
		this.$targetElement.val(resultList.length ? JSON.stringify(resultList) : "");
		return this.cache = resultList;
	},
	getHTMLData:function(){
		var resultList = [];
		var groups = this.groups;
		for(var i = 0, len = groups.length; i < len; i++){
			resultList.push(groups[i].getHTMLData());
		}

		return resultList.join('');
	},
		/*用于前端验证,检测是否为空
	*循环每个组,如果组不存在,或者存在的组全无图,或富文本组全为空时为假值
	*/
	checkdata:function(){
		if(!this.groups.length){
			return false;
		}
		var re=false;

		for(var i=0,len=this.groups.length;i<len;i++){
			var g=this.groups[i];
			if(g.type=="NormalImage"||g.type=="CustomImage"){
				re=true;
				$.each(g.items,function(i,n){
					if(n.neddClip){
						re=false;
						return false;
					}
				});
				break;
			};
			if(g.type=="text"){
				if(g.items[0].kindEditor.text().length){
					re=true;
					break;
				}
			}
		};

		return re;
	},
	change:function(groupType){
		this.setMargin();
		this.getData();
		var callback = this.config.contentChangeCallback;
		callback && $.isFunction(callback) && callback(this);
	},

	getResultInfo:function(result){
		var resultList = result || [],
			successCount = 0,
			errorCount = 0,
			tmpResult,
			errorInfo = [];
		for(var i = 0,len = resultList.length;i <len;i++){
			tmpResult = resultList[i];
			if(tmpResult.url){
				successCount++;
			}else{
				errorCount++;
				errorInfo.push([tmpResult.imgName,'->',tmpResult.msg].join(''));
			}
		}

		var resultMessage = ['上传成功 ',successCount,' 个'];
		if(errorCount){
			resultMessage.push(['，失败 ',errorCount,' 个'].join(''));
			resultMessage.push('<br/>失败原因如下:<br/>');
			resultMessage.push(errorInfo.join('<br/>'));
		}

		return resultMessage.join('');
	},
	showResultInfo:function(resultInfo){
		this.$tipsContainer.html(resultInfo);
		this.$tipsContainer.show();
	},
	_initSelectVideo: function(){
		var self = this;
		this.btn.insertVideo = this.$container.find('[data-node="insertVideo"]');
		this.btn.insertVideo.click(
			//检查视频是否已存在，目前只支持1个视频。
			function(){
				var existVideo = 0;
				for( var i = 0, l = self.groups.length; i < l; i++){
					if(self.groups[i].type === "video"){
						existVideo++;
					}
				};
				if (self.config.maxNumOfVideo <= existVideo){
					alert("您已经插入了" + self.config.maxNumOfVideo + "个，不允许增加了；您可以编辑已插入的视频。");
					return;
				};
				SelectVideoDlg(function (videoObject){
					self.insertVideo(videoObject);
				});
			}
		);
	},
	_initTextEditor:function(){
		var self = this;
		this.btn.insertEditor.click(function(){
			self.insertTxt();
			self.scrollBottom();
		});

        var $normalInput = this.$container.find("[data-node=insertEditor]");
        var $toolContainer = $normalInput.closest('.tool-item');
        var textConfig = this.config.text;
        if(!textConfig || !textConfig.enabled){
            $toolContainer.hide();
            return;
        }

        if(textConfig.required){
            $toolContainer.addClass('required')
        }else{
            $toolContainer.removeClass('required')
        }
	},
	_initStandardUploader:function(){
		var self=this;
		var $normalInput = this.$container.find("[data-node=insertNormalImage]");
		var $toolContainer = $normalInput.closest('.tool-item');
		var standardConfig = this.config.standardImage;
		if(!standardConfig || !standardConfig.enabled){
			$toolContainer.hide();
			return;
		}
		this.btn.insertNormalImage = $normalInput;
		if(standardConfig.required){
			$toolContainer.addClass('required')
		}else{
			$toolContainer.removeClass('required')
		}

		this.initUploader({
			isStandard:true,
			$el:$normalInput,
			successCallback:self.insertNormalImage
		})

	},

	_initCustomUploader:function(){
		var self = this;
		var $customInput = this.$container.find("[data-node=insertCustomImage]")
		var $toolContainer = $customInput.closest('.tool-item');
		var customConfig = this.config.customImage;
		if(!customConfig || !customConfig.enabled){
			$toolContainer.hide();
			return;
		}

		this.btn.insertCustomImage = $customInput;
		if(customConfig.required){
			$toolContainer.addClass('required')
		}else{
			$toolContainer.removeClass('required')
		}

		this.initUploader({
			isStandard:false,
			$el:$customInput,
			successCallback:self.insertCustomImage
		});

	},
	initUploader:function(config){
		var self = this;
		var uploadUrl = apiPrefix + '/product/image/upload.json?ie=9&isCustomImage=';
		if(config.isStandard){
			uploadUrl += 'false'
		}else{
			uploadUrl += 'true';
		}
		new normalUploader({
			limit:"",
			type:"*.jpg;*.png",
			uploadUrl: uploadUrl,
			fileInput: config.$el,
			onProgress:function(file, loaded, tota){
			}, //文件上传进度
			onSuccess: function(x,resp){

				if(resp&&resp.ret){
					config.successCallback.call(self,resp);
					self.scrollBottom();

					if($.isFunction(self.config.showResultInfo)){
						self.config.showResultInfo(self,resp.data)
					}else{
						self.showResultInfo(self.getResultInfo(resp.data));
					}
				}else{
					alert(resp.msg);
				}
			}, //文件上传成功时
			onFailure: function(data){
				alert('文件上传失败，请减少文件大小或检查网络连接');
				//console.log(data);
			}, //文件上传失败时
			onComplete: function(){

			}, //文件全部上传完毕
			onBefore:function(upObj){
				//upObj.config.uploadUrl="supplier/product/image/upload.json?ie=9&left=0&top=0&height=-1&width=-1&isCustomImage=false";
			}//文件上传前要干啥可以干啥
		});
	},
	_initImageGallery:function(){
		var self = this;
		var imageGallery = this.config.imageGallery;
		var $imgSelectBtn = this.$container.find('.js-image-gallery');
		var $toolContainer = $imgSelectBtn.closest('.tool-item');
		if(!imageGallery || !imageGallery.enabled){
			$toolContainer.hide();
			return;
		}

		this.btn.$imageGallery = $imgSelectBtn;
		if(imageGallery.required){
			$toolContainer.addClass('required')
		}else{
			$toolContainer.removeClass('required')
		}

		if(imageGallery.initFunc && $.isFunction(imageGallery.initFunc)){
			imageGallery.initFunc(self);
		}

	},
	_initFullScreen:function(){
		var self = this;
		var $fullScreenBtn =  this.$container.find('.js-fullscreen-btn');
		var $toolContainer = $fullScreenBtn.closest('.tool-item');
		if(!this.config.fullScreen){
			$toolContainer.hide();
			return;
		}

		$(window).on('resize',function(){
			if(self.isFullScreen){
				self.$content.css({
					height:$(window).height() - self.$tools.height() - parseInt(self.$container.css('padding-bottom'))
				})
			}
		});

		this.btn.$fullScreen = $fullScreenBtn;
		var fullScreenClass = 'fullscreen-btn';
		var normalScreenClass = 'normalscreen-btn';
		var $body = $('body');
		$fullScreenBtn.on('click',function(){
			var $btn = $(this);
			var $toolItem = $btn.closest('tool-item');
			if($btn.hasClass(fullScreenClass)){
				//备份样式

				$btn.removeClass(fullScreenClass).addClass(normalScreenClass);
				$toolItem.attr('title','点击退出全屏编辑');

				self.backupElementStyle(self.$container,['position','left','top','zIndex']);
				self.backupElementStyle(self.$tools,['position']);
				self.backupElementStyle(self.$content,['max-height','margin-top']);
				self.backupElementStyle($body,['height','overflow']);

				self.$container.appendTo($body);
				self.$container.css({
					position:'absolute',
					left:0,
					top:0,
					width:'100%',
					height:'100%',
					zIndex:'5000'
				});

				self.$tools.css({
					position:'fixed',
					width:'100%'
				});


				self.$content.css({
					'max-height':'none',
					height:$(window).height() - self.$tools.height() - parseInt(self.$container.css('padding-bottom')),
					'margin-top':self.$tools.height()
				});

				window.scrollTo(0,0);
				$body.css({
					height:'1px',
					overflow:'hidden'
				});

				self.isFullScreen = true;


			}else{
				self.$targetElement.before(self.$container);

				$btn.removeClass(normalScreenClass).addClass(fullScreenClass);
				$toolItem.attr('title','点击进入全屏编辑');

				self.restoreElementStyle(self.$container);
				self.restoreElementStyle(self.$tools);

				self.restoreElementStyle(self.$content);
				self.$content.css({
					height:'auto'
				});

				self.restoreElementStyle($body);

				self.$container[0].scrollIntoView();

				self.isFullScreen = false;
			}

			self.reRenderTxt();
		});
	},
	getElementStyle:function($el,attrList){
		var styleMap = {};
		if(typeof attrList === 'string'){
			styleMap[attrList] = $el.css(attrList);
		}else if(Array.isArray(attrList)){
			var styleMap = {},key;
			for(var i = attrList.length; i--;){
				key = attrList[i];
				styleMap[key] = $el.css(key);
			}
		}
		return styleMap;
	},
	backupElementStyle:function($element,styleList){
		var lastStyle = this.getElementStyle($element,styleList);
		$element.data('lastStyle',lastStyle);
	},
	restoreElementStyle:function($element){
		var lastStyle = $element.data('lastStyle');
		$element.css(lastStyle);
	},
	createGroup:function(type,index,dir){
		var self=this;
		var g=new GROUP({
			editor:self,
			container:self.$content,
			type:type,
			index:index,
			dir:dir
		});
		//g.editor=self;

		//self.groups.push(g)

		return g;
	},
	//no:成员编号
	delGroup:function(no){
		for(var i=0,l=this.groups.length;i<l;i++){
			if(this.groups[i].No==no){
				this.groups.splice(i,1);
				break;
			}
		}
	},

	loadEditorData:function(data){
		this.$content.empty();
		this.groups.length = 0;
		this.$targetElement.val(data);
		this.renderGroup();
	},

	//编辑器数据初始化
	renderGroup:function(){
		var self=this;
		var val=this.$targetElement.val();
		var dataList = [];
		if($.trim(val)==""){
			val = self.defaultValue;
		}
		try{
			if(Array.isArray(val)){
				dataList = val;
			}else{
				dataList = JSON.parse(val);
			}
		}catch(e){
			//console.log(e);
			alert(this.name+"数据异常");
			return;
		}
		// 插入文本前之前执行
		var beforeRenderGroupsCallback = this.config.beforeRenderGroupsCallback;
		beforeRenderGroupsCallback && $.isFunction(beforeRenderGroupsCallback) && beforeRenderGroupsCallback(this,dataList);

		$.each(dataList,function(i,n){
			switch(n.type){
				case "text":
					self.insertTxt(n.content);
				break;
				case "standardImage":
					var urlArr=n.content.split(",");
					var data=[];
					$.each(urlArr,function(i,n){
						data.push({url:n,needCrop:false})
					});
					self.insertNormalImage({data:data})
				break;
				case "customImage":
					self.insertCustomImage({
						data:[{
							"url":n.content,
							"needCrop":false
						}]
					})
				break;
				case "video":
					self.insertVideo({
							cover : n.cover,
							videoId : n.videoId
					})
				break;
			}
		});
		self.change();
	},
	
	//插入标准图片
	insertNormalImage:function(resp){
		var self=this;
		//当该富文本存在有组对象,并且最后的组对象是标准图像组
		var lastGroup=this.getLastGroup();
		var msg=[];
		if(this.groups.length && lastGroup.type=="NormalImage" ){
			for(var i=0,l=resp.data.length;i<l;i++){
				if(!resp.data[i].url){
					msg.push('"'+resp.data[i].imgName+'",上传失败,'+resp.data[i].msg);
				 continue;
				}
				lastGroup.addItem(
					new IMG({
						type:"normalImage",
						url:decodeURIComponent(resp.data[i].url),
						name:resp.data[i].imgName,
						needCrop:resp.data[i].needCrop,
						msg:resp.data[i].msg,
						group:lastGroup
					})
				);
			};
		}else{

			var g=self.createGroup("NormalImage");
			for(var i=0,l=resp.data.length;i<l;i++){
				//否则,搞新组,
				if(!resp.data[i].url){
					msg.push('"'+resp.data[i].imgName+'",上传失败,'+resp.data[i].msg);
					continue;
				}else{

					g.addItem(new IMG({
						type:"normalImage",
						url:decodeURIComponent(resp.data[i].url),
						name:resp.data[i].imgName,
						msg:resp.data[i].msg,
						needCrop:resp.data[i].needCrop,
						group:g
					}));
				}
			}
		};
	},
	//插入视频
	insertVideo: function (videoObject){
		var g = this.createGroup("video");
		
			g.addItem(new Video({
				type:"video",
				cover : videoObject.cover,
				videoId : videoObject.videoId,
				group:g
			}));
	},
	//插入自定义图片
	insertCustomImage:function(resp){
		var self=this;
		var msg=[];
		for(var i=0,l=resp.data.length;i<l;i++){
			if(!resp.data[i].url){
				msg.push('"'+resp.data[i].imgName+'",上传失败,'+resp.data[i].msg);
			 continue;
			}else{
				var g=self.createGroup("CustomImage");
				try{
					g.addItem(new IMG({
						type:"customImage",
						url:decodeURIComponent(resp.data[i].url),
						name:resp.data[i].imgName,
						msg:resp.data[i].msg,
						needCrop:resp.data[i].needCrop,
						group:g
					}));
				}catch(e){

				}
			}

		};
	},
	insertTxt:function(cont){
		//先建组,因为富文本是单独的组,所以建一个,就生成一个组
			//在建立的组下建立成员
			var g= this.createGroup("text");
			// 插入文本前之前执行
			var beforeInsertTxtCallback = this.config.beforeInsertTxtCallback;
			beforeInsertTxtCallback && $.isFunction(beforeInsertTxtCallback) && beforeInsertTxtCallback(this);
			var txt = new TXT({
				group:g,
				content:cont||"",
				isFreeDaren:window.isFreeDaren || false  //是否是达人自由行产品
			});
			// 插入文本前之后执行
			var afterInsertTxtCallback = this.config.afterInsertTxtCallback;
			afterInsertTxtCallback && $.isFunction(afterInsertTxtCallback) && afterInsertTxtCallback(txt);
			
	},

	reRenderTxt:function(){
		//iframe dom节点移动之后，里面的内容就没了，状态也没了，需要重新渲染一把
		this.groups.forEach(function(grp,index){
			if(grp.type ==='text'){
				grp.items.forEach(function(txtObj,index){
					txtObj.loadEditor();
				})
			}
		})
	}

};
//富文本的剪裁

window.simpleEditorClipDlg={
	init:function(){
		$('body').append(QTMPL.simple_editor_clip.render());
		this.dlg=avalon.define({
			$id:"popup",
			optsDialog:{
				title: '图片裁剪',
				content: '',
				//width: 420,
				onConfirm: function() {},
				onCancel: function() {}
			}

		});


	},
	fire:function(imgItem){
		var self=this;
		this.dlg=avalon.vmodels.clipDialog;
		//XY:剪裁的坐标
		var XY='';


		//图片最小尺寸
		var minSize=[750,500];
		var getXY=function(c){
				XY=c;
		};

		var i=document.createElement("img");
		i.src=imgItem.imgUrl;
		//图宽
		var w=i.width;
		//图高
		var h=i.height;
		function computeWH(w,h){
			var scale=1;
			//图片最大展示高度
			var maxHeight=$(window).height()-120;
			//图片最大展示宽度
			var maxWidth=$(window).width()-50;
			var originalScale=w/h;
			//判断图片实际比例比约定比例的大小
			if(originalScale>minSize[0]/minSize[1]){
				//大的话,按宽度收缩
				scale=(maxWidth/w).toFixed(1)-0;
			}else{
				//小的话,按高度收缩
				scale=(maxHeight/h).toFixed(1)-0;
			}
			return scale;
		};
		//图片加载的收缩值.
		var scale=computeWH(w,h);
		var showWidth=w*scale;
		var showHeight=h*scale;
		this.dlg.width=showWidth+42;
		this.dlg.zIndex=6000;
		this.dlg.setContent('<img style="width:'+showWidth+'px" data-node="clipDialogImg" src="'+imgItem.imgUrl+'">');
		var showSize=[minSize[0]*scale,minSize[1]*scale];

		$('[data-node=clipDialogImg]').Jcrop({
				bgFade: true,
				bgOpacity: .2,
				aspectRatio: 3 / 2,
				allowSelect: false,
				boxWidth:showWidth,
				boxHeight:showHeight,
				minSize:minSize,
				onChange: getXY,
				onSelect: getXY,
				//onRelease: getXY
			}, function() {
				jcrop_api = this;
				jcrop_api.animateTo([10, 10, 760,510]);
			});

		this.dlg.toggle=true;
		this.dlg.onConfirm=function(){
			var w=parseInt((XY.x2-XY.x)/3)*3;
			var h=w*2/3;
			$.ajax({
				url: apiPrefix + '/product/image/crop.json?ie=9',
				data: {
					imgUrl: imgItem.imgUrl,
					left:parseInt(XY.x),
					top	:parseInt(XY.y),
					width:w,
					height:h,
					imgName:imgItem.name
				},
				dataType: 'json',
				success: function(data){
					if(data&&data.ret){
						imgItem.replace([data.data])
						imgItem.img.removeClass("needClip");
						imgItem.showStatus('focus');
						self.dlg.toggle=false;
					}else{
						alert(data.msg);
					}
				},
				error: function(XMLHttpRequest, textStatus, errorThrown) {
					if (textStatus == 'timeout') {

							alert('不好意思，服务器响应超时');

					}
				}
			});
			return false;
		};
	}
};

window.simpleEditorClipDlg.init();
module.exports=EDITOR;
