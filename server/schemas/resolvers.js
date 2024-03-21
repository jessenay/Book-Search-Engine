const apolloServerExpress = require('apollo-server-express');
const models = require('../models');
const authUtils = require('../utils/auth');

const { AuthenticationError } = apolloServerExpress;
const { User } = models;
const { authMiddleware, signToken } = authUtils;

async function getMe(_, __, context) {
  if (!context.user) {
    throw new AuthenticationError('Must login first to view this information.');
  }

  return User.findById(context.user._id).populate('savedBooks');
}

async function loginUser(_, { email, password }) {
  const user = await User.findOne({ email });
  
  if (!user || !(await user.isCorrectPassword(password))) {
    throw new AuthenticationError('Wrong email or password');
  }
  
  return { token: signToken(user), user };
}

async function createUser(_, { username, email, password }) {
  const user = await User.create({ username, email, password });
  return { token: signToken(user), user };
}

async function saveBookToUser(_, { bookData }, context) {
  if (!context.user) {
    throw new AuthenticationError('Log in to save books');
  }
  
  return await User.findByIdAndUpdate(context.user._id, { $push: { savedBooks: bookData } }, { new: true, runValidators: true });
}

async function removeBookFromUser(_, { bookId }, context) {
  if (!context.user) {
    throw new AuthenticationError('Log in to remove books from collection');
  }
  
  return await User.findByIdAndUpdate(context.user._id, { $pull: { savedBooks: { bookId } } }, { new: true }).populate('savedBooks');
}

const resolvers = {
  Query: {
    me: getMe,
  },

  Mutation: {
    login: loginUser,
    addUser: createUser,
    saveBook: saveBookToUser,
    removeBook: removeBookFromUser,
  },
};

module.exports = resolvers;