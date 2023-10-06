import { AuthenticationError, UserInputError } from 'apollo-server-express';
import Post from '../../models/post';
import User from '../../models/user';
import Comment from '../../models/comment';
import { createPostInterface, deleteInterface } from '../../interface/index';

const postResolver = {
  Query: {
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
  },
  Mutation: {
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
          message: 'Post created Successfully',
        };
      } catch (error: any) {
        // Check for specific database-related errors
        if (error.name === 'SequelizeDatabaseError') {
          throw new UserInputError('Database error: Unable to create the post');
        }
        throw new UserInputError(error);
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

        // Check if the authenticated user is the owner of the post
        if (post.userId !== context.user.id) {
          throw new AuthenticationError('You do not have permission to delete this post');
        }

        // Delete the post
        await post.destroy();

        return 'Post deleted successfully';
      } catch (error: any) {
        throw new UserInputError(error);
      }
    },
  },
  Post: {
    author: async (post: Post): Promise<User | null> => {
      try {
        return await User.findByPk(post.userId);
      } catch (error) {
        throw new UserInputError('Error fetching post author');
      }
    },
    comments: async (post: Post): Promise<Comment[]> => {
      try {
        return await Comment.findAll({ where: { postId: post.id } });
      } catch (error) {
        throw new UserInputError('Error fetching post comments');
      }
    },
  },
};

export default postResolver;