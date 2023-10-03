import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();
const {
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DB_HOST,
  DB_PORT,
  DB_DIALECT,
} = process.env;

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: DB_HOST,     // Database host
  port: 5432,            // Database port
  username: DB_USER, // Our database username
  password: DB_PASSWORD, // Our database password
  database: DB_NAME,  // Our database name
});

export default sequelize;
