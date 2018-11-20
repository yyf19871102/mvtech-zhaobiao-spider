/**
 * @auth yangyufei
 * @date 2018-11-19 17:50:39
 * @desc log4js
 */
const log4js	= require('log4js');

// log4js配置
let config	= {
	appenders   : {
		console : { type: 'console' },  //控制台输出
		file    :{
			type    : 'dateFile',       //文件输出
			filename: 'logs/app.log',   //默认在
			pattern : '.yyyy-MM-dd'
		},
	},
	categories: {
		default     : {appenders: ['console', 'file'], level: 'info'}
	}
};

log4js.configure(config);

module.exports = log4js.getLogger();