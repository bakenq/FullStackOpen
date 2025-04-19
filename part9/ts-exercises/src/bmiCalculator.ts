interface BmiValues {
  height: number;
  weight: number;
}

const calculateBmi = (height: number, weight: number): string => {
  if (height <= 0 || weight <= 0) {
    throw new Error("Height and weight must be positive numbers!");
  }

  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);

  if (bmi < 18.5) {
    return "Underweight";
  } else if (bmi >= 18.5 && bmi < 25) {
    return "Normal range";
  } else if (bmi >= 25) {
    return "Overweight";
  } else {
    return "Unable to calculate BMI - check inputs";
  }
};

const parseBmiArguments = (args: string[]): BmiValues => {
  if (args.length < 4) throw new Error("Not enough arguments");
  if (args.length > 4) throw new Error("Too many arguments");

  const height = Number(args[2]);
  const weight = Number(args[3]);

  if (!isNaN(height) && !isNaN(weight)) {
    return { height, weight };
  } else {
    throw new Error("Provided values were not numbers!");
  }
};

if (require.main === module) {
  try {
    const { height, weight } = parseBmiArguments(process.argv);
    const result = calculateBmi(height, weight);
    console.log(result);
  } catch (error: unknown) {
    let errorMessage = "Something went wrong: ";
    if (error instanceof Error) {
      errorMessage += error.message;
    }
    console.error(errorMessage);
  }
}

export default calculateBmi;
