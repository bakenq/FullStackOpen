interface ExerciseResult {
  periodLength: number;
  trainingDays: number;
  success: boolean;
  rating: 1 | 2 | 3;
  ratingDescription: string;
  target: number;
  average: number;
}

const calculateExercises = (
  dailyHours: number[],
  targetAmount: number
): ExerciseResult => {
  const periodLength = dailyHours.length;

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

console.log(calculateExercises([3, 0, 2, 4.5, 0, 3, 1], 2)); // Example usage
