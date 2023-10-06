import { AuthenticationError, UserInputError } from 'apollo-server-express';
import Reply from '../../models/reply';
import User from '../../models/user';
import Comment from '../../models/comment';
import { createReplyInterface, deleteInterface } from '../../interface/index';

const replyResolver = {
  Query: {
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
  Mutation: {
    createReply: async (parent: any, args: createReplyInterface, context: any): Promise<{ reply: Reply; message: string }> => {
      try {
        if (!context.user) {
          throw new AuthenticationError('Authentication required');
        }
        const { text, commentId } = args;

        // Validate if the comment exists
        const comment = await Comment.findByPk(commentId);
        if (!comment) {
          throw new UserInputError('Comment not found');
        }

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

        // Check if the authenticated user is the owner of the reply
        if (reply.userId !== context.user.id) {
          throw new AuthenticationError('You do not have permission to delete this reply');
        }

        // Delete the reply
        await reply.destroy();

        return 'Reply deleted successfully';
      } catch (error) {
        throw new UserInputError('Error during reply deletion', { error });
      }
    },
  },
  Reply: {
    author: async (reply: Reply): Promise<User | null> => {
      try {
        return await User.findByPk(reply.userId);
      } catch (error) {
        throw new UserInputError('Error fetching reply author');
      }
    },
    comment: async (reply: Reply): Promise<Comment | null> => {
      try {
        return await Comment.findByPk(reply.commentId);
      } catch (error) {
        throw new UserInputError('Error fetching reply comment');
      }
    },
  },
};

export default replyResolver;