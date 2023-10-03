import { DataTypes, Model } from 'sequelize';
import sequelize from '../Database/sequelizeConnection';
import User from './user';
import Post from './post';
import Reply from './reply';

class Comment extends Model {}

Comment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    text: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Comment',
  }
);

Comment.belongsTo(User,{
  foreignKey: "userId",
  as: "user",
});
Comment.belongsTo(Post,{
  foreignKey: "postId",
  as: "post",
});

export default Comment;
