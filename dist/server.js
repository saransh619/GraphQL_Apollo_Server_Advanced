"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const apollo_server_express_1 = require("apollo-server-express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const typeDef_1 = __importDefault(require("./GraphQL/typeDef"));
const resolver_1 = __importDefault(require("./GraphQL/resolver"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const PORT = process.env.PORT || 5000;
const app = (0, express_1.default)();
// Middleware to verify JWT token
app.use((req, _, next) => {
    const token = req.headers.authorization;
    const secret = process.env.SECRET_KEY;
    if (token) {
        try {
            const user = jsonwebtoken_1.default.verify(token, secret); // Verify and decode the token
            req.user = user; // Attach the decoded user to the request object
        }
        catch (error) {
            throw new apollo_server_express_1.AuthenticationError('Invalid token');
        }
    }
    next();
});
function startApolloServer() {
    return __awaiter(this, void 0, void 0, function* () {
        const server = new apollo_server_express_1.ApolloServer({
            typeDefs: typeDef_1.default,
            resolvers: resolver_1.default,
            context: ({ req }) => {
                return { user: req.user }; // This makes the user object available in the context
            },
        });
        yield server.start();
        server.applyMiddleware({ app });
        app.listen(PORT, () => {
            console.log(`Server is running at http://localhost:${PORT}${server.graphqlPath}`);
        });
    });
}
startApolloServer();
