import { AuthenticationError, UserInputError } from 'apollo-server-express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
import User from '../models/user';
import Post from '../models/post';
import Comment from '../models/comment';
import Reply from '../models/reply';
import { Op } from 'sequelize';
import { LoginInterface, SignupInterface, createCommentInterface, createPostInterface, createReplyInterface, deleteInterface, updatePasswordInterface, updateUserInterface } from '../interfaces';
import bcrypt from 'bcryptjs';
const saltRounds: number = 10; // Explicitly declare the type

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

const resolvers = {
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
    post: async (parent: any, args: { id: string }): Promise<Post | null> => {
      try {
        const { id } = args;
        return await Post.findByPk(id);
      } catch (error) {
        throw new UserInputError('Error fetching post by ID');
      }
    },
    posts: async (): Promise<Post[]> => {
      try {
        return await Post.findAll();
      } catch (error) {
        throw new UserInputError('Error fetching posts');
      }
    },
    comment: async (parent: any, args: { id: string }): Promise<Comment | null> => {
      try {
        return await Comment.findByPk(args.id);
      } catch (error) {
        throw new UserInputError('Error fetching comment by ID');
      }
    },
    comments: async (): Promise<Comment[]> => {
      try {
        return await Comment.findAll();
      } catch (error) {
        throw new UserInputError('Error fetching comments');
      }
    },
    reply: async (parent: any, args: { id: string }): Promise<Reply | null> => {
      try {
        return await Reply.findByPk(args.id);
      } catch (error) {
        throw new UserInputError('Error fetching reply by ID');
      }
    },
    replies: async (): Promise<Reply[]> => {
      try {
        return await Reply.findAll();
      } catch (error) {
        throw new UserInputError('Error fetching replies');
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
  Post: {
    author: async (post: any): Promise<User | null> => {
      try {
        return await User.findByPk(post.userId);
      } catch (error) {
        throw new UserInputError('Error fetching post author');
      }
    },
    comments: async (post: any): Promise<Comment[]> => {
      try {
        return await Comment.findAll({ where: { postId: post.id } });
      } catch (error) {
        throw new UserInputError('Error fetching post comments');
      }
    },
  },
  Comment: {
    author: async (comment: any): Promise<User | null> => {
      try {
        return await User.findByPk(comment.userId);
      } catch (error) {
        throw new UserInputError('Error fetching comment author');
      }
    },
    post: async (comment: any): Promise<Post | null> => {
      try {
        return await Post.findByPk(comment.postId);
      } catch (error) {
        throw new UserInputError('Error fetching comment post');
      }
    },
    replies: async (comment: any): Promise<Reply[]> => {
      try {
        return await Reply.findAll({ where: { commentId: comment.id } });
      } catch (error) {
        throw new UserInputError('Error fetching comment replies');
      }
    },
  },
  Reply: {
    author: async (reply: any): Promise<User | null> => {
      try {
        return await User.findByPk(reply.userId);
      } catch (error) {
        throw new UserInputError('Error fetching reply author');
      }
    },
    comment: async (reply: any): Promise<Comment | null> => {
      try {
        return await Comment.findByPk(reply.commentId);
      } catch (error) {
        throw new UserInputError('Error fetching reply comment');
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

        // if (!user) {
        //   throw new AuthenticationError('Invalid login credentials');
        // }

        // // Verify the entered password with the hashed password stored in the database
        // const passwordMatch = await bcrypt.compare(password, user.password);
        // console.log("passwordMatch", passwordMatch);

        // if (!passwordMatch) {
        //   throw new AuthenticationError('Invalid login credentials..');
        // }

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
          // error: error.message,
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
    createPost: async (parent: any, args: createPostInterface, context: any): Promise<any> => {
      try {
        const user = context.user;
        if (!user) {
          throw new AuthenticationError('Authentication required');
        }
        const { title, content } = args;

        // Check if title and content are provided and not empty
        const isTitleEmpty = !title || title.trim() === '';
        const isContentEmpty = !content || content.trim() === '';

        const errorMessage =
          isTitleEmpty && isContentEmpty
            ? 'Title and content are required fields'
            : isTitleEmpty
              ? 'Title field is required'
              : isContentEmpty
                ? 'Content field is required'
                : '';

        if (errorMessage) {
          throw new UserInputError(errorMessage);
        }

        const post = await Post.create({
          title,
          content,
          userId: user.id, // Set the userId to the authenticated user's id
        });
        return {
          post,
          message: "Post created Successfully",
        };
      } catch (error: any) {
        // Check for specific database-related errors
        if (error.name === 'SequelizeDatabaseError') {
          throw new UserInputError('Database error: Unable to create the post');
        }
        throw new UserInputError(error);
      }
    },
    createComment: async (parent: any, args: createCommentInterface, context: any): Promise<{ comment: Comment; message: string }> => {
      try {
        if (!context.user) {
          throw new AuthenticationError('Authentication required');
        }
        const { text, postId } = args;
        const comment = await Comment.create({
          text,
          postId,
          userId: context.user.id, // Set the userId to the authenticated user's id
        });
        return {
          comment,
          message: 'Comment created successfully',
        };
      } catch (error) {
        throw new UserInputError('Error during comment creation');
      }
    },
    createReply: async (parent: any, args: createReplyInterface, context: any): Promise<{ reply: Reply; message: string }> => {
      try {
        if (!context.user) {
          throw new AuthenticationError('Authentication required');
        }
        const { text, commentId } = args;
        const reply = await Reply.create({
          text,
          commentId,
          userId: context.user.id, // Set the userId to the authenticated user's id
        });
        return {
          reply,
          message: 'Reply created successfully',
        };
      } catch (error) {
        throw new UserInputError('Error during reply creation');
      }
    },
    deletePost: async (parent: any, args: deleteInterface, context: any): Promise<string> => {
      try {
        // Validate if the user is authenticated
        if (!context.user) {
          throw new AuthenticationError('Authentication required');
        }
        const { id } = args;
        // Validate if the post exists
        const post = await Post.findByPk(id);
        if (!post) {
          throw new UserInputError('Post not found');
        }
        // Delete the post
        await post.destroy();
        return 'Post deleted successfully';
      } catch (error: any) {
        throw new UserInputError(error);
      }
    },
    deleteComment: async (parent: any, args: deleteInterface, context: any): Promise<string> => {
      try {
        // Validate if the user is authenticated
        if (!context.user) {
          throw new AuthenticationError('Authentication required');
        }
        const { id } = args;
        // Validate if the comment exists
        const comment = await Comment.findByPk(id);
        if (!comment) {
          throw new UserInputError('Comment not found');
        }
        // Delete the comment
        await comment.destroy();
        return 'Comment deleted successfully';
      } catch (error) {
        throw new UserInputError('Error during comment deletion', { error });
      }
    },
    deleteReply: async (parent: any, args: deleteInterface, context: any): Promise<string> => {
      try {
        // Validate if the user is authenticated
        if (!context.user) {
          throw new AuthenticationError('Authentication required');
        }
        const { id } = args;
        // Validate if the reply exists
        const reply = await Reply.findByPk(id);
        if (!reply) {
          throw new UserInputError('Reply not found');
        }
        // Delete the reply
        await reply.destroy();
        return 'Reply deleted successfully';
      } catch (error) {
        throw new UserInputError('Error during reply deletion', { error });
      }
    },
    // requestPasswordReset: async (_: any, args: { email: any }) => {
    //   try {
    //     const { email } = args;

    //     // Call the requestPasswordReset function from your email service
    //     const result = await requestPasswordReset(_, { email });

    //     return result;
    //   } catch (error) {
    //     console.error('Error in requestPasswordReset resolver:', error);
    //     throw new Error('Failed to send reset link');
    //   }
    // },
    // forgetPassword: async (_:any, args: { email: any }) : Promise<string> => {
    //   try {
    //     const {email} = args;
    //     // Call the forgetPassword function from your email service
    //     const result = await forgetPassword(_, { email });
    //     return result;
    //   } catch (error) {
    //     console.error('Error in forgetPassword resolver:', error);
    //     throw new Error('Failed to forget password');
    //   }
    // },
  }}

export default resolvers;