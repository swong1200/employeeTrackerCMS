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
        "Remove Department",
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
        //   DONE
        addEmployee();
      } else if (answer.initialChoice === "Remove Employee") {
        removeEmployee();
      } else if (answer.initialChoice === "Update Employee Role") {
        updateEmployeeRole();
      } else if (answer.initialChoice === "Update Employee Manager") {
        updateEmployeeMgr();
      } else if (answer.initialChoice === "View All Roles") {
        //   DONE
        viewRoles();
      } else if (answer.initialChoice === "Add Role") {
        //   DONE
        addRole();
      } else if (answer.initialChoice === "Remove Role") {
        removeRole();
      } else if (answer.initialChoice === "Add Department") {
        //   DONE
        addDepartment();
      } else if (answer.initialChoice === "View Departments") {
        //   DONE
        viewDepartments();
      } else if (answer.initialChoice === "Remove Department") {
          removeDepartment();
      }
      else {
        connection.end();
      }
    });
}

function viewAllEmployees() {
    connection.query("SELECT * FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id", function(err, result) {
        if (err) throw err;
        console.table(result);
        start();
    });
}

function addDepartment() {
  inquirer
    .prompt([
      {
        name: "deptName",
        type: "input",
        message: "What is the name of the Department you would like to add?",
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

function removeDepartment() {
    connection.query("")
}

function addRole() {
  connection.query("SELECT * FROM department", function (err, result) {
    if (err) throw err;
    inquirer
      .prompt([
        {
          name: "title",
          type: "input",
          message: "What Role would you like to add?",
        },
        {
          name: "salary",
          type: "input",
          message: "What is the salary for this Role?",
        },
        {
          name: "deptID",
          type: "list",
          message: "Which Department is this role for?",
          choices: function() {
            let deptChoiceArray = [];
            for (let index = 0; index < result.length; index++) {
              deptChoiceArray.push(result[index].name);
            }
            return deptChoiceArray;
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

function addEmployee() {
    connection.query("SELECT * FROM role", function (err, result) {
      if (err) throw err;
      inquirer
        .prompt([
          {
            name: "firstName",
            type: "input",
            message: "What is the Employee's first name?",
          },
          {
            name: "lastName",
            type: "input",
            message: "What is the Employee's last name?",
          },
          {
            name: "roleID",
            type: "list",
            message: "What is the Employee's role?",
            choices: function() {
              let roleChoiceArray = [];
              for (let index = 0; index < result.length; index++) {
                roleChoiceArray.push(result[index].title);
              }
              return roleChoiceArray;
            }
          }
        ])
        .then(function (answer) {
          console.log(answer);
          let roleChoice;
          for (let index = 0; index < result.length; index++) {
            if (result[index].title === answer.roleID) {
              roleChoice = result[index].id;
            }
          }
          connection.query(
            "INSERT INTO employee SET ?",
            {
              first_name: answer.firstName,
              last_name: answer.lastName,
              role_id: roleChoice,
            },
            function (err) {
              if (err) throw err;
              start();
            }
          );
        });
    });
  }

//   function whichMgr() {
//     connection.query("SELECT * FROM employee", function (err, result) {
//         if (err) throw err;
//         inquirer
//           .prompt([
//             {
//               name: "mgrID",
//               type: "list",
//               message: "Who will the Employee's manager be?",
//               choices: function() {
//                 let mgrChoiceArray = [];
//                 for (let index = 0; index < result.length; index++) {
//                   mgrChoiceArray.push(result[index].title);
//                 }
//                 return mgrChoiceArray;
//               }
//             }
//         ])
//         .then(function(answer) {
//             console.log(answer)
//         })
//     });
//   }
