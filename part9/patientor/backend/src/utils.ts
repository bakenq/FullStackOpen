import { NewPatientEntry, Gender } from "./types";

// --- Type Guards ---

const isString = (text: unknown): text is string => {
  return typeof text === "string" || text instanceof String;
};

const isDate = (date: string): boolean => {
  return Boolean(Date.parse(date));
};

const isGender = (param: unknown): param is Gender => {
  if (!isString(param)) {
    return false;
  }
  return Object.values(Gender).includes(param as Gender);
};

// --- Parsers ---

const parseString = (value: unknown, fieldName: string): string => {
  if (value === null || value === undefined) {
    throw new Error(`Missing ${fieldName}`);
  }
  if (!isString(value) || value.length === 0) {
    throw new Error(
      `Incorrect or missing ${fieldName}: Expected a non-empty string`
    );
  }
  return value;
};

const parseDate = (date: unknown): string => {
  if (date === null || date === undefined) {
    throw new Error("Missing date");
  }
  if (!isString(date) || !isDate(date)) {
    throw new Error("Incorrect date: Expected format YYYY-MM-DD");
  }
  return date;
};

const parseGender = (gender: unknown): Gender => {
  if (gender === null || gender === undefined) {
    throw new Error("Missing gender");
  }
  if (!isGender(gender)) {
    throw new Error(
      `Incorrect gender: Expected one of ${Object.values(Gender).join(", ")}`
    );
  }
  return gender;
};

// --- Main Validator Function ---

const toNewPatientEntry = (object: unknown): NewPatientEntry => {
  if (!object || typeof object !== "object") {
    throw new Error("Incorrect or missing data");
  }

  if (
    "name" in object &&
    "dateOfBirth" in object &&
    "ssn" in object &&
    "gender" in object &&
    "occupation" in object
  ) {
    const newEntry: NewPatientEntry = {
      name: parseString(object.name, "name"),
      dateOfBirth: parseDate(object.dateOfBirth),
      ssn: parseString(object.ssn, "ssn"),
      gender: parseGender(object.gender),
      occupation: parseString(object.occupation, "occupation"),
    };
    return newEntry;
  }

  throw new Error("Incorrect data: some fields are missing");
};

export default toNewPatientEntry;
