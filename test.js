/**
 * @author yangyufei
 * @date 2019-06-29 08:41:58
 * @desc
 */
const config        = require('./config');
const Spider        = require('./spider');
const helper        = require('./common/helper');
const rp            = require('request-promise');

let options = {
	method  : 'POST',
	uri     : `https://b2b.10086.cn/b2b/main/listVendorNoticeResult.html?noticeBean.noticeType=1`,
	// timeout : config.timeout,
	gzip    : true,
	form    : {
		_qt: 'mY1AjNU2NmZjZ3MDOmZmM1MjY0ITMwQTOiBjM3UDNyM',
		'page.currentPage': 5,
		'page.perPageSize': 20,
		'noticeBean.sourceCH': '',
		'noticeBean.source': '',
		'noticeBean.title': 'grewqhghq25235h',
		'noticeBean.startDate': '',
		'noticeBean.endDate': '',
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
		Cookie: 'saplb_*=(J2EE204289720)204289751; JSESSIONID=RDPVVBk1yK0_fEk01iEQn7ruxg6rawHXNi0M_SAPH8wajExOwFeqwx-NYx3d3Y_s'
	},
};

// rp(options).then(console.log)
new Spider().run();