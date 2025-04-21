import express from "express";
import patientService from "../services/patientService";
import { NewPatientEntry } from "../types";
import toNewPatientEntry from "../utils";

const router = express.Router();

router.get("/", (_req, res) => {
  res.json(patientService.getNonSensitivePatients());
});

router.post("/", (req, res) => {
  try {
    const newPatientEntry: NewPatientEntry = toNewPatientEntry(req.body);

    const addedPatient = patientService.addPatient(newPatientEntry);

    const responsePatient = {
      id: addedPatient.id,
      name: addedPatient.name,
      dateOfBirth: addedPatient.dateOfBirth,
      gender: addedPatient.gender,
      occupation: addedPatient.occupation,
    };

    res.json(responsePatient);
  } catch (error: unknown) {
    let errorMessage = "Something went wrong.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    res.status(400).send({ error: errorMessage });
  }
});

export default router;
