require("dotenv").config();
const mongoose = require("mongoose");

const { v4: uuidv4 } = require("uuid");
const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
import { GraphQLError } from "graphql";

const Author = require("./models/author");
const Book = require("./models/book");

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

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
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
    addBook: async (root, args) => {
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

    editAuthor: async (root, args) => {
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
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
