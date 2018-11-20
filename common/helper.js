/**
 * @auth yangyufei
 * @date 2018-06-18 18:45:15
 * @desc
 */
const fs            = require('fs');
const path          = require('path');
const _             = require('lodash');
const Promise       = require('bluebird');
const rp            = require('request-promise');

const logger        = require('../common/logger');
const config        = require('../config');
const {ERROR_OBJ}   = config;

exports.threw = (errObj = ERROR_OBJ.DEFAULT, errMsg = '', errData = {}) => {
	let code = errObj.code && !isNaN(errObj.code) ? errObj.code : ERROR_OBJ.DEFAULT.code;
	let msg = errObj.msg || ERROR_OBJ.DEFAULT.msg;

	let err = new Error(msg);
	err.code = code;
	err.data = errData;

	throw err;
};

/**
 * 带超时的request
 * @param reqConf
 * @returns {Promise<*>}
 */
exports.timeoutRequest = async reqConf => {
	let timeout = reqConf && reqConf.hasOwnProperty('timeout') && !isNaN(reqConf.timeout) && reqConf.timeout > 0 ? reqConf.timeout : null;

	if (timeout) {
		return await new Promise(async (resolve, reject) => {
			try {
				let data = await rp(reqConf);
				resolve(data);
			} catch (err) {
				reject(err);
			}
		}).timeout(timeout);
	} else {
		return await rp(reqConf);
	}
};

/**
 * 请求url辅助方法；如果retryTimes小于1，则表示无限重试！有可能导致死循环，慎用！！
 * @param options
 * @param retryTimes
 * @param checkSuccess
 */
exports.requestUrl = async (options, retryTimes = config.retry, checkSuccess) => {
	// config也可以是方法...
	let requestOption = typeof options === "function" ? options() : options;

	!options.timeout && (options.timeout = options.timeout);

	let lastErrMsg = '';
	let loop = 0;
	while(retryTimes > 0 && loop < retryTimes || retryTimes <= 0) {
		if (retryTimes > 0 && loop > retryTimes) return;

		try {
			let data = await exports.timeoutRequest(requestOption);

			// 验证通过
			if (checkSuccess && typeof checkSuccess === 'function' && checkSuccess(data) || !checkSuccess) {
				return data;
			} else {
				loop += 1;
				retryTimes <= 0 && await Promise.delay(50); // 两期请求直接间隔50毫秒
				lastErrMsg = '请求uri的校验不通过！';
			}
		} catch (err) {
			retryTimes <= 0 && await Promise.delay(50);
			lastErrMsg = err.message;
			err.data = requestOption;

			loop += 1;
		}
	}

	exports.threw(ERROR_OBJ.BAD_REQUEST, lastErrMsg, requestOption);
};