var fs  = require('fs'),
	ash = require('./asherah');

fs.readFile(process.argv[2], "utf8", function (err, data) {
	if (err) throw err;
  	var content = JSON.stringify(ash.parse(data));
  	if (process.argv[3]) fs.writeFileSync(process.argv[3], content);
  	else console.log(content);
});