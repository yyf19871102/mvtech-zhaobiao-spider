#微智招标爬虫说明文档
##1.部署
###第一步：安装Nodejs环境
[安装教程](https://www.runoob.com/nodejs/nodejs-install-setup.html)（https://www.runoob.com/nodejs/nodejs-install-setup.html）。*注意：*最好使用已经编译好的包，尽量不要源码安装，有坑。
###第二步：设置开发环境变量
	windows：
	在环境变量中加入NODE_ENV，值为production；

	linux：
	修改/etc/profile，并在最后一行加入：export NODE_ENV=production；
	执行：source /etc/profile；
###第三步：安装全局模块
	npm install -g mocha pm2
其中mocha是nodejs的测试框架；pm2是nodejs的应用管理平台；
###第四步：部署爬虫
	1.将爬虫工程解压至指定目录：$appPath
	2.进入工程的根目录$appPath并启动爬虫：pm2 start app.js --name mvtechSpider // --name参数是该应用在pm2里面的名字可自行命名 
至此招标爬虫已经部署成功。
##2.监控与管理
###2.1 查看应用状态
	pm2 list
其中主要指标的有：

* App name：应用名字；
* id：该应用在pm2中的ID号；
* status：online是正常运行状态；stop是停止状态；
* restart：重启次数；
* cpu：cpu使用率；
* mem：占用内存；
###2.2 重启
	pm2 restart mvtechSpider
修改过代码后可以使用该命令重启应用。
###2.3 停止应用
	pm2 stop mvtechSpider
###2.4 删除应用
	pm2 delete mvtechSpider
###2.5 查看应用日志
	pm2 logs mvtechSpider
由于应用托管在pm2上，更多pm2相关说明请参考[http://pm2.keymetrics.io/](http://pm2.keymetrics.io/ "pm2官网")
###2.6 日志文件
日志文件有两类：pm2日志和应用自带日志。两者内容是一样的。

* pm2日志位置：$home/.pm2/logs/
* 应用日志位置：$appPath/logs/

##3.配置与使用
###3.1 配置文件

* 配置文件位置：$appPath/config.js
* 主要需要注意修改的是extension的各个配置属性。其中配置项的具体含义见相关注释。
###3.2 邮件发送说明
该爬虫一共可能发送三种邮件：

* 抓取结果邮件：发送前一天的相关招标信息抓取结果。如果未收该邮件到说明CMCC招标网站接口或是页面结构发生变化，此时应该会收到一封警告（notification）邮件；
* 错误任务统计邮件：如果在执行任务过程中有的任务执行失败，则会将所有失败任务放入一个json文件作为错误统计邮件的附件；另外该错误任务统计邮件会统计失败任务数据和占总任务数的比例。*另：该邮件只会发送给邮件的发送者（一般发送者就是该应用的开发人员/维护人员）。*
* 警告邮件：如果CMCC招标网站接口或是页面结构发生变化，则会发送该邮件提醒开发/维护人员代码需要进行修改。此时将不会再抓取相关信息。*另：该邮件只会发送给邮件的发送者（一般发送者就是该应用的开发人员/维护人员）。*
