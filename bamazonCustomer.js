var inquirer = require("inquirer");
var mysql = require("mysql");

var connection = mysql.createConnection({
    host: "127.0.0.1",

    // Your port; if not 3306
    port: 8889,

    // Your username
    user: "root",

    // Your password
    password: "root",
    database: "bamazonDB"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    readProducts();
});

function readProducts() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        // Log all results of the SELECT statement
        console.log(res);
        //   connection.end();
        runOrder();
    });
}


function runOrder() {
    inquirer
        .prompt([
            {
                name: "id",
                type: "input",
                message: "What is the ID of the product they would like to buy?",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            },

            {

                name: "buy",
                type: "input",
                message: "How many units of the product they would like to buy?",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }

            }
        ])
        .then(function(answer) {
            connection.query('SELECT * FROM products WHERE ?', { item_id: answer.id }, function(err, res) {
                if (res[0].stock_quantity < answer.buy) {
                    console.log(res[0].stock_quantity);
                    console.log("Insufficient quantity!...");
                    connection.end();
                } else {
                    totalCost = res[0].price * answer.buy;
                    console.log("You Owe $" + totalCost);
                    // console.log(res[0].stock_quantity);
                    // var sql = mysql.format("UPDATE products SET ? WHERE ?",[{

                    //     stock_quantity: (res[0].stock_quantity - answer.buy)
                    // },{
                    //  item_id: answer.id
                    // }]);
                    // // console.log("-----------!-!-----!!!")
                    // // console.log(sql);
                    var newQuantity =  (res[0].stock_quantity - answer.buy);
                     connection.query("UPDATE products SET ? WHERE ?",[{

                                stock_quantity: newQuantity
                         },{
                             item_id: answer.id
                            }],                            
                        function (error, results) {
                            if (error) throw err;

                            if (results.affectedRows > 0 ) {
                                console.log("stock_quantity: " + newQuantity);
                            }
                            connection.end();
                        }
                    );

                }
            }
        )}
    )
};