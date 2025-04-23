import { v1 as uuid } from "uuid";
import patientsData from "../../data/patients";
import { Patient, NonSensitivePatient, NewPatientEntry } from "../types";

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

export default {
  getPatients,
  getNonSensitivePatients,
  addPatient,
  findById,
};
