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
  password: "",
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
        "View All Departments",
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
      } else if (answer.initialChoice === "View All Departments") {
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
    "SELECT EM.id, EM.first_name, EM.last_name, RD.title, RD.department, RD.salary, EM.manager FROM (SELECT E.*, CONCAT(M.first_name, ' ', M.last_name) AS manager FROM employee AS E LEFT JOIN employee AS M ON E.manager_id = M.id) AS EM LEFT JOIN (SELECT R.*, D.name AS department FROM role R LEFT JOIN department D ON R.department_id = D.id) AS RD ON EM.role_id = RD.id",
    function (err, result) {
      if (err) throw err;
      console.table(result);
      start();
    }
  );
}

function viewEmployeesByDept() {
  connection.query(
    "SELECT * FROM department; SELECT EM.id, EM.first_name, EM.last_name, RD.title, RD.department, RD.salary, EM.manager FROM (SELECT E.*, CONCAT(M.first_name, ' ', M.last_name) AS manager FROM employee AS E LEFT JOIN employee AS M ON E.manager_id = M.id) AS EM LEFT JOIN (SELECT R.*, D.name AS department FROM role R LEFT JOIN department D ON R.department_id = D.id) AS RD ON EM.role_id = RD.id",
    [1, 2],
    function (err, result) {
      if (err) throw err;
      let depList = result[0];
      let empList = result[1];
      inquirer
        .prompt([
          {
            name: "deptChoice",
            type: "list",
            message:
              "Which Department would you like to see the Employees for?",
            choices: function () {
              let deptChoiceArray = [];
              for (let index = 0; index < depList.length; index++) {
                deptChoiceArray.push(depList[index].name);
              }
              return deptChoiceArray;
            },
          },
        ])
        .then(function (answer) {
          let viewDept = empList.filter((employee) => {
            return employee.department === answer.deptChoice;
          });
          console.table(viewDept);
          start();
        });
    }
  );
}

function viewEmployeesByMgr() {
  connection.query(
    "SELECT E.id, CONCAT(M.first_name, ' ', M.last_name) AS name FROM employee E JOIN employee M ON E.manager_id = M.id; SELECT EM.id, EM.first_name, EM.last_name, RD.title, RD.department, RD.salary, EM.manager FROM (SELECT E.*, CONCAT(M.first_name, ' ', M.last_name) AS manager FROM employee AS E LEFT JOIN employee AS M ON E.manager_id = M.id) AS EM LEFT JOIN (SELECT R.*, D.name AS department FROM role R LEFT JOIN department D ON R.department_id = D.id) AS RD ON EM.role_id = RD.id",
    [1, 2],
    function (err, result) {
      if (err) throw err;
      let manList = result[0];
      let empList = result[1];
      inquirer
        .prompt([
          {
            name: "manChoice",
            type: "list",
            message: "Which Manager would you like to see the Employees for?",
            choices: function () {
              let manChoiceArray = ["None"];
              manList.forEach((manager) => {
                if (manChoiceArray.indexOf(manager.name) === -1) {
                  manChoiceArray.push(manager.name);
                }
              });
              return manChoiceArray;
            },
          },
        ])
        .then(function (answer) {
          if (answer.manChoice === "None") {
            let viewMgr = empList.filter((employee) => {
              return employee.manager === null;
            });
            console.table(viewMgr);
            start();
          } else {
            let viewMgr = empList.filter((employee) => {
              return employee.manager === answer.manChoice;
            });
            console.table(viewMgr);
            start();
          }
        });
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
  connection.query("SELECT * FROM department", function (err, result) {
    if (err) throw err;
    inquirer
      .prompt([
        {
          name: "deptName",
          type: "list",
          message: "Which Department would you like to remove?",
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
        let deptChoice;
        for (let index = 0; index < result.length; index++) {
          if (result[index].name === answer.deptName) {
            deptChoice = result[index].id;
          }
        }
        connection.query(
          "DELETE FROM department WHERE ?",
          {
            id: deptChoice,
          },
          function (err) {
            if (err) throw err;
            start();
          }
        );
      });
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

function removeRole() {
  connection.query("SELECT * FROM role", function (err, result) {
    if (err) throw err;
    inquirer
      .prompt([
        {
          name: "roleName",
          type: "list",
          message: "Which Role would you like to remove?",
          choices: function () {
            let roleChoiceArray = [];
            for (let index = 0; index < result.length; index++) {
              roleChoiceArray.push(result[index].title);
            }
            return roleChoiceArray;
          },
        },
      ])
      .then(function (answer) {
        let roleChoice;
        for (let index = 0; index < result.length; index++) {
          if (result[index].title === answer.roleName) {
            roleChoice = result[index].id;
          }
        }
        connection.query(
          "DELETE FROM role WHERE ?",
          {
            id: roleChoice,
          },
          function (err) {
            if (err) throw err;
            start();
          }
        );
      });
  });
}

function addEmployee() {
  connection.query(
    "SELECT * FROM role; SELECT id, first_name, last_name FROM employee",
    [1, 2],
    function (err, result) {
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
            choices: function () {
              let roleChoiceArray = [];
              for (let index = 0; index < roleList.length; index++) {
                roleChoiceArray.push(roleList[index].title);
              }
              return roleChoiceArray;
            },
          },
          {
            name: "manID",
            type: "list",
            message: "Who will be the Employee's Manager?",
            choices: function () {
              let manChoiceArray = ["None"];
              for (let index = 0; index < manList.length; index++) {
                manChoiceArray.push(
                  manList[index].first_name + " " + manList[index].last_name
                );
              }
              return manChoiceArray;
            },
          },
        ])
        .then(function (answer) {
          let roleChoice;
          for (let index = 0; index < roleList.length; index++) {
            if (roleList[index].title === answer.roleID) {
              roleChoice = roleList[index].id;
            }
          }
          let manChoice;
          for (let index = 0; index < manList.length; index++) {
            if (
              manList[index].first_name + " " + manList[index].last_name ===
              answer.manID
            ) {
              manChoice = manList[index].id;
            } else {
              manChoice = null;
            }
          }
          connection.query(
            "INSERT INTO employee SET ?",
            {
              first_name: answer.firstName,
              last_name: answer.lastName,
              role_id: roleChoice,
              manager_id: manChoice,
            },
            function (err) {
              if (err) throw err;
              start();
            }
          );
        });
    }
  );
}

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
          let empChoice;
          for (let index = 0; index < empList.length; index++) {
            if (
              empList[index].first_name + " " + empList[index].last_name ===
              answer.emp
            ) {
              empChoice = empList[index].id;
            }
          }
          let roleChoice;
          for (let index = 0; index < roleList.length; index++) {
            if (roleList[index].title === answer.role) {
              roleChoice = roleList[index].id;
            }
          }
          const query = "UPDATE employee SET ? WHERE ?";
          connection.query(
            query,
            [{ role_id: roleChoice }, { id: empChoice }],
            function (err) {
              if (err) throw err;
              start();
            }
          );
        });
    }
  );
}

function updateEmployeeMgr() {
  connection.query("SELECT * FROM employee", function (err, result) {
    if (err) throw err;
    inquirer
      .prompt([
        {
          name: "empName",
          type: "list",
          message: "Which Employee would you like to update?",
          choices: function () {
            let empChoiceArray = [];
            for (let index = 0; index < result.length; index++) {
              empChoiceArray.push(
                result[index].first_name + " " + result[index].last_name
              );
            }
            return empChoiceArray;
          },
        },
        {
          name: "manName",
          type: "list",
          message: "Who will be the Employee's Manager?",
          choices: function () {
            let manChoiceArray = ["None"];
            for (let index = 0; index < result.length; index++) {
              manChoiceArray.push(
                result[index].first_name + " " + result[index].last_name
              );
            }
            return manChoiceArray;
          },
        },
      ])
      .then(function (answer) {
        let empChoice;
        for (let index = 0; index < result.length; index++) {
          if (
            result[index].first_name + " " + result[index].last_name ===
            answer.empName
          ) {
            empChoice = result[index].id;
          }
        }
        let manChoice;
        for (let index = 0; index < result.length; index++) {
          if (
            result[index].first_name + " " + result[index].last_name ===
            answer.manName
          ) {
            manChoice = result[index].id;
          }
        }
        const query = "UPDATE employee SET ? WHERE ?";
        connection.query(
          query,
          [{ manager_id: manChoice }, { id: empChoice }],
          function (err) {
            if (err) throw err;
            start();
          }
        );
      });
  });
}

function removeEmployee() {
  connection.query("SELECT * FROM employee", function (err, result) {
    inquirer
      .prompt([
        {
          name: "empName",
          type: "list",
          message: "Which Employee would you like to remove?",
          choices: function () {
            let empChoiceArray = [];
            for (let index = 0; index < result.length; index++) {
              empChoiceArray.push(
                result[index].first_name + " " + result[index].last_name
              );
            }
            return empChoiceArray;
          },
        },
      ])
      .then(function (answer) {
        let empChoice;
        for (let index = 0; index < result.length; index++) {
          if (
            result[index].first_name + " " + result[index].last_name ===
            answer.empName
          ) {
            empChoice = result[index].id;
          }
        }
        connection.query(
          "DELETE FROM employee WHERE ?",
          {
            id: empChoice,
          },
          function (err) {
            if (err) throw err;
            start();
          }
        );
      });
  });
}
