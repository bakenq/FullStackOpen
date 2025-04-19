const calculateBmi = (height: number, weight: number): string => {
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

console.log(calculateBmi(180, 74)); // Normal range
