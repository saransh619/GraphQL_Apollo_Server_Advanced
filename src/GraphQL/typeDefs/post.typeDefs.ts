import { gql } from 'apollo-server-express';

const postType = gql`
  type Post {
    id: ID!
    title: String!
    content: String!
    author: User!
    comments: [Comment!]!
  }

  type createPostReq {
    post: Post
    message: String
  }

  type Query {
    post(id: ID!): Post
    posts: [Post!]!
  }

  type Mutation {
    createPost(title: String!, content: String!): createPostReq
    deletePost(id: ID!): String
  }
`;

export default postType;