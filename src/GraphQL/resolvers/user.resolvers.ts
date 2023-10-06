// user.resolvers.ts
import { UserInputError } from 'apollo-server-express';
import bcrypt from 'bcryptjs';
import { AuthenticationError } from 'apollo-server-express';
import { Op } from 'sequelize';
import { SignupInterface, LoginInterface, updateUserInterface, updatePasswordInterface, deleteInterface } from "../../interface/userInterface";
import {User, Post} from '../../models';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
const saltRounds: number = 10; // Explicitly declare the type

dotenv.config();

const secret: string | undefined = process.env.SECRET_KEY;

interface UserPayload {
    id: string;
    username: string;
    email: string;
}
function generateAccessToken(user: any): string {
    const payload: UserPayload = {
        id: user.id,
        username: user.username,
        email: user.email,
    };
    const token: string = jwt.sign(payload, secret as string, {
        expiresIn: '1h',
    });
    return token;
}
function generateRefreshToken(user: any): string {
    const payload: UserPayload = {
        id: user.id,
        username: user.username,
        email: user.email,
    };
    const refreshToken: string = jwt.sign(payload, secret as string, {
        expiresIn: '7d',
    });
    return refreshToken;
}

const userResolver = {
    Query: {
        user: async (parent: any, args: { id: string }): Promise<User | null> => {
            try {
                const { id } = args;
                return await User.findByPk(id);
            } catch (error) {
                throw new UserInputError('Error fetching user by ID');
            }
        },
        users: async (): Promise<User[]> => {
            try {
                return await User.findAll();
            } catch (error) {
                throw new UserInputError('Error fetching users');
            }
        },
    },
    User: {
        posts: async (user: any): Promise<Post[]> => {
          try {
            return await Post.findAll({ where: { userId: user.id } });
          } catch (error) {
            throw new UserInputError('Error fetching user posts');
          }
        },
      },
    Mutation: {
        login: async (parent: any, args: LoginInterface): Promise<any> => {
            try {
                const { username, password } = args;

                // Validate if both username and password are provided and not just blank spaces
                if (!username.trim() || !password.trim()) {
                    const missingFields: string[] = [];

                    if (!username.trim()) missingFields.push('Username');
                    if (!password.trim()) missingFields.push('Password');

                    if (missingFields.length > 0) {
                        const errorMessage = missingFields.length === 1
                            ? `${missingFields[0]} is required`
                            : `${missingFields.join(' and ')} are required`;

                        throw new UserInputError(errorMessage);
                    }
                }

                const user = await User.findOne({
                    where: { username },
                });

                if (!user || !(await bcrypt.compare(password, user.password))) {
                    throw new AuthenticationError('Invalid login credentials');
                }

                const accessToken: string = generateAccessToken(user);
                const refreshToken: string = generateRefreshToken(user);
                return {
                    status: 200,
                    message: 'Login successful',
                    accessToken,
                    refreshToken,
                    user,
                };
            } catch (error: any) {
                return {
                    status: 401,
                    message: error.message,
                }
                // throw new UserInputError(error.message);
            }
        },
        signup: async (parent: any, args: SignupInterface): Promise<any> => {
            try {
                const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,12}$/;
                const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/; // Minimum two characters after the dot
                const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,15}$/;

                const { username, email, password } = args;

                // Validate if username, email, and password are provided
                if (!username.trim() || !email.trim() || !password.trim()) {
                    const missingFields = [];
                    if (!username.trim()) missingFields.push('Username');
                    if (!email.trim()) missingFields.push('Email');
                    if (!password.trim()) missingFields.push('Password');

                    const errorMessage =
                        missingFields.length === 1
                            ? `${missingFields[0]} is required`
                            : `${missingFields.join(', ')} are required`;

                    throw new UserInputError(errorMessage);
                }

                // Validate username length
                if (username.length < 3) {
                    throw new UserInputError('Username must be at least 3 characters');
                }
                if (username.length > 12) {
                    throw new UserInputError('Username must be less than 12 characters');
                }

                // Validate username format
                if (!USERNAME_REGEX.test(username)) {
                    throw new UserInputError('Invalid username');
                }

                // Validate email
                if (!EMAIL_REGEX.test(email)) {
                    throw new UserInputError('Invalid email address');
                }

                // Validate password length
                if (password.length < 8) {
                    throw new UserInputError('Password must be at least 8 characters');
                }
                if (password.length > 15) {
                    throw new UserInputError('Password must be less than 15 characters');
                }

                // Validate password format
                if (!PASSWORD_REGEX.test(password)) {
                    throw new UserInputError('Invalid password');
                }

                // Hash the password before storing it in the database
                const hashedPassword = await bcrypt.hash(password, saltRounds);

                // Check if a user with the same username or email already exists
                const existingUser = await User.findOne({
                    where: {
                        [Op.or]: [{ username }, { email }],
                    },
                });

                if (existingUser) {
                    const takenFields = [];
                    if (existingUser.username === username) takenFields.push('Username');
                    if (existingUser.email === email) takenFields.push('Email');

                    const errorMessage =
                        takenFields.length === 1
                            ? `${takenFields[0]} already taken`
                            : `${takenFields.join(' and ')} already exist`;

                    throw new UserInputError(errorMessage, {
                        invalidArgs: takenFields,
                    });
                }

                const newUser = await User.create({
                    username,
                    email,
                    password: hashedPassword, // Store the hashed password
                });

                return {
                    message: 'Signup successful',
                    user: newUser,
                };
            } catch (error: any) {
                return {
                    status: 409,
                    message: error.message,
                };
            }
        },
        deleteUser: async (parent: any, args: deleteInterface): Promise<string> => {
            const { id } = args;
            try {
                // Find the user
                const user = await User.findByPk(id);
                if (!user) {
                    throw new UserInputError('User not found');
                }

                // Use Sequelize associations to delete associated records
                await user.destroy();

                return 'User and associated records deleted successfully';
            } catch (error) {
                console.error('Error during user deletion:', error);

                // Rethrow the error to maintain the original error message
                throw new UserInputError('Error during user deletion');
            }
        },
        updateUser: async (parent: any, args: updateUserInterface): Promise<any> => {
            try {
                const { id, username, email } = args;
                const user = await User.findByPk(id);
                if (!user) {
                    throw new UserInputError('User not found');
                }
                if (username) {
                    (user as any).username = username;
                }
                if (email) {
                    (user as any).email = email;
                }
                await user.save();
                return {
                    user,
                    message: 'User updated successfully',
                };
            } catch (error) {
                throw new UserInputError('Error during user update');
            }
        },
        updatePassword: async (parent: any, args: updatePasswordInterface): Promise<string> => {
            try {
                const { id, newPassword } = args;
                const user = await User.findByPk(id);

                if (!user) {
                    throw new UserInputError('User not found');
                }

                // Ensure that the new password is not empty
                if (!newPassword) {
                    throw new UserInputError('New password cannot be empty');
                }

                // Hash the new password before updating it in the database
                const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
                user.password = hashedPassword;
                await user.save();

                return 'Password updated successfully';
            } catch (error: any) {
                throw new UserInputError(error);
            }
        },
    }
}

export default userResolver;