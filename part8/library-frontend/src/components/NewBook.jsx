import { useState } from "react";
import { useMutation } from "@apollo/client";
import { ADD_BOOK, ALL_BOOKS } from "../queries";
import { updateCache } from "../../utils/cacheUpdater";

const NewBook = (props) => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [published, setPublished] = useState("");
  const [genre, setGenre] = useState("");
  const [genres, setGenres] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);

  const [createBook, { loading, error }] = useMutation(ADD_BOOK, {
    //refetchQueries: [{ query: ALL_BOOKS }, { query: ALL_AUTHORS }],
    onError: (error) => {
      const message = error.graphQLErrors.map((e) => e.message).join("\n");
      setErrorMessage(message);
      setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
    },
    update: (cache, response) => {
      if (response.data && response.data.addBook) {
        const addedBook = response.data.addBook;
        updateCache(cache, { query: ALL_BOOKS }, addedBook);
      } else {
        console.error(
          "Mutation response missing data.addBook, cannot update cache."
        );
      }
    },
    onCompleted: () => {
      setTitle("");
      setPublished("");
      setAuthor("");
      setGenres([]);
      setGenre("");
      setErrorMessage(null);
    },
  });

  if (!props.show) {
    return null;
  }

  const submit = async (event) => {
    event.preventDefault();

    if (!title || !author || !published || genres.length === 0) {
      setErrorMessage("Please fill in all fields and add at least one genre.");
      setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
      return;
    }

    const publishedInt = parseInt(published);
    if (isNaN(publishedInt)) {
      setErrorMessage("Published year must be a number.");
      setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
      return;
    }

    createBook({
      variables: { title, author, published: publishedInt, genres },
    });
  };

  const addGenre = () => {
    if (genre.trim() !== "") {
      setGenres(genres.concat(genre));
      setGenre("");
    }
  };

  return (
    <div>
      {errorMessage && (
        <div
          style={{
            color: "red",
            border: "1px solid red",
            padding: "10px",
            margin: "10px 0",
          }}
        >
          {errorMessage}
        </div>
      )}

      <form onSubmit={submit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          published
          <input
            type='number'
            value={published}
            onChange={({ target }) => setPublished(target.value)}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addGenre();
              }
            }}
          />
          <button onClick={addGenre} type='button'>
            add genre
          </button>
        </div>
        <div>genres: {genres.join(" ")}</div>
        <button type='submit' disabled={loading}>
          {loading ? "Creating..." : "create book"}
        </button>
      </form>
    </div>
  );
};

export default NewBook;
