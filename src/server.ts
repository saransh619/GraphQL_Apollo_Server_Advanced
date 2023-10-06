import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import typeDefs from './GraphQL/typeDefs/index';
import { userResolver, postResolver, commentResolver, replyResolver } from './GraphQL/resolvers/index';
import authMiddleware from './middleware/authMiddleware';

const PORT = process.env.PORT || 5000;

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const app = express();

// Use the authentication middleware
app.use(authMiddleware);

async function startApolloServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers: [userResolver, postResolver, commentResolver, replyResolver],
    context: ({ req }) => {
      return { user: req.user };
    },
  });
  await server.start();
  server.applyMiddleware({ app });

  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startApolloServer();
