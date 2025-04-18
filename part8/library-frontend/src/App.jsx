import { useState, useEffect } from "react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import Login from "./components/LoginForm";
import { useApolloClient } from "@apollo/client";

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
