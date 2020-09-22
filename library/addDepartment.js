const { createConnection } = require("mysql");
const inquirer = require("inquirer");

function addDepartment() {
    inquirer
    .prompt([
        {
            name: "deptName",
            type: "input",
            message: "What is the name of the department you would like to add?"
        }
    ])
    .then(function(answer) {
        connection.query(
            "INSERT INTO department SET ?",
            {
                name: answer.deptName
            },
            function(err) {
                if (err) throw err;
                console.log(answer.deptName);
                connection.end();
            }
        )
    })
}

module.exports = addDepartment;