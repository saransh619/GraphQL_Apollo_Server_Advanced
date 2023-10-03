"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_express_1 = require("apollo-server-express");
const typeDefs = (0, apollo_server_express_1.gql) `
  type User {
    id: ID!
    username: String!
    email: String!
    password: String!
    posts: [Post!]!
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
  }
`;
exports.default = typeDefs;
