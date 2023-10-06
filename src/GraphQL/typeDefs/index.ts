// src/GraphQL/TypeDef/index.ts

import userType from './user.typeDefs';
import postType from './post.typeDefs';
import commentType from './comment.typeDefs';
import replyType from './reply.typeDefs';
import { gql } from 'apollo-server-express';

const typeDefs = gql`
  ${userType}
  ${postType}
  ${commentType}
  ${replyType}
`;

export default typeDefs;