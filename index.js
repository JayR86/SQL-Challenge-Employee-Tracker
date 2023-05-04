import inquirer from "inquirer";
import {
  addDepartment,
  addEmployee,
  addRole,
  deleteDepartment,
  deleteEmployee,
  deleteRole,
  updateEmployeeManager,
  updateEmployeeRole,
  viewAllDepartments,
  viewAllEmployees,
  viewAllRoles,
  viewDeptBudget,
  viewEmployeesByDepartment,
  viewEmployeesByManager,
} from "./controllers/controllers.js";

export const init = async () => {
  inquirer
    .prompt({
      name: "action",
      type: "list",
      message: "What would you like to do?",
      choices: [
        "View all departments",
        "View all roles",
        "View all employees",
        "Add a department",
        "Add a role",
        "Add an employee",
        "Update an employee role",
        "Update employee managers",
        "View employees by manager",
        "View employees by department",
        "Delete employee",
        "Delete role",
        "Delete department",
        "View the total utilized budget of a department",
      ],
    })
    .then((answer) => {
      switch (answer.action) {
        case "View all departments":
          viewAllDepartments();
          break;
        case "View all roles":
          viewAllRoles();
          break;
        case "View all employees":
          viewAllEmployees();
          break;
        case "Add a department":
          addDepartment();
          break;
        case "Add a role":
          addRole();
          break;
        case "Add an employee":
          addEmployee();
          break;
        case "Update an employee role":
          updateEmployeeRole();
          break;
        case "Update employee managers":
          updateEmployeeManager();
          break;
        case "View employees by manager":
          viewEmployeesByManager();
          break;
        case "View employees by department":
          viewEmployeesByDepartment();
          break;

        case "Delete employee":
          deleteEmployee();
          break;
        case "Delete role":
          deleteRole();
          break;
        case "Delete department":
          deleteDepartment();
          break;
        case "View the total utilized budget of a department":
          viewDeptBudget();
          break;
        default:
          console.log(`Invalid action: ${answer.action}`);
      }
    });
};

init();
