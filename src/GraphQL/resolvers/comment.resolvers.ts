import { AuthenticationError, UserInputError } from 'apollo-server-express';
import Comment from '../../models/comment';
import User from '../../models/user';
import Post from '../../models/post';
import Reply from '../../models/reply'; 
import { createCommentInterface, deleteInterface } from '../../interface';

const commentResolver = {
  Query: {
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
  },
  Mutation: {
    createComment: async (parent: any, args: createCommentInterface, context: any): Promise<{ comment: Comment; message: string }> => {
      try {
        if (!context.user) {
          throw new AuthenticationError('Authentication required');
        }
        const { text, postId } = args;

        // Validate if the post exists
        const post = await Post.findByPk(postId);
        if (!post) {
          throw new UserInputError('Post not found');
        }

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

        // Check if the authenticated user is the owner of the comment
        if (comment.userId !== context.user.id) {
          throw new AuthenticationError('You do not have permission to delete this comment');
        }

        // Delete the comment
        await comment.destroy();

        return 'Comment deleted successfully';
      } catch (error) {
        throw new UserInputError('Error during comment deletion', { error });
      }
    },
  },
  Comment: {
    author: async (comment: Comment): Promise<User | null> => {
      try {
        return await User.findByPk(comment.userId);
      } catch (error) {
        throw new UserInputError('Error fetching comment author');
      }
    },
    post: async (comment: Comment): Promise<Post | null> => {
      try {
        return await Post.findByPk(comment.postId);
      } catch (error) {
        throw new UserInputError('Error fetching comment post');
      }
    },
    replies: async (comment: Comment): Promise<Reply[]> => {
      try {
        return await Reply.findAll({ where: { commentId: comment.id } });
      } catch (error) {
        throw new UserInputError('Error fetching comment replies');
      }
    },
  },
};

export default commentResolver;