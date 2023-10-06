import { gql } from 'apollo-server-express';

const replyType = gql`
  type Reply {
    id: ID!
    text: String!
    author: User!
    comment: Comment!
  }

  type createReplyReq {
    reply: Reply
    message: String
  }

  type Query {
    reply(id: ID!): Reply
    replies: [Reply!]!
  }

  type Mutation {
    createReply(text: String!, commentId: ID!): createReplyReq
    deleteReply(id: ID!): String
  }
`;

export default replyType;