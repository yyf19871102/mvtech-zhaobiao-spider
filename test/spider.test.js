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
					_qt                     : 'jMmNTZgTN5QmMhNzMlRWOiFmM3gzM1gTZ3YjZlRWN5A',
					'page.currentPage'      : 1,
					'page.perPageSize'      : 50,
					'noticeBean.sourceCH'   : 'gewqge4qghrq3hq235',
					'noticeBean.source'     : '',
					'noticeBean.title'      : '',
					'noticeBean.startDate'  : '',
					'noticeBean.endDate'    : ''
				},
				headers: {
					Host: 'b2b.10086.cn',
					Connection: 'keep-alive',
					'Content-Length': 186,
					Pragma: 'no-cache',
					'Cache-Control': 'no-cache',
					Accept: '*/*',
					Origin: 'https://b2b.10086.cn',
					'X-Requested-With': 'XMLHttpRequest',
					'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36',
					'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
					Referer: 'https://b2b.10086.cn/b2b/main/listVendorNotice.html',
					'Accept-Encoding': 'gzip, deflate, br',
					'Accept-Language': 'zh-CN,zh;q=0.9',
					Cookie: 'saplb_*=(J2EE204290020)204290050; JSESSIONID=6cNVvp15eY01meP9PwknyLKj8NGgawECOC0M_SAPdyw4pHHpXKXESoa101h_oK52'
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