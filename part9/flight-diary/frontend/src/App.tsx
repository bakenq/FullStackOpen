import { useState, useEffect } from "react";
import axios from "axios";
import { DiaryEntry, Weather, Visibility } from "./types";

const App = () => {
  const [diaries, setDiaries] = useState<DiaryEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [date, setDate] = useState("");
  const [visibility, setVisibility] = useState<Visibility | "">("");
  const [weather, setWeather] = useState<Weather | "">("");
  const [comment, setComment] = useState("");

  const apiBaseUrl = "http://localhost:3000";

  useEffect(() => {
    axios
      .get<DiaryEntry[]>(`${apiBaseUrl}/api/diaries`)
      .then((response) => {
        setDiaries(response.data);
        setError(null);
      })
      .catch((e) => {
        let errorMessage = "Failed to fetch diaries.";
        if (axios.isAxiosError(e)) {
          errorMessage = e.message;
        } else if (e instanceof Error) {
          errorMessage = e.message;
        }
        console.error("Error fetching diaries:", errorMessage);
        setError(errorMessage);
        setDiaries([]);
      });
  }, []);

  const addDiary = async (event: React.SyntheticEvent) => {
    event.preventDefault();

    if (!date || !visibility || !weather) {
      setError("Date, visibility, and weather are required fields.");
      return;
    }

    const newDiaryPayload = {
      date: date,
      weather: weather,
      visibility: visibility,
      comment: comment,
    };

    try {
      const response = await axios.post<DiaryEntry>(
        `${apiBaseUrl}/api/diaries`,
        newDiaryPayload
      );

      setDiaries(diaries.concat(response.data));

      setDate("");
      setVisibility("");
      setWeather("");
      setComment("");
      setError(null);
    } catch (e: unknown) {
      let errorMessage = "Failed to add diary.";
      if (axios.isAxiosError(e)) {
        if (
          e.response &&
          e.response.data &&
          typeof e.response.data === "string"
        ) {
          errorMessage += ` Error: ${e.response.data}`;
        } else {
          errorMessage += ` Error: ${e.message}`;
        }
      } else if (e instanceof Error) {
        errorMessage += ` Error: ${e.message}`;
      }
      console.error("Error adding diary:", errorMessage);
      setError(errorMessage);
    }
  };

  return (
    <div>
      <h1>Ilari's Flight Diaries</h1>

      <h2>Add new entry</h2>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      <form onSubmit={addDiary}>
        <div>
          Date:{" "}
          <input
            type='date'
            value={date}
            onChange={({ target }) => setDate(target.value)}
          />
        </div>

        {/* Radio buttons for Visibility */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          Visibility:
          {Object.values(Visibility).map((v) => (
            <label key={v}>
              <input
                type='radio'
                name='visibility'
                value={v}
                checked={visibility === v}
                onChange={() => setVisibility(v)}
              />{" "}
              {v}
            </label>
          ))}
        </div>

        {/* Radio buttons for Weather */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          Weather:
          {Object.values(Weather).map((w) => (
            <label key={w}>
              <input
                type='radio'
                name='weather'
                value={w}
                checked={weather === w}
                onChange={() => setWeather(w)}
              />{" "}
              {w}
            </label>
          ))}
        </div>

        <div>
          Comment:{" "}
          <input
            value={comment}
            onChange={({ target }) => setComment(target.value)}
          />
        </div>

        <button type='submit'>Add Diary</button>
      </form>

      <h2>Diary entries</h2>
      {diaries.map((diary) => (
        <div
          key={diary.id}
          style={{
            marginBottom: "1em",
            border: "1px solid gray",
            padding: "0.5em",
          }}
        >
          <h3>{diary.date}</h3>
          <p>Visibility: {diary.visibility}</p>
          <p>Weather: {diary.weather}</p>

          {diary.comment && <p>Comment: {diary.comment}</p>}
        </div>
      ))}
      {diaries.length === 0 && !error && (
        <p>Loading diaries or no diaries found...</p>
      )}
    </div>
  );
};

export default App;
