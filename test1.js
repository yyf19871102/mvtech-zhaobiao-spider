/**
 * @author yangyufei
 * @date 2019-06-29 15:43:10
 * @desc
 */
const {exec, execFile} = require('child_process');

exec('ipconfig', (err, stdout, stderr) => {
	if (!err) {
		stdout && console.log(stdout);
		stderr && console.log(stderr);
	}
});