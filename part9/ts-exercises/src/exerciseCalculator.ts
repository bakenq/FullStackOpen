interface ExerciseResult {
  periodLength: number;
  trainingDays: number;
  success: boolean;
  rating: 1 | 2 | 3;
  ratingDescription: string;
  target: number;
  average: number;
}

export const calculateExercises = (
  dailyHours: number[],
  targetAmount: number
): ExerciseResult => {
  const periodLength = dailyHours.length;

  // Shouldn't happen with CLI validation
  if (periodLength === 0) {
    return {
      periodLength: 0,
      trainingDays: 0,
      success: false,
      rating: 1,
      ratingDescription: "No data provided",
      target: targetAmount,
      average: 0,
    };
  }

  const trainingDays = dailyHours.filter((hours) => hours > 0).length;
  const totalHours = dailyHours.reduce((sum, hours) => sum + hours, 0);
  const average = totalHours / periodLength;
  const success = average >= targetAmount;

  let rating: 1 | 2 | 3;
  let ratingDescription: string;
  if (average >= targetAmount) {
    rating = 3;
    ratingDescription = "You reached your target!";
  } else if (average >= targetAmount * 0.75) {
    rating = 2;
    ratingDescription = "Not too bad but could be better";
  } else {
    rating = 1;
    ratingDescription = "Needs improvement, keep pushing!";
  }

  const result: ExerciseResult = {
    periodLength,
    trainingDays,
    success,
    rating,
    ratingDescription,
    target: targetAmount,
    average,
  };

  return result;
};

interface ExerciseValues {
  target: number;
  dailyHours: number[];
}

const parseExerciseArguments = (args: string[]): ExerciseValues => {
  if (args.length < 4)
    throw new Error("Not enough arguments (need target and at least one day)");

  const targetStr = args[2];
  const dailyHoursStr = args.slice(3);

  const allNumeric = [targetStr, ...dailyHoursStr].every(
    (arg) => !isNaN(Number(arg))
  );

  if (!allNumeric) {
    throw new Error(
      "Provided values (target and all daily hours) must be numbers!"
    );
  }

  const target = Number(targetStr);
  const dailyHours = dailyHoursStr.map((hourStr) => Number(hourStr));

  return {
    target: target,
    dailyHours: dailyHours,
  };
};

try {
  const { target, dailyHours } = parseExerciseArguments(process.argv);
  const result = calculateExercises(dailyHours, target);
  console.log(result);
} catch (error: unknown) {
  let errorMessage = "Something went wrong: ";
  if (error instanceof Error) {
    errorMessage += error.message;
  }
  console.error(errorMessage);
}
