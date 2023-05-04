# Employee Management System

This is an employee management system built with Node.js, MySQL, and Inquirer.js. The system allows users to view, add, update, and delete employees, departments, and roles.

## Installation
1. Clone the repository: git clone https://github.com/your-username/employee-management-system.git

2. Install dependencies: npm i

3. Create a .env file with your MySQL credentials:

```.env
DB_HOST = HOST_NAME
DB_USER = YOUR_USER_NAME
DB_PORT = PORT_NUMBER
DB_PASSWORD = YOUR_PASSWORD
DB_NAME = "employee_db"
```
 4. Seed the database with sample data: 
 ```
 npm run seed
 ```

## Usage
To start the application,
```bash
npm start
``` 
You will be presented with a series of prompts to manage employees, departments, and roles.

## Features
 - View all employees
 - View employees by department
 - View employees by manager
 - Add employee
 - Update employee role
 - Delete employee
 - View all departments
 - Add department
 - Delete department
 - View all roles
 - Add role
 - Delete role
 - View total utilized budget of a department

## Demo
![demo](Insert_link_to_video_demonstration_here)

## Credits
 - [Inquirer.js](https://www.npmjs.com/package/inquirer/v/8.2.4)
 - [MySQL2 package](https://www.npmjs.com/package/mysql2)
 - [console.table package](https://www.npmjs.com/package/console.table)
 - [dotenv](https://www.npmjs.com/package/dotenv)