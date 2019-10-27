### gcm (女娲) a goddess in Chinese mythology 
--- 
前端工程基库  
目前大多数工程管理颗粒度为模块级，女娲工程可以做到大版本级别。  
文件命名  

\<moduleChildType>.\<moduleName>@\<version>\_\<model>.\<javascriptVersion>  

\_model : "\_jquery" | "\_origin" | "\_react"  
例：
scripts/ui/form.input_counter@1_jquery.es6  
表示  
脚本，ui库目录下 和表单相关的模块，文本框输入计数器，依赖jquery,es6语法，第一版。
当改动输入输出时，版本号应该升级。

如果该模块内置基础数据应该创建文件夹"form.inputer",内再建子文件夹1_query

如果模块来源于npm或git,文件取名不变，但里面只需要写一行require
然后创建一个文件夹与npm上的模块名相同，再建子文件夹为版本如1,该文件夹内有package.json及node_modules

## 目录结构

* scripts
	* origin 原生JS基库
		* polyfill 对原生对象的扩展
		* bom 对客户端类的基库
		* business 业务基库
	* ui 带dom操作的库
	