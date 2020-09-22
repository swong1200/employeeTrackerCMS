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
        "View Departments",
        "Quit",
      ],
    })
    .then(function (answer) {
      if (answer.initialChoice === "View All Employees") {
        viewAllEmployees();
      } else if (answer.initialChoice === "View All Employees by Department") {
        viewEmployeesByDept();
      } else if (answer.initialChoice === "View All Employees by Manager") {
        viewEmployeesByMgr();
      } else if (answer.initialChoice === "Add Employee") {
        addEmployee();
      } else if (answer.initialChoice === "Remove Employee") {
        removeEmployee();
      } else if (answer.initialChoice === "Update Employee Role") {
        updateEmployeeRole();
      } else if (answer.initialChoice === "Update Employee Manager") {
        updateEmployeeMgr();
      } else if (answer.initialChoice === "View All Roles") {
        viewRoles();
      } else if (answer.initialChoice === "Add Role") {
        addRole();
      } else if (answer.initialChoice === "Remove Role") {
        removeRole();
      } else if (answer.initialChoice === "Add Department") {
        addDepartment();
      } else if (answer.initialChoice === "View Departments") {
        viewDepartments();
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
        message: "What is the name of the department you would like to add?",
      },
    ])
    .then(function (answer) {
      connection.query(
        "INSERT INTO department SET ?",
        {
          name: answer.deptName,
        },
        function (err) {
          if (err) throw err;
          console.log(answer.deptName);
          start();
        }
      );
    });
}

function viewDepartments() {
  connection.query("SELECT * FROM department", function (err, result) {
    if (err) throw err;
    console.table(result);
    start();
  });
}

function addRole() {
  connection.query("SELECT * FROM department", function (err, result) {
    if (err) throw err;
    inquirer
      .prompt([
        {
          name: "title",
          type: "input",
          message: "What role would you like to add?",
        },
        {
          name: "salary",
          type: "input",
          message: "What is the salary for this role?",
        },
        {
          name: "deptID",
          type: "list",
          message: "Which department is this role for?",
          choices: function () {
            let choiceArray = [];
            for (let index = 0; index < result.length; index++) {
              choiceArray.push(result[index].name);
            }
            return choiceArray;
          },
        },
      ])
      .then(function (answer) {
        console.log(answer);
        let deptChoice;
        for (let index = 0; index < result.length; index++) {
          if (result[index].name === answer.deptID) {
            deptChoice = result[index].id;
          }
        }
        connection.query(
          "INSERT INTO role SET ?",
          {
            title: answer.title,
            salary: answer.salary,
            department_id: deptChoice,
          },
          function (err) {
            if (err) throw err;
            console.log(deptChoice);
            start();
          }
        );
      });
  });
}

function viewRoles() {
  connection.query("SELECT * FROM role", function (err, result) {
    if (err) throw err;
    console.table(result);
    start();
  });
}
