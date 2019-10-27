
function BASE(){
	this.dom=$();
}
BASE.prototype={
	del:function(){
		this.dom.remove();
	},
	//dir:方向(up|down)
	moveup:function(dir){
		if(this.editor.getFirstGroup()==this.group&&this.group.getFirst()==this){
			alert("已经置顶了");
			return;
		};
		
		var prevGroup=this.editor.getSiblingGroup("up",this.group.No);
		switch(this.type){
			case "normalImage":
			//当标准图片第一个成员上移时,需要拆组
			if(this.group.getFirst()==this){
				this.group.moveItemOut("up",this.No,this.editor.getGroupIndex(this.group.No)-1);
			}else{
			//否则,组内调整
				this.group.moveItem("up",this.No);
			};
			break;
			case "customImage":
			case "video":
			case "txt":
				if(prevGroup.type=="NormalImage"){
					//如果上一个组是标准图像,那么需要拆组
					
					prevGroup.moveItemOut("down",prevGroup.getLast().No,this.editor.getGroupIndex(this.group.No));
				
				}else{
					this.editor.changeOfPosition(this.group.No,prevGroup.No);
				}
			break;
		}
	},
	movedown:function(){
		//检查
		if(this.editor.getLastGroup()==this.group&&this.group.getLast()==this){
			alert("已经置底了");
			return;
		};
		var nextGroup=this.editor.getSiblingGroup("down",this.group.No);
		switch(this.type){
			case "normalImage":
				//当标准图片最后一个成员下移时,需要拆组
				if(this.group.getLast()==this){
					this.group.moveItemOut("down",this.No,this.editor.getGroupIndex(this.group.No)+1);
				}else{
				//否则,组内调整
					this.group.moveItem("down",this.No);
				};
			break;
			case "customImage":
			case "txt":
				if(nextGroup.type=="NormalImage"){
					//如果下一个组是标准图像,那么需要拆组
					nextGroup.moveItemOut("up",nextGroup.getFirst().No,this.editor.getGroupIndex(this.group.No));
				}else{
					this.editor.changeOfPosition(this.group.No,nextGroup.No);
				}
			
			break;
		}
	},
	insert:function(){
		QNR.event.fire('insert',this);
	}
}

module.exports=BASE;