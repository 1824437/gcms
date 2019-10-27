require("./string/simple_editor_group.mustache");
/*
 必须:config.container=接收DOM的容器
 必须:config.type:组类型//此组是图像组还是文本组(NormalImage|text|CustomImage
 选填:config.index:dom插入的点
 当有index时,必须有,dir,指明向上插入还是向下插入
 */

function GROUP(config) {
    if (config.type != "NormalImage" 
        && config.type != "text" 
        && config.type != "CustomImage"
        && config.type != "video"
    ) {
        alert("请指定组类型");
        return;
    }
    this.items = [];

    this.type;
    this.config = config;
    this.init(config);
};
GROUP.prototype = {
    constructor: GROUP,
    init: function () {
        this.type = this.config.type;
        this.editor = this.config.editor;

        var str = $(QTMPL.simple_editor_group.render({className: this.type, isColumn: true}));
        this.No = (Math.random() + "").replace("0.", "");

        if (this.config.index != undefined) {
            if (!this.config.dir) {
                return;
            }
            //插入
            if (this.config.dir == "up") {
                //前插
                this.editor.groups.splice(this.config.index, 0, this);
                this.config.container.find('[data-node=groupBox]').eq(this.config.index).before(str);
            } else {
                //后插
                this.editor.groups.splice(this.config.index + 1, 0, this);
                this.config.container.find('[data-node=groupBox]').eq(this.config.index).after(str);
            }

        } else {
            //追加
            this.editor.groups.push(this);
            this.config.container.append(str);
        }

        this.dom = str.find('[data-node="group"]');
        this.box = str;
        //是否有边距
        this.topPadding = false;
        this.bottomPadding = false;
    },
    /*增加组成员
     *item:组成员,
     *dir,如果存在,并且=="down"时,前插,否则,push
     */
    addItem: function (Item, dir) {
        //设置组属性
        Item.group = this;
        //序列追加
        if (dir && dir == "down") {
            this.items.splice(0, 0, Item);
        } else {
            this.items.push(Item);
        }

        //重排
        this.items.length && this.rearrange();
    },
    getFirst: function () {
        return this.items[0];
    },
    getLast: function () {
        return this.items[this.items.length - 1];
    },
    //收集组数据
    getHTMLData: function () {
        var resultList = [];
        var items = this.items, obj;
        for (var i = 0, len = items.length; i < len; i++) {
            obj = items[i];
            resultList.push(obj.getHTMLData());
        }

        return resultList.join('');
    },
    getData: function () {
        //类型定义会影响回显判断类型.
        var type;
        if (this.type == "text") {
            type = "text";
        }
        if (this.type == "NormalImage") {
            type = "standardImage";
        }
        if (this.type == "CustomImage") {
            type = "customImage";
        }
        if (this.type == "video") {
            type = "video";
        }
        var o = {
            type: type,
            topPadding: this.topPadding,
            bottomPadding: this.bottomPadding
        };

        var g_arr = [];
        var items = this.items;
        var items_len = this.items.length;
        //非常重要,moveItemOut方法引发的组没来得及删除,而组成员已被移走的情况必须用这个判断.
        if (!items_len) {
            //回1个空数组吧,不然报错.
            return [];
        }
        switch (this.type) {
            //文本
            case "text":
                g_arr.push($.extend({}, o, items[0].getData()));
                break;
            case "CustomImage":
                o.imageModule = 1;
                g_arr.push($.extend({}, o, items[0].getData()));
                break;
            case "video":
                o.imageModule = 1;
                g_arr.push($.extend({}, o, items[0].getData()));
                break;
            case "NormalImage":
            function getUrl(arr) {
                var a = [];
                for (var i = 0, l = arr.length; i < l; i++) {
                    a.push(arr[i].getData().content);
                }
                return {content: a.join(",")};
            }
                //长度大于1
                if (items_len >= 2) {


                    if (items_len % 2 == 0) {
                        var len = items_len / 2;
                        for (var i = 0; i < len; i++) {
                            var item_o = {};
                            g_arr.push($.extend(item_o,
                                o, getUrl(items.slice(i * 2, i * 2 + 2)), {imageModule: 2}
                            ));
                        }
                    } else {
                        var len = parseInt(items_len / 3);
                        switch (items_len % 3) {
                            case 0:
                                for (var i = 0; i < len; i++) {
                                    var item_o = {};
                                    g_arr.push($.extend(item_o,
                                        o, getUrl(items.slice(i * 3, i * 3 + 3)), {imageModule: 3}
                                    ));
                                }
                                break;
                            case 1:
                                for (var i = 0, l = len - 1; i < l; i++) {

                                    var item_o = {};
                                    g_arr.push($.extend(item_o,
                                        o, getUrl(items.slice(i * 3, i * 3 + 3)), {imageModule: 3}
                                    ));

                                }
                                ;
                                //最以后2排
                                var item_o = {};
                                g_arr.push($.extend(item_o,
                                    o, getUrl(items.slice(items_len - 4, items_len - 2)), {imageModule: 2}
                                ));
                                var item_o = {};
                                g_arr.push($.extend(item_o,
                                    o, getUrl(items.slice(items_len - 2)), {imageModule: 2}
                                ));

                                break;

                            case 2:
                                for (var i = 0, l = len; i < l; i++) {
                                    var item_o = {};
                                    g_arr.push($.extend(item_o,
                                        o, getUrl(items.slice(i * 3, i * 3 + 3)), {imageModule: 3}
                                    ));
                                }
                                ;
                                //最后一排
                                var item_o = {};
                                g_arr.push($.extend(item_o,
                                    o, getUrl(items.slice(items_len - 2)), {imageModule: 2}
                                ));
                                break;
                        }
                    }

                } else {
                    //长度=1;

                    g_arr.push($.extend({imageModule: 1}, o, this.items[0].getData()));
                }

                break;
        }
        return g_arr;
    },
    getItemIndex: function (ItemNo) {
        var index;
        for (var i = 0, len = this.items.length; i < len; i++) {
            if (this.items[i].No == ItemNo) {
                index = i;
                break;
            }
        }
        ;
        return index;
    },
    deleteItem: function (ItemNo) {


        var index = this.getItemIndex(ItemNo);
        this.items[index].del();
        this.items.splice(index, 1);

        //检查组是否还有成员,没有,清除组
        if (!this.items.length) {
            this.del();
        } else {
            this.rearrange();
        }
        ;
    },

    /*此方法用于将某个组元素移出组,流程是:将此组的元素移除,并将移除的元素成立新组,新组插入到指定索引的位置
     *itemNo:将要移除的成员编号
     *groupIndex:新建组需要插入的位置.
     */
    moveItemOut: function (dir, ItemNo, groupIndex) {
        var i = 1;
        if (dir == "up") {
            i = -1;
        }
        //获取当前成员的索引
        var itemIndex = this.getItemIndex(ItemNo);
        //从成员数组中移除这个成员
        var item = this.items.splice(itemIndex, 1)[0];
        //必须先把移除的成员的DOM结构移植,否则DOM消失了,事件消失了
        var siblingGroup = this.editor.groups[Math.max(groupIndex + i, 0)];
        //移出后,判断要插入位置现在的组是什么类型,如果是标准的,需要合并,否则新建组

        if (siblingGroup && siblingGroup.type == "NormalImage") {
            var g = siblingGroup;
        } else {
            var g = this.editor.createGroup("NormalImage", groupIndex, dir);
        }

        g.addItem(item, dir);
        //检查组是否还有成员,没有,清除组
        if (!this.items.length) {
            this.del();
        } else {
            this.rearrange();
        }
        ;

    },
    /*
     *用于标准图像的组内移动
     *dir:方向 up|dowm
     *itemNo:成员编号
     *目前只有移动1步,可以加个参数扩展成移到组内任何位置.
     */

    moveItem: function (dir, itemNo) {
        var index;
        $.each(this.items, function (i, n) {
            if (n.No == itemNo) {
                index = i;
                return false;
            }
        })
        var insertIndex = dir == "up" ? index - 1 : index + 1
        this.items.splice(insertIndex, 0, this.items.splice(index, 1)[0]);
        this.rearrange();
    },
    //重新排列
    rearrange: function () {

        var self = this;
        /*className:传入class用在排列的上层box上.
         *Column:分栏数量
         *domArr,图片对象
         *此方法一次插入一行图片,
         */
        function appendDom(className, domArr) {
            if (!className || !domArr.length) {
                return;
            }
            ;

            var str = $(QTMPL.simple_editor_group.render({className: className}));
            $.each(domArr, function () {
                str.append(this.dom);
                this.autoCenterTool && this.autoCenterTool();
            })

            self.box.append(str);

        };
        var items = self.items;
        var items_len = items.length;

        //显示逻辑1.>=2时
        if (items_len >= 2) {
            //显示逻辑2%2余0时
            if (items_len % 2 == 0) {
                var len = items_len / 2;
                for (var i = 0; i < len; i++) {
                    appendDom("Column2", items.slice(i * 2, i * 2 + 2));
                }
            } else {
                var len = parseInt(items_len / 3);
                switch (items_len % 3) {
                    case 0:
                        for (var i = 0; i < len; i++) {
                            appendDom("Column3", items.slice(i * 3, i * 3 + 3));
                        }
                        break;

                    case 1:
                        for (var i = 0, l = len - 1; i < l; i++) {

                            appendDom("Column3", items.slice(i * 3, i * 3 + 3));

                        }
                        ;
                        //最以后2排
                        appendDom("Column2", items.slice(items_len - 4, items_len - 2));
                        appendDom("Column2", items.slice(items_len - 2));

                        break;

                    case 2:
                        for (var i = 0, l = len; i < l; i++) {
                            appendDom("Column3", items.slice(i * 3, i * 3 + 3));
                        }
                        ;
                        //最后一排
                        appendDom("Column2", items.slice(items_len - 2));
                        break;
                }
            }


        } else {
            //显示逻辑2.<2时

            appendDom("Column1", items);
        }

        self.box.find("[data-node=group]").filter(function () {
            return $(this).children().length == 0
        }).remove();
        self.change();
    },
    del: function () {
        if (this.editor) {
            //删除组绑定
            this.editor.delGroup(this.No);
            this.box.remove();
        }
        ;
        this.editor && this.editor.change();
    },
    //当组有任何变化执行
    change: function () {
        this.editor && this.editor.change(this.type);
    }
}

module.exports = GROUP;
