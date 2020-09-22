const { createConnection } = require("mysql");

function viewAllEmployees() {
    connection.query("SELECT * FROM employees", function(err,results) {
        if (err) throw err;
        console.table(results);
        start();
    })
}

module.exports = viewAllEmployees;