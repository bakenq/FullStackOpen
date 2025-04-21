import express from "express";
import { z } from "zod";
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
    if (error instanceof z.ZodError) {
      res.status(400).send({ error: error.issues });
    } else if (error instanceof Error) {
      res.status(400).send({ error: error.message });
    } else {
      res.status(500).send({ error: "An unknown error occurred" });
    }
  }
});

export default router;
