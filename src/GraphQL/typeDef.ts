import { gql } from 'apollo-server-express';
const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    email: String!
    # password: String!
    posts: [Post!]!
    resetToken: String
    resetTokenExpiry: String
  }
  type Post {
    id: ID!
    title: String!
    content: String!
    author: User!
    comments: [Comment!]!
  }
  type Comment {
    id: ID!
    text: String!
    author: User!
    post: Post!
    replies: [Reply!]!
  }
  type Reply {
    id: ID!
    text: String!
    author: User!
    comment: Comment!
  }
  type AuthPayload {
    status: Int!
    accessToken: String
    refreshToken: String
    user: User
    message: String
  }
  type SignUpAuth {
    user: User
    message: String
  }
  type UpdateUser {
    user: User
    message: String
  }
  type createPostReq{
    post: Post
    message: String
  }
  type createCommentReq{
    comment: Comment
    message: String
  }
  type createReplyReq{
    reply: Reply
    message:String
  }
  type PasswordResetResponse {
    status: Int
    message: String
  }
  type Query {
    user(id: ID!): User
    users: [User!]!
    post(id: ID!): Post
    posts: [Post!]!
    comment(id: ID!): Comment
    comments: [Comment!]!
    reply(id: ID!): Reply
    replies: [Reply!]!
  }
  type Mutation {
    login(username: String!, password: String!): AuthPayload
    signup(username: String!, email: String!, password: String!): SignUpAuth
    deleteUser(id: ID!): String
    updateUser(id: ID!, username: String, email: String): UpdateUser
    updatePassword(id: ID!, newPassword: String!): String
    createPost(title: String!, content: String!): createPostReq
    createComment(text: String!, postId: ID!): createCommentReq
    createReply(text: String!, commentId: ID!): createReplyReq
    
    deletePost(id: ID!): String
    deleteComment(id: ID!): String
    deleteReply(id: ID!): String

    requestPasswordReset(email: String!): PasswordResetResponse
    resetPassword(email: String!, token: String!, newPassword: String!): PasswordResetResponse
    forgetPassword(email: String!): String
  }
`;
export default typeDefs;

// updatePost(id: ID!, title: String, content: String): createPostReq
//     deletePost(id: ID!): String
//     updateComment(id: ID!, text: String): createCommentReq
//     deleteComment(id: ID!): String
//     updateReply(id: ID!, text: String): createReplyReq
//     deleteReply(id: ID!): String
// forgetPassword(email: String!): AuthPayload # This mutation should send an email with a reset link
// forgetPassword(email: String!): PasswordResetResponse