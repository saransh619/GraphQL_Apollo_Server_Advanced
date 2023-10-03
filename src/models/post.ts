import { DataTypes, Model } from 'sequelize';
import sequelize from '../Database/sequelizeConnection';
import User from './user';


class Post extends Model {}

Post.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId:{
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: 'Post',
  }
);

Post.belongsTo(User,{
  foreignKey: "userId",
  as: "user",
})

export default Post;
