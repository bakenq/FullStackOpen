import { useMemo } from "react";
import { useQuery } from "@apollo/client";
import { ALL_BOOKS, ME } from "../queries";

const Recommended = (props) => {
  const {
    data: userData,
    loading: userLoading,
    error: userError,
  } = useQuery(ME);
  const {
    data: bookData,
    loading: bookLoading,
    error: bookError,
  } = useQuery(ALL_BOOKS);

  const recommendedBooks = useMemo(() => {
    if (!userData?.me || !bookData?.allBooks) {
      return [];
    }
    const favoriteGenre = userData.me.favoriteGenre;
    return bookData.allBooks.filter((book) =>
      book.genres.includes(favoriteGenre)
    );
  }, [userData, bookData]);

  // --- Render Logic ---

  if (!props.show) {
    return null;
  }

  if (userLoading || bookLoading) {
    return <div>loading recommendations...</div>;
  }

  if (userError) {
    console.error("Error fetching user data:", userError);
    return <div>Error loading user data for recommendations.</div>;
  }
  if (bookError) {
    console.error("Error fetching book data:", bookError);
    return <div>Error loading book data for recommendations.</div>;
  }

  if (!userData || !userData.me) {
    console.warn("Cannot show recommendations: User data not available.");
    return null;
  }

  const favoriteGenre = userData.me.favoriteGenre;

  return (
    <div>
      <h2>recommendations</h2>
      <p>
        books in your favorite genre <strong>{favoriteGenre}</strong>
      </p>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {recommendedBooks.length > 0 ? (
            recommendedBooks.map((book) => (
              <tr key={book.id}>
                <td>{book.title}</td>
                <td>{book.author ? book.author.name : "N/A"}</td>
                <td>{book.published}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan='3'>No books found in your favorite genre.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Recommended;
