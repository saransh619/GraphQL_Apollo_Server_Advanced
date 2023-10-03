"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const dbconfig_1 = __importDefault(require("./dbconfig"));
const { username, password, database, host, dialect, port } = dbconfig_1.default.development;
const sequelize = new sequelize_1.Sequelize(database, username, password, {
    host: host,
    port: +port,
    dialect: dialect,
    logging: false, // Set to true if we want to see SQL queries in the console
});
//Database connection testing
sequelize.authenticate().then(() => {
    console.log('Database connection successful!!.');
}).catch((err) => {
    console.error('Database Connection unsuccessful!!', err);
});
exports.default = sequelize;
