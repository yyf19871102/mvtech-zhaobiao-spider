/**
 * @auth yangyufei
 * @date 2018-11-19 17:19:31
 * @desc
 */
const _     = require('lodash');

const ENV   = process.env.NODE_ENV || 'development';

let config = {
	// 错误相关信息
	ERROR_OBJ   : {
		SUCCESS     : {code: 0, msg: '操作成功！'},

		DEFAULT     : {code: 100, msg: '系统错误！'},
		TIMEOUT     : {code: 101, msg: '请求访问超时！'},
		RETRYOUT    : {code: 102, msg: '超过最大重试次数！'},
		PARSEJSON   : {code: 103, msg: '异常非json数据！'},
		BAD_REQUEST : {code: 104, msg: 'uri请求错误！'},
		BAD_CONFIG  : {code: 105, msg: '配置错误！'},
	},

	timeout     : 240000,    // 访问超时限制，单位毫秒
	retry       : 3,        // http重试次数
	concurrency : 1,       // 并发数量
	taskRetry   : 5,        // 任务重试次数

	// 五种采购信息，可自行添加删除；其中id是该采购信息类型，title是标题；邮件中的顺序按该数组中的顺序排列
	types       : [
		{id: 2, title: '采购公告'},
		{id: 3, title: '资格预审公告'},
		{id: 16, title: '结果公示'},
		{id: 1, title: '单一来源采购信息公告'},
		{id: 8, title: '供应商信息采集公告'},
	],
};

/**
 * 根据环境变量加载配置；
 * 支持：1.development；开发环境，默认环境；
 * 2.production；生产环境；
 *
 * 该配置下如下属性：
 * keywords：array；表示抓取时搜索的关键字；
 * cronTab：string；定时任务cron表达式；
 * transporter：object；发送者邮箱配置；
 *      host：string；smtp地址；
 *      port：number；smtp端口号；
 *      secure：boolean；如果port为465则为true，否则为false；
 *      auth：object；邮箱认证信息；
 *          user：string；邮箱账号；
 *          pass：string；邮箱密码；
 *      from：string；发送人邮箱号；
 *      to：string；收信人（多个收信人使用英文逗号分隔）；
 *
 */
let extension;
switch (ENV) {
	case 'production':
		extension = {
			keywords    : ['在线', '呼叫中心'],
			cronTab     : '0 0 9 * * *',
			transporter : {
				host: 'smtp.163.com',
				port: 465,
				secure:true,
				auth: {
					user: 'yyf19871102@163.com',
					pass: '*****'
				}
			},
			from        : 'yyf19871102@163.com',
			to          : 'yyf19871102@163.com,wuzhou@mvtech.com.cn,zhouhj@mvtech.com.cn,liugx@mvtech.com.cn,zhaoyk@mvtech.com.cn,baihe@mvtech.com.cn,zhangzn@mvtech.com.cn',
		};
		break;
	default :
		extension = {
			keywords    : ['河南'],
			cronTab     : '0 0 9 * * *',
			transporter : {
				host: 'smtp.163.com',
				port: 465,
				secure:true,
				auth: {
					user: 'yyf19871102@163.com',
					pass: '*****'
				}
			},
			from        : 'yyf19871102@163.com',
			to          : 'yyf19871102@163.com',
		};
}

module.exports = _.merge(config, extension);