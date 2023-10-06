import { gql } from 'apollo-server-express';

const userType = gql`
  type User {
    id: ID!
    username: String!
    email: String!
    password: String!
    posts: [Post!]!
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

  type Query {
    user(id: ID!): User
    users: [User!]!
  }

  type Mutation {
    login(username: String!, password: String!): AuthPayload
    signup(username: String!, email: String!, password: String!): SignUpAuth
    deleteUser(id: ID!): String
    updateUser(id: ID!, username: String, email: String): UpdateUser
    updatePassword(id: ID!, newPassword: String!): String
  }
`;

export default userType;