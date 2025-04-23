import express from "express";
import { z } from "zod";
import patientService from "../services/patientService";
import { NewPatientEntry } from "../types";
import { toNewPatientEntry, toNewEntry } from "../utils";

const router = express.Router();

router.get("/", (_req, res) => {
  res.json(patientService.getNonSensitivePatients());
});

router.get("/:id", (req, res) => {
  const patientId = req.params.id;
  const patient = patientService.findById(patientId);

  if (patient) {
    res.json(patient);
  } else {
    res.status(404).send({ error: "Patient not found" });
  }
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

router.post("/:id/entries", (req, res) => {
  const patientId = req.params.id;
  try {
    // This now calls the Zod-powered validation utility
    const newEntryData = toNewEntry(req.body);
    const addedEntry = patientService.addEntryForPatient(
      patientId,
      newEntryData
    );

    if (addedEntry) {
      res.status(201).json(addedEntry);
    } else {
      res.status(404).send({ error: `Patient with ID ${patientId} not found` });
    }
  } catch (error: unknown) {
    // Catches ZodError from toNewEntry or other errors
    if (error instanceof z.ZodError) {
      // Sends the detailed Zod issues array
      res.status(400).send({ error: error.issues });
    } else if (error instanceof Error) {
      res.status(400).send({ error: error.message });
    } else {
      res.status(500).send({ error: "An unknown error occurred" });
    }
  }
});

export default router;
