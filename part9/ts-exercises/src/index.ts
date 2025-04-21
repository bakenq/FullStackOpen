import express from "express";
import calculateBmi from "./bmiCalculator";
import { calculateExercises } from "./exerciseCalculator";

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

app.post("/exercises", (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { daily_exercises, target } = req.body;

  if (!daily_exercises || target === undefined) {
    res.status(400).json({ error: "parameters missing" });
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let dailyExercisesArray: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
  let targetValue: any = target;

  let malformatted = false;
  if (!Array.isArray(daily_exercises)) {
    malformatted = true;
  } else {
    dailyExercisesArray = daily_exercises;
    // Check each element in the array
    if (dailyExercisesArray.some((val) => isNaN(Number(val)))) {
      malformatted = true;
    }
  }

  // Check target value
  if (isNaN(Number(targetValue))) {
    malformatted = true;
    targetValue = NaN;
  } else {
    targetValue = Number(targetValue);
  }

  if (malformatted) {
    res.status(400).json({ error: "malformatted parameters" });
    return;
  }

  // Call the calculator function
  try {
    const dailyHoursNum: number[] = dailyExercisesArray.map(Number);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const result = calculateExercises(dailyHoursNum, targetValue);

    res.json(result);
    return;
  } catch (error: unknown) {
    let errorMessage = "Calculation failed";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    res.status(400).json({ error: errorMessage });
    return;
  }
});

const PORT = 3003;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
