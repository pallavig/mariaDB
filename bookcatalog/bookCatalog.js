var catalog = require('./catalog-lib.js').catalog;
var main = function(){
	var argv =process.argv.slice(2);
	console.log(argv);
	catalog.process(argv);
};
main();