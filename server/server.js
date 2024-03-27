const express = require('express');
const path = require('path');
const db = require('./config/connection');
const routes = require('./routes');
//const { ApolloServer, gql } = require('apollo-server-express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { typeDefs, resolvers } = require('./schemas');
const { authMiddleware } = require('./utils/auth');

const app = express();
const PORT = process.env.PORT || 3001;

const server = new ApolloServer({
  typeDefs,
  resolvers,
  // context: authMiddleware
});

async function startApolloServer() {
  await server.start();
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  //server.applyMiddleware({ app, path: '/graphql' });
  if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
}
  app.use('/graphql', expressMiddleware(server, {
    context: authMiddleware
  }));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
  db.once('open', () => {
  app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}`));
});
}



startApolloServer();