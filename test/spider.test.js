/**
 * @auth yangyufei
 * @date 2018-11-19 20:36:19
 * @desc
 */
const {expect}      = require('chai');

const config        = require('../config');
const Spider        = require('../spider');
const helper        = require('../common/helper');

describe('spider测试', () => {
	it('测试http请求', async () => {
		let pass = true;
		try {
			let options = {
				method  : 'POST',
				uri     : `https://b2b.10086.cn/b2b/main/listVendorNoticeResult.html?noticeBean.noticeType=1`,
				timeout : config.timeout,
				form: {
					'page.currentPage'      : 1,
					'page.perPageSize'      : 50,
					'noticeBean.sourceCH'   : '在线',
					'noticeBean.source'     : '',
					'noticeBean.title'      : '',
					'noticeBean.startDate'  : '',
					'noticeBean.endDate'    : ''
				},
				headers: {
					'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36',
					Referer: 'https://b2b.10086.cn/b2b/main/searchNotice.html'
				},
			};

			// http请求
			let body = await helper.requestUrl(options);

			body.length < 100 && (pass = false);
		} catch (err) {
			console.error(err);
			pass = false;
		} finally {
			expect(pass).to.be.equal(true);
		}
	});
});