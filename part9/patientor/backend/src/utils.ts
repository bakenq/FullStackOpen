import { z } from "zod";
import { NewPatientEntry, Gender } from "./types";

// --- Zod Schema Definition ---

const NewPatientEntrySchema = z.object({
  name: z.string().min(1),
  dateOfBirth: z.string().date(),
  ssn: z.string().min(1),
  gender: z.nativeEnum(Gender),
  occupation: z.string().min(1),
});

// --- Main Validator Function ---

const toNewPatientEntry = (object: unknown): NewPatientEntry => {
  return NewPatientEntrySchema.parse(object);
};

export default toNewPatientEntry;
