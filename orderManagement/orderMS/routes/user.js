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
	return 1;
};

var createConnection = function(){
	var connection = mysql.createConnection({
	  host     : 'localhost',
	  user     : 'pallavi',
	  database : 'test',
	  password : 'password'
	});
	connection.connect();
	return connection;
};

exports.home = function(req,res){
	res.render('home');
};

exports.order = function(req,res){
	connection = createConnection();
	var products = [];
	var getSelectionResult = function(err,rows,fields){
		rows.forEach(function(row){
			products.push(row);
		});
		res.render('order',{allproducts:products});
	};
	var query = "select product_id,product_name,unit_price from products";
	connection.query(query,getSelectionResult);
	connection.end();
};

exports.registration = function(req, res){
	var connection = createConnection();
	var name = req.body.name;
	var add1 = req.body.add1;
	var add2 = req.body.add2;
	var city = req.body.city;
	var state = req.body.state;
	var pin = req.body.pin;
	var contact = req.body.contact;
	var queryToAddCustomer = "insert into customer (cust_name,adds1,adds2,city,state,pin,contact) " + 
	"values('" + name + "','" + add1 + "','" + add2 + "','" + city + "','" + state + "',"  +
	pin + "," + contact + ");";
	executeQuery(queryToAddCustomer,connection);
	commit(connection);
	connection.end();
	res.render('home',{givenMessage:"customer added Successfully"});
	res.end();
}

var addOrder = function(cust_id,products,quantities,unit_prices){
	var connection = createConnection();
	var order_id,total_bill = 0,price;
	var query = "select max(order_id) as order_id from orders;";
	var queryToAddOrderItem;
	var queryToAddOrder = "insert into orders(cust_id,date_of_order,date_of_delivery,total_bill) values(" + 
		cust_id + ",current_date,adddate(current_date,1),100);"
	executeQuery(queryToAddOrder,connection);
	connection.query(query,function(err,rows,fields){
		order_id = rows[0].order_id;
		for (var i = 0; i < products.length; i++) {
			price = ((+unit_prices[i]) * (+quantities[i]));
			queryToAddOrderItem = "insert into order_item(order_id,product_id,quantity,price) values(" + 
				order_id + "," + (+products[i]) + "," + (+quantities[i]) + "," + price + ");";
			connection.query(queryToAddOrderItem);
			total_bill = (+total_bill)+price;
		}
		var queryForPayment = "insert into payment (order_id,hasPaid,amount,date_of_payment,payment_mode) values(" +
			order_id + ",'y'," + (+total_bill) + ",current_date,'cash');";
		commit(connection);
	});

};

exports.placeOrder = function(req,res){
	var products = [],quantitiesOfProducts = [],unit_prices = [],product_id,quantity,unit_price;
	var keys = Object.keys(req.body);
	var cust_id = req.body.custId;
	keys.forEach(function(key){
		if(0 == key.indexOf("selection")){
			product_id = key.substring(9);
			quantity = req.body["qty" + product_id];
			unit_price = req.body["price" + product_id];
			products.push(product_id);
			quantitiesOfProducts.push(quantity);
			unit_prices.push(unit_price);
		}
	});
	addOrder(cust_id,products,quantitiesOfProducts,unit_prices);
	res.render('home',{givenMessage:"order added Successfully"});
	res.end();
};