//const apolloServerExpress = require('apollo-server-express');
const models = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth');

//const { AuthenticationError } = apolloServerExpress;
const { User } = models;
//const { authMiddleware, signToken } = authUtils;

/*async function getMe(_, __, context) {
  if (!context.user) {
    throw new AuthenticationError('Must login first to view this information.');
  }

  return User.findById(context.user._id).populate('savedBooks');
}*/

async function loginUser(_, { email, password }) {
  const user = await User.findOne({ email });
  
  if (!user || !(await user.isCorrectPassword(password))) {
    throw new AuthenticationError('Wrong email or password');
  }
  
  return { token: signToken(user), user };
}

async function createUser(_, { username, email, password }) {
  try {
    const user = await User.create({ username, email, password });
    return { token: signToken(user), user };
  } catch (error) {
    console.error("Error creating user:", error);
    // Handle specific error types here, potentially returning different error messages
    throw new Error('Signup failed: ' + error.message);
  }
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
    me: async(parent, args, context) => {
      if (context.user) {
        const userInfo = await User.findOne({ _id: context.user._id }).select('-__v -password');
        return userInfo;
      }

      throw new AuthenticationError('Not logged in');
  },
},

  Mutation: {
    login: loginUser,
    addUser: createUser,
    saveBook: saveBookToUser,
    removeBook: removeBookFromUser,
  },
};

module.exports = resolvers;