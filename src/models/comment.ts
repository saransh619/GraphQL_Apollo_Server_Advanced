import { DataTypes, Model } from 'sequelize';
import sequelize from '../Database/sequelizeConnection';
import User from './user';
import Post from './post';

class Comment extends Model {
  public id!: number;
  public text!: string;
  public postId!: number;
  public userId!: number;
}

Comment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    postId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Comment',
  }
);

Comment.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

Comment.belongsTo(Post, {
  foreignKey: 'postId',
  as: 'post',
});

export default Comment;