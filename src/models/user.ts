import { DataTypes, Model } from 'sequelize';
import sequelize from '../Database/sequelizeConnection';
import Post from './post';

interface UserAttributes {
  id?: number;
  username: string;
  email: string;
  password: string;
  resetToken: string | null; // Allow null for cases where no reset token is set
  resetTokenExpiry: Date | null; // Allow null for cases where no reset token expiry is set
}

class User extends Model<UserAttributes> {
  id!: number;
  username!: string;
  email!: string;
  password!: string;
  resetToken!: string | null;
  resetTokenExpiry!: Date | null;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    resetToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetTokenExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'User',
  }
);

export default User;