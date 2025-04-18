import { useState, useMemo } from "react";
import { useQuery, useLazyQuery } from "@apollo/client";
import { ALL_BOOKS } from "../queries";

const Books = (props) => {
  const [selectedGenre, setSelectedGenre] = useState(null);

  const allBooksResult = useQuery(ALL_BOOKS);

  const [getFilteredBooks, filteredResult] = useLazyQuery(ALL_BOOKS, {
    onError: (error) => {
      console.error("Error fetching filtered books:", error);
    },
  });

  const uniqueGenres = useMemo(() => {
    if (!allBooksResult.data || !allBooksResult.data.allBooks) return [];
    const allGenres = allBooksResult.data.allBooks.flatMap(
      (book) => book.genres
    );
    return [...new Set(allGenres)];
  }, [allBooksResult.data]);

  const booksToDisplay = useMemo(() => {
    if (selectedGenre && filteredResult.data) {
      return filteredResult.data.allBooks;
    } else if (!selectedGenre && allBooksResult.data) {
      return allBooksResult.data.allBooks;
    }
    return [];
  }, [selectedGenre, filteredResult.data, allBooksResult.data]);

  const handleGenreSelect = (genre) => {
    setSelectedGenre(genre);
    getFilteredBooks({ variables: { genre: genre === "all" ? null : genre } });
  };

  if (!props.show) {
    return null;
  }

  if (allBooksResult.loading || filteredResult.loading)
    return <div>Loading books...</div>;
  if (allBooksResult.error)
    return <div>Error loading books: {allBooksResult.error.message}</div>;

  return (
    <div>
      <h2>books</h2>

      {selectedGenre && selectedGenre !== "all" && (
        <p>
          in genre <strong>{selectedGenre}</strong>
        </p>
      )}

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {booksToDisplay.length > 0 ? (
            booksToDisplay.map((a) => (
              <tr key={a.id}>
                <td>{a.title}</td>
                <td>{a.author.name}</td>
                <td>{a.published}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan='3'>
                {selectedGenre && selectedGenre !== "all"
                  ? `No books found in genre "${selectedGenre}".`
                  : "No books found."}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div>
        <h4>Filter by Genre:</h4>
        {uniqueGenres.map((genre) => (
          <button key={genre} onClick={() => handleGenreSelect(genre)}>
            {genre}
          </button>
        ))}
        <button onClick={() => handleGenreSelect("all")}>all genres</button>
      </div>
    </div>
  );
};

export default Books;
