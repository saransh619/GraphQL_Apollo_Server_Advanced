import express from 'express';
import { ApolloServer, AuthenticationError } from 'apollo-server-express';
import jwt  from "jsonwebtoken";
import typeDefs from './GraphQL/typeDef';
import resolvers from './GraphQL/resolver';
// import { setupOAuthRoutes } from "./oauth";
import dotenv from 'dotenv';
dotenv.config();
  const PORT = process.env.PORT || 5000;

declare global {
  namespace Express {
    interface Request {
      user?: any; 
    }
  }
}
const app = express();

// Middleware to verify JWT token
app.use((req:any, _, next) => {
  const token = req.headers.authorization;
  const secret: string | undefined = process.env.SECRET_KEY;
  if (token && secret) {
    try {
      const user = jwt.verify(token, secret) as any; // Verify and decode the token
      req.user = user; // Attach the decoded user to the request object
    } catch (error) {
      throw new AuthenticationError('Invalid token');
    }
  }
  
  next();
});

async function startApolloServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => { 
      return { user: req.user }; // This makes the user object available in the context
    },
  });
  await server.start();
  server.applyMiddleware({ app });


  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}${server.graphqlPath}`);
  });
}
startApolloServer();