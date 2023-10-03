"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelizeConnection_1 = __importDefault(require("../Database/sequelizeConnection"));
const user_1 = __importDefault(require("./user"));
class Post extends sequelize_1.Model {
}
Post.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    title: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    content: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false
    }
}, {
    sequelize: sequelizeConnection_1.default,
    modelName: 'Post',
});
Post.belongsTo(user_1.default, {
    foreignKey: "userId",
    as: "user"
});
// Post.belongsTo(User);
// Post.hasMany(Comment);
exports.default = Post;
