import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();
const { DB_HOST, DB_USER, DB_PORT, DB_PASSWORD, DB_NAME } = process.env;
export const connection = await mysql.createConnection({
  host: DB_HOST,
  user: DB_USER,
  port: DB_PORT,
  password: DB_PASSWORD,
  database: DB_NAME,
});


export const seed = async () => {
  try {
    // Insert initial departments data if it doesn't exist
    await connection.query(`INSERT IGNORE INTO department (id, name) VALUES
    (1, 'Sales'),
    (2, 'Engineering'),
    (3, 'Finance'),
    (4, 'Human Resources')`);

    // Insert initial roles data if it doesn't exist
    await connection.query(`INSERT IGNORE INTO role (id, title, salary, department_id) VALUES
    (1, 'Sales Lead', 100000, 1),
    (2, 'Salesperson', 80000, 1),
    (3, 'Lead Engineer', 150000, 2),
    (4, 'Software Engineer', 120000, 2),
    (5, 'Accountant', 125000, 3),
    (6, 'HR Manager', 95000, 4)`);

    await connection.query(`INSERT IGNORE INTO employee (id, first_name, last_name, role_id, manager_id) VALUES
    (1, 'John', 'Snow', 1, NULL),
    (2, 'Arya', 'Stark', 2, 1),
    (3, 'Jaime', 'Lannister', 3, NULL),
    (4, 'Robert', 'Braratheon', 4, 3),
    (5, 'Khal', 'Drogo', 5, NULL),
    (6, 'Petyr', 'Baelish', 6, NULL)`);
  } catch (error) {
    console.log(`Error seeding database: ${error}`);
  } 
  finally{
    connection.end()
  }
};

seed()