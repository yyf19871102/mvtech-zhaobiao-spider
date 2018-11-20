/**
 * @auth yangyufei
 * @date 2018-11-19 17:14:17
 * @desc
 */
const schedule  = require('node-schedule');

const Spider    = require('./spider');
const config    = require('./config');

schedule.scheduleJob(config.cronTab, async () => {
	await new Spider().run();
});