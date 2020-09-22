// const addDepartment = require("./library/addDepartment");
// const viewAllEmployees = require("./library/viewAllEmployees");

const mysql = require("mysql");
const inquirer = require("inquirer");
const consoleTable = require("console.table");

const connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "jurassic5",
  database: "employeeTracker_db",
});

connection.connect(function (err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId);
  start();
});

function start() {
  inquirer
    .prompt({
      name: "initialChoice",
      type: "list",
      message: "What would you like to do?",
      choices: [
        "View All Employees",
        "View All Employees by Department",
        "View All Employees by Manager",
        "Add Employee",
        "Remove Employee",
        "Update Employee Role",
        "Update Employee Manager",
        "View All Roles",
        "Add Role",
        "Remove Role",
        "Add Department",
        "Quit",
      ],
    })
    .then(function (answer) {
      if (answer.initialChoice === "Add Department") {
        addDepartment();
      } else if (answer.initialChoice === "View All Employees") {
        viewAllEmployees();
      } else if (answer.initialChoice === "Add Employee") {
        addEmployee();
      } else if (answer.initialChoice === "Remove Employee") {
        removeEmployee();
      } else {
        connection.end();
      }
    });
}

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
