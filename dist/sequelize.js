"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const { DB_USER, DB_PASSWORD, DB_NAME, DB_HOST, DB_PORT, DB_DIALECT, } = process.env;
const sequelize = new sequelize_1.Sequelize({
    dialect: 'postgres',
    host: DB_HOST,
    port: 5432,
    username: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME, // Our database name
});
exports.default = sequelize;
