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
    whatAct();
});

function whatAct() {
    inquirer
        .prompt([
            {
                name: "action",
                type: "list",
                message: "What would you like to do?",
                choices: [
                    "View Products for Sale",
                    "View Low Inventory",
                    "Add to Inventory",
                    "Add New Product",
                ]
            }
        ])

        .then(function (answer) {
            // based on their answer, either call the bid or the post functions
            switch (answer.action) {
                case "View Products for Sale":
                    prodView();
                    break;

                case "View Low Inventory":
                    prodlow();
                    break;

                case "Add to Inventory":
                    prodAdd();
                    break;

                case "Add New Product":
                    prodNew();
                    break;
            }

        });

    function prodView() {
        connection.query("SELECT * FROM products", function (err, res) {
            if (err) throw err;
            // Log all results of the SELECT statement
            console.log('');
            console.log('========================ITEMS IN STORE=======================');
            console.log(res);
            connection.end();
            // whatAct();
        });
    }
    function prodlow() {
        connection.query("SELECT * FROM products WHERE stock_quantity < 5", function (err, res) {
            if (err) throw err;
            // Log all results of the SELECT statement
            console.log('')
            console.log('========================LOW INVENTORY=======================');
            console.log(res);
            connection.end();
            // whatAct();
        });
    }
    function prodAdd() {
        inquirer
            .prompt([
                {
                    name: "id",
                    type: "input",
                    message: "Enter ID of the item would you like to add more of?",
                    validate: function (value) {
                        if (isNaN(value) === false) {
                            return true;
                        }
                        return false;
                    }
                }, {
                    name: "count",
                    type: "input",
                    message: "How many would you like to add?",
                    validate: function (value) {
                        if (isNaN(value) === false) {
                            return true;
                        }
                        return false;
                    }

                }
            ])
            .then(function (answer) {
                connection.query('SELECT * FROM products WHERE ?', { item_id: answer.id }, function (err, res) {
                    var newquan = (res[0].stock_quantity + parseInt(answer.count));
                    //et the information of the chosen item
                    connection.query(
                        "UPDATE products SET ? WHERE ?",
                        [
                            {
                                stock_quantity: newquan
                            },
                            {
                                id: answer.id
                            }
                        ],
                        function (error) {
                            if (error) throw err;
                            console.log('')
                            console.log('===============================================');
                            console.log("Updated successfully!");
                            console.log('');
                            console.log(newquan);
                            console.log('===============================================');

                            whatAct();
                        }
                    );
                });
            })
        
    };
    function prodNew() {
        inquirer
            .prompt([
                {
                    name: "item",
                    type: "input",
                    message: "What item would you like to submit?",
                },
                {
                    name: "dept",
                    type: "input",
                    message: "What department would you like to place your product in?"
                },
                {
                    name: "price",
                    type: "input",
                    message: "What should the price be?",
                    validate: function (value) {
                        if (isNaN(value) === false) {
                            return true;
                        }
                        return false;
                    }
                },
                {
                    name: "stock",
                    type: "input",
                    message: "What is the quantity?",
                    validate: function (value) {
                        if (isNaN(value) === false) {
                            return true;
                        }
                        return false;
                    }
                }

            ])
            .then(function (answer) {
                // when finished prompting, insert a new item into the db with that info
                connection.query(
                    "INSERT INTO products SET ?",
                    {
                        product_name: answer.item,
                        department_name: answer.dept,
                        price: answer.price,
                        stock_quantity: answer.stock
                    },
                    function (err) {
                        if (err) throw err;
                        console.log('');
                        console.log('===============================================');
                        console.log("Your auction was created successfully!");
                        console.log('');
                        console.log('===============================================');

                        whatAct();
                    }
                );
            });
    }
}


