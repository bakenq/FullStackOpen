import { useState, useEffect } from "react";
import axios from "axios";
import { DiaryEntry } from "./types";

const App = () => {
  const [diaries, setDiaries] = useState<DiaryEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div>
      <h1>Ilari's Flight Diaries</h1>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
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
