import { z } from "zod";
import {
  NewPatientEntry,
  NewEntry,
  Gender,
  Diagnosis,
  HealthCheckRating,
} from "./types";

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

const parseDiagnosisCodes = (object: unknown): Array<Diagnosis["code"]> => {
  if (!object || typeof object !== "object" || !("diagnosisCodes" in object)) {
    return [] as Array<Diagnosis["code"]>;
  }
  return object.diagnosisCodes as Array<Diagnosis["code"]>;
};

// --- Zod Schemas for NEW Entries (without ID) ---

const BaseNewEntrySchema = z.object({
  description: z.string().min(1, { message: "Description is required" }),
  date: z.string().date(),
  specialist: z.string().min(1, { message: "Specialist is required" }),
});

// Specific Entry Schemas
const HealthCheckNewEntrySchema = BaseNewEntrySchema.extend({
  type: z.literal("HealthCheck"),
  healthCheckRating: z.nativeEnum(HealthCheckRating, {
    errorMap: () => ({ message: "Invalid HealthCheckRating" }),
  }),
});

const OccupationalHealthcareNewEntrySchema = BaseNewEntrySchema.extend({
  type: z.literal("OccupationalHealthcare"),
  employerName: z.string().min(1, { message: "Employer name is required" }),
  sickLeave: z
    .object({
      startDate: z.string().date(),
      endDate: z.string().date(),
    })
    .optional(),
});

const HospitalNewEntrySchema = BaseNewEntrySchema.extend({
  type: z.literal("Hospital"),
  discharge: z.object(
    {
      date: z.string().date(),
      criteria: z.string().min(1, { message: "Discharge criteria required" }),
    },
    { required_error: "Discharge information is required for Hospital entry" }
  ),
});

// --- Discriminated Union Schema for NewEntry ---
const NewEntrySchemaUnion = z.discriminatedUnion("type", [
  HospitalNewEntrySchema,
  OccupationalHealthcareNewEntrySchema,
  HealthCheckNewEntrySchema,
]);

// --- Validator Function using Zod Schema ---
const toNewEntry = (object: unknown): NewEntry => {
  if (!object || typeof object !== "object") {
    throw new Error("Incorrect or missing data for new entry");
  }

  const validatedData = NewEntrySchemaUnion.parse(object);

  const finalValidatedData: NewEntry = {
    ...validatedData,
    diagnosisCodes: parseDiagnosisCodes(object),
  };

  return finalValidatedData;
};

export { toNewPatientEntry, toNewEntry };
