import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { ALL_AUTHORS, EDIT_AUTHOR } from "../queries";
import Select from "react-select";

const Authors = (props) => {
  //const [selectedAuthorName, setSelectedAuthorName] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);
  const [bornYear, setBornYear] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);

  const result = useQuery(ALL_AUTHORS);

  const [changeBirthYear, mutationResult] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
    onError: (error) => {
      const messages =
        error.graphQLErrors.legnth > 0
          ? error.graphQLErrors.map((e) => e.message).join("\n")
          : "Failed to update author";
      setErrorMessage(messages);
      setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
    },
    onCompleted: () => {
      setSelectedOption("");
      setBornYear("");
      setErrorMessage(null);
    },
  });

  if (!props.show) {
    return null;
  }

  if (result.loading) return <div>Loading authors...</div>;
  if (result.error)
    return <div>Error loading authors: {result.error.message}</div>;

  const authors = result.data.allAuthors;

  const authorOptions = authors.map((author) => ({
    value: author.name,
    label: author.name,
  }));

  const submitBirthYear = (event) => {
    event.preventDefault();

    const authorName = selectedOption ? selectedOption.value : null;

    if (!authorName) {
      setErrorMessage("Please select an author.");
      setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
      return;
    }

    const bornInt = parseInt(bornYear);
    if (isNaN(bornInt)) {
      setErrorMessage("Born year must be a number.");
      setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
      return;
    }

    changeBirthYear({
      variables: { name: authorName, setBornTo: bornInt },
    });
  };

  const handleSelectChange = (selected) => {
    setSelectedOption(selected);
  };

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.id}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Set birth year</h3>

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

      <form onSubmit={submitBirthYear}>
        <div>
          <label htmlFor='authorSelect'>Author </label>
          <Select
            id='authorSelect'
            value={selectedOption}
            onChange={handleSelectChange}
            options={authorOptions}
            isClearable
            styles={{
              container: (base) => ({
                ...base,
                width: "300px",
                display: "inline-block",
                marginRight: "10px",
              }),
            }}
          />
        </div>
        <div>
          <label htmlFor='bornInput'>Born </label>
          <input
            id='bornInput'
            type='number'
            value={bornYear}
            onChange={({ target }) => setBornYear(target.value)}
          />
        </div>
        <button type='submit' disabled={mutationResult.loading}>
          {mutationResult.loading ? "Updating..." : "update author"}
        </button>
      </form>
    </div>
  );
};

export default Authors;
