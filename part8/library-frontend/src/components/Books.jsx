import { useState, useMemo } from "react";
import { useQuery } from "@apollo/client";
import { ALL_BOOKS } from "../queries";

const Books = (props) => {
  const [selectedGenre, setSelectedGenre] = useState("all");
  const { loading, error, data } = useQuery(ALL_BOOKS);

  const uniqueGenres = useMemo(() => {
    if (!data || !data.allBooks) return [];

    const allGenres = data.allBooks.flatMap((book) => book.genres);
    return [...new Set(allGenres)];
  }, [data]);

  const filteredBooks = useMemo(() => {
    if (!data || !data.allBooks) return [];

    if (selectedGenre === "all") {
      return data.allBooks;
    }

    return data.allBooks.filter((book) => book.genres.includes(selectedGenre));
  }, [data, selectedGenre]);

  if (!props.show) {
    return null;
  }

  if (loading) return <div>Loading books...</div>;
  if (error) return <div>Error loading books: {error.message}</div>;

  if (!data.allBooks) {
    return <div>No books found.</div>;
  }

  return (
    <div>
      <h2>books</h2>

      {selectedGenre !== "all" && (
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
          {filteredBooks.map((a) => (
            <tr key={a.id}>
              <td>{a.title}</td>
              <td>{a.author ? a.author.name : "N/A"}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div>
        <h4>Filter by Genre:</h4>
        {uniqueGenres.map((genre) => (
          <button key={genre} onClick={() => setSelectedGenre(genre)}>
            {genre}
          </button>
        ))}
        <button onClick={() => setSelectedGenre("all")}>all genres</button>
      </div>
    </div>
  );
};

export default Books;
