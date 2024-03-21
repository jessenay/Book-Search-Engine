const { gql } = require('apollo-server-express');

const typeDefs = gql`
  # Define custom types

  # The Book type
  type Book {
    bookId: String!
    authors: [String]
    description: String!
    title: String!
    image: String
    link: String
  }

  # The User type
  type User {
    _id: ID!
    username: String!
    email: String!
    bookCount: Int
    savedBooks: [Book]
  }

  # The Auth type for authentication responses
  type Auth {
    token: String!
    user: User!
  }

  # Input type for adding a new book
  input BookInput {
    authors: [String]
    description: String!
    title: String!
    bookId: String!
    image: String
    link: String
  }

  # Define the Query type
  type Query {
    me: User
  }

  # Define the Mutation type
  type Mutation {
    login(email: String!, password: String!): Auth
    addUser(username: String!, email: String!, password: String!): Auth
    saveBook(bookData: BookInput!): User
    removeBook(bookId: String!): User
  }
`;

module.exports = typeDefs;
