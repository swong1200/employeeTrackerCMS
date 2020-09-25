const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require("console.table");

const connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "jurassic5",
  database: "employeeTracker_db",

  //   Allow multiple statements
  multipleStatements: true,
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
        //   DONE
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
        //   DONE
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
      } else {
        connection.end();
      }
    });
}

function viewAllEmployees() {
  connection.query(
    "SELECT employee.id, employee.first_name, employee.last_name, RD.title, RD.department, RD.salary FROM employee LEFT JOIN (SELECT R.*, D.name AS department FROM role R LEFT JOIN department D ON R.department_id = D.id) AS RD ON employee.role_id = RD.id",
    function (err, result) {
      if (err) throw err;
      console.table(result);
      start();
    }
  );
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
  connection.query("");
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
          choices: function () {
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
  connection.query("SELECT * FROM role; SELECT id, first_name, last_name FROM employee", [1, 2], function (err, result) {
    if (err) throw err;
    let roleList = result[0];
    let manList = result[1];
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
            for (let index = 0; index < roleList.length; index++) {
              roleChoiceArray.push(roleList[index].title);
            }
            return roleChoiceArray;
          }
        },
        {
            name: "manID",
            type: "list",
            message: "Who will be the Employee's Manager?",
            choices: function() {
                let manChoiceArray = ["None"];
                for (let index = 0; index < manList.length; index++) {
                    manChoiceArray.push(manList[index].first_name + " " + manList[index].last_name);
                }
                return manChoiceArray;
            }
        }
      ])
      .then(function (answer) {
        console.log(answer);
        let roleChoice;
        for (let index = 0; index < roleList.length; index++) {
          if (roleList[index].title === answer.roleID) {
            roleChoice = roleList[index].id;
          }
        }
        console.log(roleChoice);
        let manChoice;
        for (let index = 0; index < manList.length; index++) {
            if (manList[index].first_name + " " + manList[index].last_name === answer.manID) {
                manChoice = manList[index].id;
            } else {
                manChoice = null;
            }
        }
        console.log(manChoice);
        connection.query(
          "INSERT INTO employee SET ?",
          {
            first_name: answer.firstName,
            last_name: answer.lastName,
            role_id: roleChoice,
            manager_id: manChoice
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

function updateEmployeeRole() {
  connection.query(
    "SELECT id, first_name, last_name FROM employee; SELECT * FROM role",
    [1, 2],
    function (err, result) {
      if (err) throw err;
      let empList = result[0];
      let roleList = result[1];
      inquirer
        .prompt([
          {
            name: "emp",
            type: "list",
            message: "Which Employee would you like to update?",
            choices: function () {
              let empChoiceArray = [];
              for (let index = 0; index < empList.length; index++) {
                empChoiceArray.push(
                  empList[index].first_name + " " + empList[index].last_name
                );
              }
              return empChoiceArray;
            },
          },
          {
            name: "role",
            type: "list",
            message: "What is the Employee's new Role?",
            choices: function () {
              let roleChoiceArray = [];
              for (let index = 0; index < roleList.length; index++) {
                roleChoiceArray.push(roleList[index].title);
              }
              return roleChoiceArray;
            },
          },
        ])
        .then(function (answer) {
          console.log(answer);
          let empChoice;
          for (let index = 0; index < empList.length; index++) {
            if (
              empList[index].first_name + " " + empList[index].last_name ===
              answer.emp
            ) {
              empChoice = empList[index].id;
            }
          }
          console.log(empChoice);
          let roleChoice;
          for (let index = 0; index < roleList.length; index++) {
            if (roleList[index].title === answer.role) {
              roleChoice = roleList[index].id;
            }
          }
          console.log(roleChoice);
          const query = "UPDATE employee SET ? WHERE ?"
          connection.query(query, [{role_id: roleChoice}, {id: empChoice}], function (err) {
              if (err) throw err;
              start();
            }
          );
        });
    }
  );
}
