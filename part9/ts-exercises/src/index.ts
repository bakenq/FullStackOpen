import express from "express";
import calculateBmi from "./bmiCalculator";

const app = express();
app.use(express.json());

app.get("/hello", (_req, res) => {
  res.send("Hello Full Stack!");
});

app.get("/bmi", (req, res) => {
  const heightStr = req.query.height;
  const weightStr = req.query.weight;

  if (typeof heightStr !== "string" || typeof weightStr !== "string") {
    res.status(400).json({ error: "malformatted parameters" });
  }

  const height = Number(heightStr);
  const weight = Number(weightStr);

  if (isNaN(height) || isNaN(weight)) {
    res.status(400).json({ error: "malformatted parameters" });
  }

  try {
    const bmiResult = calculateBmi(height, weight);

    res.json({
      weight: weight,
      height: height,
      bmi: bmiResult,
    });
  } catch (error: unknown) {
    let errorMessage = "Something went wrong: ";
    if (error instanceof Error) {
      errorMessage += error.message;
    }
    console.error(errorMessage);
    res.status(400).json({ error: "malformatted parameters" });
  }
});

const PORT = 3003;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
