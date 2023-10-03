"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelizeConnection_1 = __importDefault(require("../Database/sequelizeConnection"));
const user_1 = __importDefault(require("./user"));
const post_1 = __importDefault(require("./post"));
class Comment extends sequelize_1.Model {
}
Comment.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    text: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
}, {
    sequelize: sequelizeConnection_1.default,
    modelName: 'Comment',
});
Comment.belongsTo(user_1.default, {
    foreignKey: "userId",
    as: "user"
});
Comment.belongsTo(post_1.default, {
    foreignKey: "postId",
    as: "post"
});
exports.default = Comment;
