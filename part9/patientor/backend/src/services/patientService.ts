import { v1 as uuid } from "uuid";
import patientsData from "../../data/patients";
import {
  Patient,
  NonSensitivePatient,
  NewPatientEntry,
  Entry,
  NewEntry,
} from "../types";

const patients: Patient[] = patientsData;

const getPatients = (): Patient[] => {
  return patients;
};

const getNonSensitivePatients = (): NonSensitivePatient[] => {
  return patients.map(({ id, name, dateOfBirth, gender, occupation }) => ({
    id,
    name,
    dateOfBirth,
    gender,
    occupation,
  }));
};

const findById = (id: string): Patient | undefined => {
  const patient = patients.find((p) => p.id === id);

  return patient;
};

const addPatient = (entry: NewPatientEntry): Patient => {
  const id = uuid();
  const newPatient: Patient = {
    id: id,
    ...entry,
    entries: [],
  };

  patients.push(newPatient);
  return newPatient;
};

const addEntryForPatient = (
  patientId: string,
  entryData: NewEntry
): Entry | undefined => {
  const patientIndex = patients.findIndex((p) => p.id === patientId);

  if (patientIndex === -1) {
    return undefined;
  }

  const id = uuid();
  const newEntryWithId: Entry = {
    id: id,
    ...entryData,
  };

  patients[patientIndex].entries.push(newEntryWithId);

  return newEntryWithId;
};

export default {
  getPatients,
  getNonSensitivePatients,
  addPatient,
  findById,
  addEntryForPatient,
};
