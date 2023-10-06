import { gql } from 'apollo-server-express';

const commentType = gql`
  type Comment {
    id: ID!
    text: String!
    author: User!
    post: Post!
    replies: [Reply!]!
  }

  type createCommentReq {
    comment: Comment
    message: String
  }

  type Query {
    comment(id: ID!): Comment
    comments: [Comment!]!
  }

  type Mutation {
    createComment(text: String!, postId: ID!): createCommentReq
    deleteComment(id: ID!): String
  }
`;

export default commentType;