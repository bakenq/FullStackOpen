const { GraphQLError } = require("graphql");
const { PubSub } = require("graphql-subscriptions");
const jwt = require("jsonwebtoken");
const Author = require("../models/author");
const Book = require("../models/book");
const User = require("../models/user");
const config = require("../utils/config");

const pubsub = new PubSub();

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
    bookCount: async (root, args, context) => {
      try {
        const count = await context.loaders.bookCountLoader.load(root.id);
        return count;
      } catch (error) {
        console.error(
          `Error loading bookCount for author ${parent.id}:`,
          error
        );
        return 0;
      }
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
      let savedBook;

      try {
        savedBook = await book.save();
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
      const populatedBook = await Book.findById(savedBook._id).populate(
        "author"
      );
      if (!populatedBook || !populatedBook.author) {
        console.error(`!!! Population failed post-save for book ${book._id}`);
        throw new GraphQLError(
          `Failed to retrieve or populate the newly added book correctly.`
        );
      }

      pubsub.publish("BOOK_ADDED", {
        bookAdded: populatedBook,
      });

      return populatedBook;
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

  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(["BOOK_ADDED"]),
    },
  },
};

module.exports = resolvers;
