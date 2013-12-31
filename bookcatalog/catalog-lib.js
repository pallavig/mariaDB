var catalog = {};
var mysql = require('mysql');

var commit = function(connection){
	connection.commit(function(err){
		if(err){
			connection.rollback();
			console.log("Commiting failed");
		}
	});
};

var executeQuery = function(query,connection){
	connection.query(query,function(err){
		if(err) throw err;
		console.log("Operation completed");
	});
	commit(connection);
	return 1;
};

var printSelectionResult = function(err,rows,fields){
	var isbns = [];
	var prices = [];
	var authors = [];
	var titles = [];
	var publishers = [];
	var i;
	rows.forEach(function(row){
		isbns.push(row.isbn);
		prices.push(row.price);
		authors.push(row.author);
		titles.push(row.title);
		publishers.push(row.publisher);
	});
	for(i=0;i<rows.length;i++){
		console.log(isbns[i] + "\t" + prices[i] + "\t" + authors[i] + "\t" + titles[i] + "\t" + publishers[i]);
	};
	// console.log(isbns);
};

var getInfoAboutBook = function(bookInfo,whatInfo){
	var getInfo = function(pr,cr){
		var index = cr.indexOf(":");
		var record = [];
		record[0] = cr.substr(0,index).trim();
		record[1] = cr.slice(index+1).trim();
		if(record[0] == whatInfo)
			return record[1];
		return pr;
	};
	return function(){
		return bookInfo.reduce(getInfo,"");
	};
};

catalog.add = function(options,connection){
	// insert into catalog values('001',100,'Jhumpa Lahiri','The Namesake','Harper Collins India');
	var bookInfo = options[1].split(";");
	
	var queryToInsert = "insert into catalog values('" + isbn + "'," + 
		(+price) + ",'" + author + "','" + title + "','" + publisher + "')";
	executeQuery(queryToInsert,connection);
};

catalog.remove = function(options,connection){
	var isbn = options[2];
	var queryToDelete = "delete from catalog where isbn = '" + isbn +"'";
	executeQuery(queryToDelete,connection);
};

catalog.list = function(argv,connection){
	connection.query("select * from catalog",printSelectionResult);
};

catalog.update = function(argv,connection){
	var values = argv[1];
	var values = values.split(';');
	var isbn = values[0].split(':')[1];
	var price = values[1].split(':')[1];
	var author = values[2].split(':')[1];
	var title = values[3].split(':')[1];
	var publisher = values[4].split(':')[1];
	var queryToUpdate = "update catalog set title = '" + title + "',publisher = '" + publisher + "'," 
		+ "author  = '" + author + "'," + "price = " + price + " where isbn = '" + isbn + "';"  
	executeQuery(queryToUpdate,connection);
};

catalog["-author"] = function(argv,connection){
	var queryToselect = "select * from catalog where author = '" + argv[0] + "'";
	connection.query(queryToselect,printSelectionResult);
}

catalog["-isbn"] = function(argv,connection){
	var queryToselect = "select * from catalog where isbn = '" + argv[0] + "'";
	connection.query(queryToselect,printSelectionResult);
};

catalog["-publisher"] = function(argv,connection){
	var queryToselect = "select * from catalog where publisher = '" + argv[0] + "'";
	connection.query(queryToselect,printSelectionResult);
};

catalog["-title"] = function(argv,connection){
	var queryToselect = "select * from catalog where title = '" + argv[0] + "'";
	connection.query(queryToselect,printSelectionResult);	
};

catalog.defaultSearch = function(argv,connection){
	catalog["-author"](argv,connection);
	catalog["-publisher"](argv,connection);
	catalog["-isbn"](argv,connection);
	catalog["-title"](argv,connection);
};

catalog.search = function(argv,connection){
	if(catalog[argv[1]]){
		return catalog[argv[1]](argv.slice(2),connection);
	}
	catalog.defaultSearch(argv,connection);
};

catalog.process = function(argv){
	var connection = mysql.createConnection({
	  host     : 'localhost',
	  user     : 'pallavi',
	  database : 'test',
	  password : 'password'
	});
	var command = argv[0];
	connection.connect();
	catalog[command](argv,connection);
	connection.end();
};

exports.catalog = catalog;