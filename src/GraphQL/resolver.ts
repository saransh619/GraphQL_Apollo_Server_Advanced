import users from '../Data/user';
import posts from '../Data/posts';
import comments from '../Data/comments';
import replies from '../Data/replies';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
import { AuthenticationError } from 'apollo-server-express';
const secret:any = process.env.SECRET_KEY;
function generateAccessToken(user: any) {
    
    const payload = {
        id: user.id,
        username: user.username,
        email: user.email,
      };
    const token = jwt.sign(payload, secret ,{
        expiresIn: '1h'
    })
    return token;
  }
  // Function to generate a refresh token to extend the token time
function generateRefreshToken(user: any) {
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
    };
    const refreshToken = jwt.sign(payload, secret, {
      expiresIn: '1d', // Longer expiration time for refresh token
    });
    return refreshToken;
  }
  
  const resolvers = {
    Query: {
        user: (parent: any, args: any) => {
          const { id } = args;
          return users.find((user) => user.id === id);
        },
        users: () => users,
        post: (parent: any, args: any) => {
          const { id } = args;
          return posts.find((post) => post.id === id);
        },
        posts: () => posts,
        comment: (parent: any, args: any) => {
          return comments.find((comment) => comment.id === args.id);
        },
        reply: (parent: any, args: any) => {
          return replies.find((reply) => reply.id === args.id);
        },
      },
      User: {
        posts: (user: any) => {
          return posts.filter((post) => post.authorId === user.id);
        },
      },
      Post: {
        author: (post: any) => {
          return users.find((user) => user.id === post.authorId);
        },
        comments: (post: any) => {
          return comments.filter((comment) => comment.postId === post.id);
        },
      },
        Comment: {
          author: (comment: any) => {
            return users.find((user) => user.id === comment.authorId);
          },
          post: (comment: any) => {
            return posts.find((post) => post.id === comment.postId);
          },
          replies: (comment: any) => {
            return replies.filter((reply) => reply.commentId === comment.id);
          },
        },
        Reply: {
          author: (reply: any) => {
            return users.find((user) => user.id === reply.authorId);
          },
          comment: (reply: any) => {
            return comments.find((comment) => comment.id === reply.commentId);
          },
      },
      Mutation: {
        login: (parent: any, args: any) => {
            const { username, password } = args;
            const user = users.find((u) => u.username === username && u.password === password);
      
            if (!user) {
              throw new AuthenticationError('Invalid login credentials');
            }
      
            // Generate access token and refresh token for the authenticated user
            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);
      
            return {
              message: 'Login successful',
              accessToken,
              refreshToken,
              user,
            };
          },
          signup: (parent: any, args: any) => {
            const { username, email, password } = args;
            // Check if a user with the same username or email already exists
            const existingUser = users.find(
              (user) => user.username === username || user.email === email
            );
      
            if (existingUser) {
              throw new AuthenticationError('User already exists');
            }
            // Create a new user
            const newUser = {
              id: String(users.length + 1),
              username,
              email,
              password,
            };
      
            // Adding the new user
            users.push(newUser);
            const message = 'Signup successful';
            return {
              message,
              user: newUser,
            };
          },
          deleteUser: (parent: any, args: any) => {
            const { id } = args;
            const userIndex = users.findIndex((user) => user.id === id);
        
            if (userIndex === -1) {
              throw new Error('User not found');
            }
            users.splice(userIndex, 1);
        
            return 'User deleted successfully';
          },
          updateUser: (parent: any, args: any) => {
            const { id, username, email } = args;
            const user = users.find((user) => user.id === id);
        
            if (!user) {
              throw new Error('User not found');
            }
        
            // Update the user's properties if provided
            if (username) {
              user.username = username;
            }
        
            if (email) {
              user.email = email;
            }
            
            return {
                user:user,
                message:'User updated Success'
            }
          },
          updatePassword: (parent: any, args: any) => {
            const { id, newPassword } = args;
            const user = users.find((user) => user.id === id);
        
            if (!user) {
              throw new Error('User not found');
            }
        
            // Update the user's password
            user.password = newPassword;
        
            return 'Password updated successfully';
          },
      }
  }
 
export default resolvers;
