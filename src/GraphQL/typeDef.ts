import { gql } from 'apollo-server-express';

const typeDefs = gql`
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
  type SignUpAuth{
    user:User
    message: String
  }

  type UpdateUser{
    user:User
    message: String
  }

  type Query {
    user(id: ID!): User
    post(id: ID!): Post
    posts: [Post!]!
    users: [User!]!
    comment(id: ID!): Comment
    reply(id: ID!): Reply
  }
  type Mutation {
    login(username: String!, password: String!): AuthPayload
    signup(username: String!, email: String!, password: String!): SignUpAuth
    deleteUser(id: ID!): String
    updateUser(id: ID!, username: String, email: String): UpdateUser
    updatePassword(id: ID!, newPassword: String!): String
  }
`;

export default typeDefs;
