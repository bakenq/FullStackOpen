require("dotenv").config();
const mongoose = require("mongoose");

const { v4: uuidv4 } = require("uuid");
const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");

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
          throw new Error(`Error saving author: ${error.message}`);
        }
      }

      const book = new Book({ ...args, author: author._id });

      try {
        await book.save();
      } catch (error) {
        console.error("Error saving new book:", error.message);
        throw new Error(`Error saving book: ${error.message}`);
      }

      // NOTE: This adds an extra DB call, populate in the main find is better.
      const savedBook = await Book.findById(book._id).populate("author");
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
        throw new Error(`Error updating author: ${error.message}`);
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
