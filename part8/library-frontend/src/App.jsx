import { useState, useEffect } from "react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import Login from "./components/LoginForm";
import Recommended from "./components/Recommended";
import { useApolloClient, useSubscription } from "@apollo/client";
import { BOOK_ADDED, ALL_BOOKS } from "./queries";

import { updateCache } from "../utils/cacheUpdater";

const Notify = ({ message }) => {
  if (!message) {
    return null;
  }
  const style = {
    border: "solid",
    padding: 10,
    borderWidth: 1,
    margin: "10px 0",
    color: message.type === "error" ? "red" : "green",
    borderColor: message.type === "error" ? "red" : "green",
  };
  return <div style={style}>{message.text}</div>;
};

const App = () => {
  const [page, setPage] = useState("authors");
  const [token, setToken] = useState(null);
  const [message, setMessage] = useState(null);

  const client = useApolloClient();

  const notify = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => {
      setMessage(null);
    }, 5000);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("library-user-token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      if (data && data.data && data.data.bookAdded) {
        const addedBook = data.data.bookAdded;
        notify(
          `New book added: ${addedBook.title} by ${addedBook.author.name}`
        );

        updateCache(client.cache, { query: ALL_BOOKS }, addedBook);
      } else {
        console.warn("Subscription received empty or malformed data");
      }
    },
    onError: (error) => {
      console.error("Subscription error:", error);
    },
  });

  const logout = () => {
    setToken(null);
    localStorage.clear();
    client.resetStore();
    setPage("authors");
    notify("Logged out");
  };

  return (
    <div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>

        {token ? (
          <>
            <button onClick={() => setPage("add")}>add book</button>
            <button onClick={() => setPage("recommended")}>recommended</button>
            <button onClick={logout}>logout</button>
          </>
        ) : (
          <button onClick={() => setPage("login")}>login</button>
        )}
      </div>

      <Notify message={message} />

      <Authors show={page === "authors"} />

      <Books show={page === "books"} />

      <NewBook show={page === "add"} />

      <Recommended show={page === "recommended"} />

      <Login
        show={page === "login"}
        setToken={setToken}
        setPage={setPage}
        notify={notify}
      />
    </div>
  );
};

export default App;
