/**
 * @auth yangyufei
 * @date 2018-11-19 20:53:12
 * @desc
 */
const cheerio   = require('cheerio');
const moment    = require('moment');
const _         = require('lodash');
const Promise   = require('bluebird');
const nodemailer= require('nodemailer');
const schedule  = require('node-schedule');

const config    = require('./config');
const helper    = require('./common/helper');
const logger    = require('./common/logger');

class Spider {
	constructor() {
		this.taskList = []; // 任务队列
		this.result = {}; // 抓取结果
		this.errTasks = []; // 失败任务
		this.total = 0; // 任务总数

		let self = this;

		// 生成抓取任务
		config.types.forEach(type => {
			self.result[type.id] = _.merge({}, type, {records: []});
			config.keywords.forEach(keyword => {
				for (let page = 1; page <= 10; page++) self.taskList.push({typeId: type.id, page, keyword, errCount: 0});
			})
		});

		this.total = this.taskList.length;

		// 发送邮箱配置
		this.transporter = nodemailer.createTransport(config.transporter);
	}

	/**
	 * 根据指定的公告类型ID、关键词和页码，抓取公告信息；
	 * @param typeId 公告类型ID
	 * @param page 页码
	 * @param keyword 关键词
	 * @param testMode 测试模式
	 * @return {Promise.<Array>}
	 */
	async getRecordsByTypeAndPage(typeId, page, keyword, testMode = false) {
		let records = [];

		let options = {
			method  : 'POST',
			uri     : `https://b2b.10086.cn/b2b/main/listVendorNoticeResult.html?noticeBean.noticeType=${typeId}`,
			timeout : config.timeout,
			formData: {
				'page.currentPage'      : page,
				'page.perPageSize'      : 50, // 每页50条数据
				'noticeBean.sourceCH'   : '',
				'noticeBean.source'     : '',
				'noticeBean.title'      : keyword,
				'noticeBean.startDate'  : '',
				'noticeBean.endDate'    : ''
			},
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36',
				Referer: 'https://b2b.10086.cn/b2b/main/listVendorNotice.html?noticeType=2'
			},
			transform: body => cheerio.load(body)
		};

		// http请求
		let $ = await helper.requestUrl(options);

		// 解析页面
		$('.zb_result_table > tbody > tr').each(function(index, ele){
			let pass = true;

			$(this).hasClass('zb_table_tr') && (pass = false);
			$(this).find('td').length < 4 && (pass = false);

			if (pass) {
				let id = $(this).attr('onclick').replace(/[^0-9]/ig, '');
				let url = 'https://b2b.10086.cn/b2b/main/viewNoticeContent.html?noticeBean.id=' + id;
				let title = $(this).find('td:nth-child(3)').text().trim();

				let date = $(this).find('td:nth-child(4)').text();
				let tmp = date.split('-');
				let year = tmp[0];
				let month = parseInt(tmp[1]) > 9 ? tmp[1] : '0' + tmp[1];
				let day = parseInt(tmp[2]) > 9 ? tmp[2] : '0' + tmp[2];

				// 只抓取前一天的数据
				(moment(`${year}-${month}-${day}`).diff(moment(), 'days') === -1 || testMode) && records.push({title, url});
			}
		});

		return records;
	}

	/**
	 * 一个并发；
	 * 每个任务最多重试taskRetry次（config.js中配置），失败的任务放入errTasks队列中；
	 * @return {Promise.<void>}
	 */
	async thread() {
		let self = this;

		while(this.taskList.length > 0) {
			let task = this.taskList.pop();

			try {
				let records = await this.getRecordsByTypeAndPage(task.typeId, task.page, task.keyword);

				self.result[task.typeId].records = self.result[task.typeId].records.concat(records);
			} catch (err) {
				logger.error(err);

				task.errCount += 1;

				// 错误重试
				if (task.errCount > config.taskRetry) {
					this.errTasks.push(task);
				} else {
					this.taskList.push(task);
				}
			}
		}
	}

	/**
	 * sendMail方法Promise化
	 * @param mailOptions
	 * @return {Promise.<void>}
	 */
	async sendMail(mailOptions) {
		let self = this;

		await new Promise((resolve, reject) => {
			self.transporter.sendMail(mailOptions, (err, msg) => {
				err ? reject(err) : resolve(msg);
			})
		});
	}

	/**
	 * 发送抓取结果；
	 * @return {Promise.<void>}
	 */
	async sendResult() {
		try {
			let now = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
			let dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;

			let resultHtml = '<b>各位经理，你们好：</b>'
				+ `<p>经过搜索“${config.keywords.join('，')}”关键字，昨日（${moment(moment().add(-1, 'days')).format('YYYY-MM-DD')}）有关在线公司的招标信息清单如下：</p>`;

			let no = 1;
			for (let typeId in this.result) {
				let typeData = this.result[typeId];

				resultHtml += `<p><b>${no}、${typeData.title}</b></p>`;

				if (typeData.records && typeData.records.length > 0) {
					typeData.records.forEach(item => {
						resultHtml += `${item.title}&nbsp&nbsp&nbsp&nbsp${item.url}</br>`;
					});
				} else {
					resultHtml += '<b style="color:red">暂无结果</b></br>';
				}

				no++;
			}
			resultHtml += '</br>请查收！！';

			// 邮件详情
			let mailOptions = {
				from    : config.from,
				to      : config.to,
				subject : `${dateStr}[中国移动招标与采购网]有关在线公司招标公告清单`,
				html    : resultHtml,
			};

			await this.sendMail(mailOptions);

			logger.info(`${moment().format('YYYY-MM-DD HH:mm:ss.SSS')}：抓取结果邮件已经发送，请查收...`);
		} catch(err) {
			logger.error('抓取结果邮件发送失败！！');
			logger.error(err);
		}
	}

	/**
	 * 发送执行错误任务统计邮件；
	 * 如果任务全部执行成功（errTasks队列为空），则不发送此邮件；
	 * 如果收到此邮件，请查看log并排查错误；
	 * 错误统计包括：1.错误任务比例和数量；2.错误的任务数据，json格式并附在附件当中；
	 * @return {Promise.<void>}
	 */
	async sendErrMessage() {
		if (this.errTasks.length < 1) return;

		try {
			let ratio = (this.errTasks.length * 100 / this.total).toFixed(2);
			let html = `<p><b>1、错误任务统计</b><br>错误数量：${this.errTasks.length}；错误比例：${ratio}%；</p>`;
			html += `<p><b>2、错误任务详情</b><br>见附件-错误统计.json</p>`;

			// 邮件详情
			let mailOptions = {
				from    : config.from,
				to      : config.from,
				subject : 'cmcc_b2b抓取错误反馈',
				html,
				attachments: [
					{
						filename    : '错误统计.json',
						content     : JSON.stringify(this.errTasks, null, 4),
						contentType : 'text/plain'
					},
				]
			};

			await this.sendMail(mailOptions);

			logger.info(`${moment().format('YYYY-MM-DD HH:mm:ss.SSS')}：错误统计邮件已经发送，请查收...`);
		} catch (err) {
			logger.error('错误统计邮件发送失败！！');
			logger.error(err);
		}
	}

	/**
	 * 发送规则警告邮件
	 * @return {Promise.<void>}
	 */
	async sendNotification() {
		try {
			let ratio = (this.errTasks.length * 100 / this.total).toFixed(2);
			let html = `<p>招标网站规则发生改变，请及时调整代码！可能导致的原因有：</p>`
			+ '<p>1、http请求接口发生变化：如参数调整、请求方式变化、反爬机制等；</p>'
			+ '<p>2、页面结构发生变化：如html结构以及class调整导致无法定位元素等；</p>';

			// 邮件详情
			let mailOptions = {
				from    : config.from,
				to      : config.from,
				subject : 'cmcc_b2b网站规则变化通知',
				html
			};

			await this.sendMail(mailOptions);

			logger.info(`${moment().format('YYYY-MM-DD HH:mm:ss.SSS')}：规则警告邮件已经发送，请查收...`);
		} catch (err) {
			logger.error('规则警告邮件发送失败！！');
			logger.error(err);
		}
	}

	/**
	 * 测试抓取接口或者页面规则是否发生变化
	 * @return {Promise.<*>}
	 */
	async testRule() {
		// 试5次
		for (let i = 0 ; i < 5; i++) {
			try {
				let tmpRecords = await this.getRecordsByTypeAndPage(1, 1, '', true);

				return tmpRecords && tmpRecords.length > 0;
			} catch (err) {}
		}

		return false;
	}

	/**
	 * 执行任务
	 * @return {Promise.<void>}
	 */
	async run() {
		// 每次执行任务之前首先检查页面接口和规则是否发生变化
		let pass = await this.testRule();

		if (!pass) {
			await this.sendNotification();
			return;
		}

		let ps = [];

		// 根据concurrency（在config.js中进行配置）配置开启多个并发
		for (let i = 0 ; i < config.concurrency; i++) ps.push(this.thread());

		await Promise.all(ps);

		await this.sendResult(); // 发送成功邮件
		await this.sendErrMessage(); // 发送错误任务统计邮件
	}
}

module.exports = Spider;