import { table } from "console";
import { init } from "../index.js";
import inquirer from "inquirer";
import {connection }from "../connection/connection.js";


export const viewAllDepartments = async () => {
  const [rows, fields] = await connection.execute(
    "SELECT id,name FROM department ORDER BY id ASC"
  );
  table(rows);
  continueUse();
};

export const viewAllRoles = async () => {
  const [rows, fields] = await connection.execute(`
    SELECT role.id, role.title, department.name AS department, role.salary
    FROM role
    INNER JOIN department ON role.department_id = department.id
    ORDER BY role.id ASC
  `);
  table(rows);
  continueUse();
};

export const viewAllEmployees = async () => {
  const [rows, fields] = await connection.execute(`
      SELECT employee.id, employee.first_name, employee.last_name, role.title AS role,
      CONCAT(manager.first_name, ' ', manager.last_name) AS manager
      FROM employee
      INNER JOIN role ON employee.role_id = role.id
      LEFT JOIN employee manager ON employee.manager_id = manager.id
      ORDER BY employee.id ASC
    `);
  table(rows);
  continueUse();
};

export const addDepartment = async () => {
  const department = await inquirer.prompt({
    type: "input",
    message: "Enter the name of the department:",
    name: "name",
    validate: function (input) {
      if (!input) {
        return "Please enter a name for the department.";
      }
      return true;
    },
  });
  const [result] = await connection.execute(
    "INSERT INTO department (name) VALUES (?)",
    [department.name]
  );
  console.log(
    `New department with ID ${result.insertId} added to the database.`
  );
  continueUse();
};

export const addRole = async () => {
  const [departments] = await connection.execute("SELECT * FROM department");
  const departmentChoices = departments.map((department) => ({
    name: department.name,
    value: department.id,
  }));
  // Prompt for role information
  const role = await inquirer.prompt([
    {
      type: "input",
      message: "Enter the title of the role:",
      name: "title",
      validate: function (input) {
        if (!input) {
          return "Please enter a title for the role.";
        }
        return true;
      },
    },
    {
      type: "input",
      message: "Enter the salary for the role:",
      name: "salary",
      validate: function (input) {
        if (!input || isNaN(input)) {
          return "Please enter a numeric value for the salary.";
        }
        return true;
      },
    },
    {
      type: "list",
      message: "Select the department for the role:",
      name: "department_id",
      choices: departmentChoices,
    },
  ]);
  const [result] = await connection.execute(
    "INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)",
    [role.title, role.salary, role.department_id]
  );
  console.log(`New role with ID ${result.insertId} added to the database.`);
  continueUse();
};

export const addEmployee = async () => {
  // Get roles from the database
  const [rows] = await connection.execute("SELECT * FROM role");
  const roles = rows.map((row) => ({ name: row.title, value: row.id }));

  // Get managers from the database
  const [rows2] = await connection.execute(
    "SELECT * FROM employee WHERE manager_id IS NULL"
  );
  const managers = rows2.map((row) => ({
    name: `${row.first_name} ${row.last_name}`,
    value: row.id,
  }));

  // Prompt the user for employee information
  const employee = await inquirer.prompt([
    {
      type: "input",
      name: "first_name",
      message: "Enter the employee first name:",
      validate: (input) => {
        if (!input) {
          return "Please enter the employee first name.";
        }
        return true;
      },
    },
    {
      type: "input",
      name: "last_name",
      message: "Enter the employee last name:",
      validate: (input) => {
        if (!input) {
          return "Please enter the employee last name.";
        }
        return true;
      },
    },
    {
      type: "list",
      name: "role_id",
      message: "Select the employee role:",
      choices: roles,
    },
    {
      type: "list",
      name: "manager_id",
      message: "Select the employee manager:",
      choices: [...managers, { name: "None", value: null }],
    },
  ]);
  // Insert the employee into the database
  await connection.execute(
    "INSERT INTO employee (first_name, last_name, role_id,manager_id) VALUES (?, ?, ?, ?)",
    [
      employee.first_name,
      employee.last_name,
      employee.role_id,
      employee.manager_id,
    ]
  );

  console.log("Employee added successfully!");
  continueUse();
};

export const updateEmployeeRole = async () => {
  try {
    // Get all employees
    const [employees] = await connection.execute("SELECT * FROM employee");
    const employeeChoices = employees.map(({ id, first_name, last_name }) => ({
      name: `${first_name} ${last_name}`,
      value: id,
    }));

    // Get all roles
    const [roles] = await connection.execute("SELECT * FROM role");
    const roleChoices = roles.map(({ id, title }) => ({
      name: title,
      value: id,
    }));

    // Prompt user to select an employee to update and their new role
    const { employeeId, roleId } = await inquirer.prompt([
      {
        type: "list",
        name: "employeeId",
        message: "Which employee would you like to update?",
        choices: employeeChoices,
      },
      {
        type: "list",
        name: "roleId",
        message:
          "Which role would you like to assign to the selected employee?",
        choices: roleChoices,
      },
    ]);

    // Update the employee's role
    await connection.execute("UPDATE employee SET role_id = ? WHERE id = ?", [
      roleId,
      employeeId,
    ]);

    console.log("\nEmployee role updated successfully.\n");
  } catch (err) {
    console.log("Error updating employee role: ", err);
  } finally {
    continueUse();
  }
};

export const viewEmployeesByManager = async () => {
  // Get list of managers
  const [rows] = await connection.execute(
    "SELECT * FROM employee WHERE manager_id IS NULL"
  );
  const managers = rows.map(({ id, first_name, last_name }) => ({
    name: `${first_name} ${last_name}`,
    value: id,
  }));

  // Ask user to select a manager
  const { managerId } = await inquirer.prompt([
    {
      type: "list",
      name: "managerId",
      message: "Select a manager to view employees:",
      choices: managers,
    },
  ]);

  // Get employees for selected manager
  const [employeeRows] = await connection.execute(
    "SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary FROM employee e JOIN role r ON e.role_id = r.id JOIN department d ON r.department_id = d.id WHERE e.manager_id = ?",
    [managerId]
  );

  // Display employee data in a table
  table(employeeRows);
  continueUse();
};

export const viewEmployeesByDepartment = async () => {
  try {
    // Get the list of departments
    const [departments] = await connection.execute(
      "SELECT id, name FROM department"
    );

    // Prompt user to select a department
    const departmentChoices = departments.map(({ id, name }) => ({
      name,
      value: id,
    }));

    const { departmentId } = await inquirer.prompt([
      {
        type: "list",
        message: "Select a department to view employees:",
        name: "departmentId",
        choices: departmentChoices,
      },
    ]);

    // Get the list of employees by department
    const [employees] = await connection.execute(
      `SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, department.name AS department, CONCAT(manager.first_name, ' ', manager.last_name) AS manager
         FROM employee
         LEFT JOIN role ON employee.role_id = role.id
         LEFT JOIN department ON role.department_id = department.id
         LEFT JOIN employee manager ON employee.manager_id = manager.id
         WHERE department.id = ?`,
      [departmentId]
    );

    // Display the list of employees
    table(employees);
    continueUse();
  } catch (error) {
    console.error(error);
    continueUse();
  }
};

export const updateEmployeeManager = async () => {
  // Get all employees from database
  const [rows] = await connection.execute("SELECT * FROM employee");
  const employees = rows.map((employee) => ({
    name: `${employee.first_name} ${employee.last_name}`,
    value: employee.id,
  }));

  // Prompt user to select an employee to update
  const { employeeId } = await inquirer.prompt({
    type: "list",
    message: "Select an employee to update:",
    name: "employeeId",
    choices: employees,
  });

  // Get all employees except for the selected employee
  const [rows2] = await connection.execute(
    "SELECT * FROM employee WHERE id != ?",
    [employeeId]
  );
  const managers = rows2.map((employee) => ({
    name: `${employee.first_name} ${employee.last_name}`,
    value: employee.id,
  }));

  // Prompt user to select a new manager for the employee
  const { managerId } = await inquirer.prompt({
    type: "list",
    message: "Select a new manager for the employee:",
    name: "managerId",
    choices: managers,
  });

  // Update the employee's manager in the database
  await connection.execute("UPDATE employee SET manager_id = ? WHERE id = ?", [
    managerId,
    employeeId,
  ]);
  console.log("Employee manager updated successfully.");
  continueUse();
};

export const deleteDepartment = async () => {
  // Prompt user to select department to delete
  const [departments] = await connection.execute(
    "SELECT id, name FROM department"
  );

  // Prompt user to select a department
  const departmentChoices = departments.map(({ id, name }) => ({
    name,
    value: id,
  }));
  const { departmentId } = await inquirer.prompt([
    {
      type: "list",
      name: "departmentId",
      message: "Which department would you like to delete?",
      choices: departmentChoices,
    },
  ]);

  // Confirm deletion with user
  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: `Are you sure you want to delete department with ID ${departmentId}?`,
      default: false,
    },
  ]);

  // Delete department if user confirms
  if (confirm) {
    try {
      const [result] = await connection.execute(
        "DELETE FROM department WHERE id = ?",
        [departmentId]
      );
      if (result.affectedRows > 0) {
        console.log(
          `Department with ID ${departmentId} has been deleted successfully.`
        );
      } else {
        console.log(`Department with ID ${departmentId} does not exist.`);
      }
    } catch (err) {
      console.error(`Failed to delete department with ID ${departmentId}.`);
    }
  } else {
    console.log("Department deletion has been cancelled.");
  }
  continueUse();
};

export const deleteRole = async () => {
  // Prompt user to select role to delete
  const [roles] = await connection.execute("SELECT * FROM role");
  const roleChoices = roles.map(({ id, title }) => ({
    name: title,
    value: id,
  }));
  const { roleId } = await inquirer.prompt([
    {
      type: "list",
      name: "roleId",
      message: "Which role would you like to delete?",
      choices: roleChoices,
    },
  ]);

  // Confirm deletion with user
  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: `Are you sure you want to delete role with ID ${roleId}?`,
      default: false,
    },
  ]);

  // Delete role if user confirms
  if (confirm) {
    try {
      const [result] = await connection.execute(
        "DELETE FROM role WHERE id = ?",
        [roleId]
      );
      if (result.affectedRows > 0) {
        console.log(`Role with ID ${roleId} has been deleted successfully.`);
      } else {
        console.log(`Role with ID ${roleId} does not exist.`);
      }
    } catch (err) {
      console.log(err);
      console.error(`Failed to delete role with ID ${roleId}.`);
    }
  } else {
    console.log("Role deletion has been cancelled.");
  }
  continueUse();
};

export const deleteEmployee = async () => {
  try {
    // Prompt user to select employee to delete
    const [employees] = await connection.execute("SELECT * FROM employee");
    const employeeChoices = employees.map(({ id, first_name, last_name }) => ({
      name: `${first_name} ${last_name}`,
      value: id,
    }));
    const { employeeId } = await inquirer.prompt([
      {
        type: "list",
        name: "employeeId",
        message: "Which employee would you like to delete?",
        choices: employeeChoices,
      },
    ]);

    // Confirm deletion with user
    const { confirm } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        message: `Are you sure you want to delete employee with ID ${employeeId}?`,
        default: false,
      },
    ]);

    // Delete employee if user confirms
    if (confirm) {
      const [result] = await connection.execute(
        "DELETE FROM employee WHERE id = ?",
        [employeeId]
      );
      if (result.affectedRows > 0) {
        console.log(
          `Employee with ID ${employeeId} has been deleted successfully.`
        );
      } else {
        console.log(
          `Could not find employee with ID ${employeeId}. Please try again.`
        );
      }
    }
  } catch (error) {
    console.error(`Error deleting employee: ${error}`);
  } finally {
    continueUse();
  }
};

export const viewDeptBudget = async () => {
  // Prompt user to select department to view budget for
  const [departments] = await connection.execute(
    "SELECT id, name FROM department"
  );

  // Prompt user to select a department
  const departmentChoices = departments.map(({ id, name }) => ({
    name,
    value: id,
  }));
  const { departmentId } = await inquirer.prompt([
    {
      type: "list",
      name: "departmentId",
      message: "Which department would you like to view the budget for ?",
      choices: departmentChoices,
    },
  ]);

  // Query the database for the total utilized budget of the department
  const [rows] = await connection.execute(
    `SELECT SUM(salary) AS budget
       FROM employee
       INNER JOIN role ON employee.role_id = role.id
       WHERE role.department_id = ?`,
    [departmentId]
  );
  // Log the budget to the console
  console.log(
    `The total utilized budget for department ${departmentId} is $${rows[0].budget}`
  );
  continueUse();
};

const continueUse = async () => {
  const { continueUsing } = await inquirer.prompt([
    {
      type: "confirm",
      name: "continueUsing",
      message: "Would you like to continue using the application?",
      default: true,
    },
  ]);

  if (continueUsing) {
    await init();
  } else {
    console.log("Goodbye!");
    connection.end();
  }
};
