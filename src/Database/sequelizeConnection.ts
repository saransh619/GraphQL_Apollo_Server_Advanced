import { Dialect, Sequelize } from "sequelize";
import dbConfig from "./dbConfig";

const { username, password, database, host, dialect, port } =
  dbConfig.development;

const sequelize = new Sequelize(database!, username!, password!, {
  host: host,
  port: +port!,
  dialect: dialect! as Dialect,
  logging: false, // Set to true if we want to see SQL queries in the console
});

// Test the database connection
sequelize
  .authenticate()
  .then(() => {
    console.log('Database connection successful!!');
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });

export default sequelize;