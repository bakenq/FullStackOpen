require("dotenv").config();
const mongoose = require("mongoose");

const jwt = require("jsonwebtoken");
const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { GraphQLError } = require("graphql");

const Author = require("./models/author");
const Book = require("./models/book");
const User = require("./models/user");

mongoose.set("strictQuery", false);
const MONGODB_URI = process.env.MONGODB_URI;

console.log("connecting to", MONGODB_URI);

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connecting to MongoDB:", error.message);
  });

const typeDefs = `
  type Book {
    title: String!
    author: Author!
    published: Int
    id: ID!
    genres: [String!]!
  }

  type Author {
    name: String!
    id: ID!
    born: Int
    bookCount: Int!
  }

  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
    me: User
  }

  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]!
    ) : Book!  

    editAuthor(
      name: String!
      setBornTo: Int!
    ) : Author

    createUser(
      username: String!
      favoriteGenre: String!
    ) : User

    login(
      username: String!
      password: String!
    ) : Token!
  } 
`;

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      let filter = {};

      if (args.author) {
        const author = await Author.findOne({ name: args.author });
        if (author) {
          filter.author = author._id;
        } else {
          return [];
        }
      }

      if (args.genre) {
        filter.genres = { $in: [args.genre] };
      }

      const books = await Book.find(filter).populate("author");

      return books;
    },
    allAuthors: async () => Author.find({}),
    me: async (root, args, context) => {
      return context.currentUser;
    },
  },

  Author: {
    bookCount: async (root) => {
      /*
      // --- Broken for now ---
      const booksByAuthor = books.filter((book) => book.author === root.name);
      return booksByAuthor.length;
      */
      return 0;
    },
  },

  Mutation: {
    addBook: async (root, args, context) => {
      const currentUser = context.currentUser;
      if (!currentUser) {
        throw new GraphQLError("Not authenticated", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      let author = await Author.findOne({ name: args.author });
      if (!author) {
        author = new Author({
          name: args.author,
        });

        try {
          await author.save();
        } catch (error) {
          console.error("Error saving new author:", error.message);
          if (error.name === "ValidationError") {
            throw new GraphQLError(`Failed to save author: ${messages}`, {
              extensions: {
                code: "BAD_USER_INPUT",
                invalidArgs: { author: args.author },
                errorDetails: error.errors,
              },
            });
          } else if (error.code === 11000 || error.code === 11001) {
            const field = Object.keys(error.keyValue)[0];
            const value = error.keyValue[field];
            throw new GraphQLError(
              `Author validation failed: ${field} must be unique. Value ${value} is already taken`,
              {
                extensions: {
                  code: "BAD_USER_INPUT",
                  invalidArgs: { author: args.author },
                },
              }
            );
          }
          throw new GraphQLError(
            "Saving new author failed due to an unexpected error.",
            {
              extensions: {
                code: "BAD_USER_INPUT",
                invalidArgs: { author: args.author },
              },
            }
          );
        }
      }

      const book = new Book({ ...args, author: author._id });

      try {
        await book.save();
      } catch (error) {
        console.error("Error saving new book:", error.message);
        if (error.name === "ValidationError") {
          const messages = Object.values(error.errors)
            .map((val) => val.message)
            .join(", ");
          throw new GraphQLError(`Failed to save book: ${messages}`, {
            extensions: {
              code: "BAD_USER_INPUT",
              invalidArgs: args,
              errorDetails: error.errors,
            },
          });
        } else if (error.code === 11000 || error.code === 11001) {
          const field = Object.keys(error.keyValue)[0];
          const value = error.keyValue[field];
          throw new GraphQLError(
            `Book validation failed: ${field} must be unique. Value '${value}' is already taken.`,
            {
              extensions: {
                code: "BAD_USER_INPUT",
                invalidArgs: { title: args.title },
              },
            }
          );
        }

        throw new GraphQLError(
          "Saving new book failed due to an unexpected error.",
          {
            extensions: { code: "INTERNAL_SERVER_ERROR" },
          }
        );
      }

      // NOTE: This adds an extra DB call, populate in the main find might be better.
      const savedBook = await Book.findById(book._id).populate("author");
      if (!savedBook || !savedBook.author) {
        console.error(`!!! Population failed post-save for book ${book._id}`);
        throw new GraphQLError(
          `Failed to retrieve or populate the newly added book correctly.`
        );
      }
      return savedBook;
    },

    editAuthor: async (root, args, context) => {
      const currentUser = context.currentUser;
      if (!currentUser) {
        throw new GraphQLError("Not authenticated", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      const author = await Author.findOne({ name: args.name });
      if (!author) {
        return null;
      }

      author.born = args.setBornTo;

      try {
        await author.save();
        return author;
      } catch (error) {
        console.error("Error updating author:", error.message);
        if (error.name === "ValidationError") {
          const messages = Object.values(error.errors)
            .map((val) => val.message)
            .join(", ");
          throw new GraphQLError(`Failed to update author: ${messages}`, {
            extensions: {
              code: "BAD_USER_INPUT",
              invalidArgs: args,
              errorDetails: error.errors,
            },
          });
        } else if (error.code === 11000 || error.code === 11001) {
          const field = Object.keys(error.keyValue)[0];
          const value = error.keyValue[field];
          throw new GraphQLError(
            `Author update failed: ${field} must be unique. Value '${value}' is already taken.`,
            {
              extensions: { code: "BAD_USER_INPUT", invalidArgs: args },
            }
          );
        }
        throw new GraphQLError(
          "Updating author failed due to an unexpected error.",
          {
            extensions: { code: "INTERNAL_SERVER_ERROR" },
          }
        );
      }
    },

    createUser: async (root, args) => {
      const user = new User({
        username: args.username,
        favoriteGenre: args.favoriteGenre,
      });

      try {
        await user.save();
        return user;
      } catch (error) {
        console.error("ERROR creating user:", error.message);
        if (error.name === "ValidationError") {
          const messages = Object.values(error.errors)
            .map((val) => val.message)
            .join(", ");
          throw new GraphQLError(`Failed to create user: ${messages}`, {
            extensions: { code: "BAD_USER_INPUT", invalidArgs: args },
          });
        } else if (error.code === 11000 || error.code === 11001) {
          throw new GraphQLError(
            `Username '${args.username}' is already taken.`,
            {
              extensions: {
                code: "BAD_USER_INPUT",
                invalidArgs: { username: args.username },
              },
            }
          );
        }
        throw new GraphQLError("Creating user failed", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },

    login: async (root, args) => {
      const user = await User.findOne({ username: args.username });

      const passwordCorrect =
        user === null ? false : args.password === "secret";

      if (!user || !passwordCorrect) {
        throw new GraphQLError("Wrong credentials", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      };

      const tokenValue = jwt.sign(userForToken, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      return { value: tokenValue };
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({ req, res }) => {
    const auth = req ? req.headers.authorization : null;
    let currentUser = null;

    if (auth && auth.startsWith("Bearer ")) {
      const decodedToken = jwt.verify(
        auth.substring(7),
        process.env.JWT_SECRET
      );

      if (decodedToken && decodedToken.id) {
        try {
          currentUser = await User.findById(decodedToken.id);
        } catch (error) {
          console.error("Error finding user for token:", error);
        }
      }
    }
    return { currentUser };
  },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
