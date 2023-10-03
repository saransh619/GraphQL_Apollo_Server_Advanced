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
const apollo_server_express_1 = require("apollo-server-express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const user_1 = __importDefault(require("../models/user"));
const post_1 = __importDefault(require("../models/post"));
const comment_1 = __importDefault(require("../models/comment"));
const reply_1 = __importDefault(require("../models/reply"));
const sequelize_1 = require("sequelize"); // import the Op object from Sequelize
const secret = process.env.SECRET_KEY;
function generateAccessToken(user) {
    const payload = {
        id: user.id,
        username: user.username,
        email: user.email,
    };
    const token = jsonwebtoken_1.default.sign(payload, secret, {
        expiresIn: '1h',
    });
    return token;
}
function generateRefreshToken(user) {
    const payload = {
        id: user.id,
        username: user.username,
        email: user.email,
    };
    const refreshToken = jsonwebtoken_1.default.sign(payload, secret, {
        expiresIn: '7d',
    });
    return refreshToken;
}
const resolvers = {
    Query: {
        user: (parent, args) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const { id } = args;
                return yield user_1.default.findByPk(id);
            }
            catch (error) {
                throw new apollo_server_express_1.UserInputError('Error fetching user by ID');
            }
        }),
        users: () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                return yield user_1.default.findAll();
            }
            catch (error) {
                throw new apollo_server_express_1.UserInputError('Error fetching users');
            }
        }),
        post: (parent, args) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const { id } = args;
                return yield post_1.default.findByPk(id);
            }
            catch (error) {
                throw new apollo_server_express_1.UserInputError('Error fetching post by ID');
            }
        }),
        posts: () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                return yield post_1.default.findAll();
            }
            catch (error) {
                throw new apollo_server_express_1.UserInputError('Error fetching posts');
            }
        }),
        comment: (parent, args) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                return yield comment_1.default.findByPk(args.id);
            }
            catch (error) {
                throw new apollo_server_express_1.UserInputError('Error fetching comment by ID');
            }
        }),
        comments: () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                return yield comment_1.default.findAll();
            }
            catch (error) {
                throw new apollo_server_express_1.UserInputError('Error fetching comments');
            }
        }),
        reply: (parent, args) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                return yield reply_1.default.findByPk(args.id);
            }
            catch (error) {
                throw new apollo_server_express_1.UserInputError('Error fetching reply by ID');
            }
        }),
        replies: () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                return yield reply_1.default.findAll();
            }
            catch (error) {
                throw new apollo_server_express_1.UserInputError('Error fetching replies');
            }
        }),
    },
    User: {
        posts: (user) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                return yield post_1.default.findAll({ where: { userId: user.id } });
            }
            catch (error) {
                throw new apollo_server_express_1.UserInputError('Error fetching user posts');
            }
        }),
    },
    Post: {
        author: (post) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                return yield user_1.default.findByPk(post.userId);
            }
            catch (error) {
                throw new apollo_server_express_1.UserInputError('Error fetching post author');
            }
        }),
        comments: (post) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                return yield comment_1.default.findAll({ where: { postId: post.id } });
            }
            catch (error) {
                throw new apollo_server_express_1.UserInputError('Error fetching post comments');
            }
        }),
    },
    Comment: {
        author: (comment) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                return yield user_1.default.findByPk(comment.userId);
            }
            catch (error) {
                throw new apollo_server_express_1.UserInputError('Error fetching comment author');
            }
        }),
        post: (comment) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                return yield post_1.default.findByPk(comment.postId);
            }
            catch (error) {
                throw new apollo_server_express_1.UserInputError('Error fetching comment post');
            }
        }),
        replies: (comment) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                return yield reply_1.default.findAll({ where: { commentId: comment.id } });
            }
            catch (error) {
                throw new apollo_server_express_1.UserInputError('Error fetching comment replies');
            }
        }),
    },
    Reply: {
        author: (reply) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                return yield user_1.default.findByPk(reply.userId);
            }
            catch (error) {
                throw new apollo_server_express_1.UserInputError('Error fetching reply author');
            }
        }),
        comment: (reply) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                return yield comment_1.default.findByPk(reply.commentId);
            }
            catch (error) {
                throw new apollo_server_express_1.UserInputError('Error fetching reply comment');
            }
        }),
    },
    Mutation: {
        login: (parent, args) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const { username, password } = args;
                const user = yield user_1.default.findOne({
                    where: { username, password },
                });
                if (!user) {
                    throw new apollo_server_express_1.AuthenticationError('Invalid login credentials');
                }
                const accessToken = generateAccessToken(user);
                const refreshToken = generateRefreshToken(user);
                return {
                    message: 'Login successful',
                    accessToken,
                    refreshToken,
                    user,
                };
            }
            catch (error) {
                throw new apollo_server_express_1.UserInputError('Error during login');
            }
        }),
        signup: (parent, args) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const { username, email, password } = args;
                // Check if a user with the same username or email already exists
                const existingUser = yield user_1.default.findOne({
                    where: {
                        [sequelize_1.Op.or]: [{ username }, { email }],
                    },
                });
                if (existingUser) {
                    throw new apollo_server_express_1.UserInputError('User already exists', {
                        invalidArgs: ['username', 'email'],
                    });
                }
                const newUser = yield user_1.default.create({
                    username,
                    email,
                    password,
                });
                return {
                    message: 'Signup successful',
                    user: newUser,
                };
            }
            catch (error) {
                throw new apollo_server_express_1.UserInputError('Error during signup');
            }
        }),
        deleteUser: (parent, args) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const { id } = args;
                const user = yield user_1.default.findByPk(id);
                if (!user) {
                    throw new apollo_server_express_1.UserInputError('User not found');
                }
                yield user.destroy();
                return 'User deleted successfully';
            }
            catch (error) {
                throw new apollo_server_express_1.UserInputError('Error during user deletion');
            }
        }),
        updateUser: (parent, args) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const { id, username, email } = args;
                const user = yield user_1.default.findByPk(id);
                if (!user) {
                    throw new apollo_server_express_1.UserInputError('User not found');
                }
                if (username) {
                    user.username = username;
                }
                if (email) {
                    user.email = email;
                }
                yield user.save();
                return {
                    user,
                    message: 'User updated successfully',
                };
            }
            catch (error) {
                throw new apollo_server_express_1.UserInputError('Error during user update');
            }
        }),
        updatePassword: (parent, args) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const { id, newPassword } = args;
                const user = yield user_1.default.findByPk(id);
                if (!user) {
                    throw new apollo_server_express_1.UserInputError('User not found');
                }
                user.password = newPassword;
                yield user.save();
                return 'Password updated successfully';
            }
            catch (error) {
                throw new apollo_server_express_1.UserInputError('Error during password update');
            }
        }),
        createPost: (parent, args, context) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const user = context.user;
                if (!user) {
                    throw new apollo_server_express_1.AuthenticationError('Authentication required');
                }
                const { title, content } = args;
                // Check if title and content are provided
                if (!title || !content) {
                    throw new apollo_server_express_1.UserInputError('Title and content are required fields');
                }
                const post = yield post_1.default.create({
                    title,
                    content,
                    userId: user.id, // Set the userId to the authenticated user's id
                });
                return {
                    post,
                    message: "Post created Successfully",
                };
            }
            catch (error) {
                // Check for specific database-related errors
                if (error.name === 'SequelizeDatabaseError') {
                    throw new apollo_server_express_1.UserInputError('Database error: Unable to create the post');
                }
                throw new apollo_server_express_1.UserInputError('Error during post creation', { error });
            }
        }),
        createComment: (parent, args, context) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                if (!context.user) {
                    throw new apollo_server_express_1.AuthenticationError('Authentication required');
                }
                const { text, postId } = args;
                const comment = yield comment_1.default.create({
                    text,
                    postId,
                    userId: context.user.id, // Set the userId to the authenticated user's id
                });
                return {
                    comment,
                    message: 'Comment created successfully',
                };
            }
            catch (error) {
                throw new apollo_server_express_1.UserInputError('Error during comment creation');
            }
        }),
        createReply: (parent, args, context) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                if (!context.user) {
                    throw new apollo_server_express_1.AuthenticationError('Authentication required');
                }
                const { text, commentId } = args;
                const reply = yield reply_1.default.create({
                    text,
                    commentId,
                    userId: context.user.id, // Set the userId to the authenticated user's id
                });
                return {
                    reply,
                    message: 'Reply created successfully',
                };
            }
            catch (error) {
                throw new apollo_server_express_1.UserInputError('Error during reply creation');
            }
        }),
    },
};
exports.default = resolvers;
