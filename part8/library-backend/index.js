const config = require("./utils/config");
require("./utils/db");

const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const {
  ApolloServerPluginDrainHttpServer,
} = require("@apollo/server/plugin/drainHttpServer");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const express = require("express");
const cors = require("cors");
const http = require("http");
const jwt = require("jsonwebtoken");

const DataLoader = require("dataloader");

const { WebSocketServer } = require("ws");
const { useServer } = require("graphql-ws/use/ws");

const { batchBookCounts } = require("./graphql/loaders");

const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers");

const User = require("./models/user");
const Book = require("./models/book");

const start = async () => {
  const app = express();
  const httpServer = http.createServer(app);

  const schema = makeExecutableSchema({ typeDefs, resolvers });

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/",
  });

  const serverCleanup = useServer({ schema }, wsServer);

  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });

  await server.start();

  app.use(
    "/",
    cors(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const auth = req ? req.headers.authorization : null;
        let currentUser = null;
        if (auth && auth.startsWith("Bearer ")) {
          try {
            const decodedToken = jwt.verify(
              auth.substring(7),
              config.JWT_SECRET
            );
            if (decodedToken && decodedToken.id) {
              currentUser = await User.findById(decodedToken.id);
            }
          } catch (error) {
            console.error("Invalid/Expired token:", error.message);
          }
        }
        const loaders = {
          bookCountLoader: new DataLoader(batchBookCounts),
        };

        return { currentUser, loaders };
      },
    })
  );

  httpServer.listen(config.PORT, () => {
    console.log(`Server ready at http://localhost:${config.PORT}/`);
    console.log(
      `Subscription endpoint ready at ws://localhost:${config.PORT}/`
    );
  });
};

start();
