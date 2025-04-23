import axios from "axios";
import { Patient, PatientFormValues, Entry, NewEntry } from "../types";

import { apiBaseUrl } from "../constants";

const getAll = async () => {
  const { data } = await axios.get<Patient[]>(`${apiBaseUrl}/patients`);

  return data;
};

const create = async (object: PatientFormValues) => {
  const { data } = await axios.post<Patient>(`${apiBaseUrl}/patients`, object);

  return data;
};

const addEntry = async (
  patientId: string,
  object: NewEntry
): Promise<Entry> => {
  // Backend POST returns the full Entry object (including generated ID)
  const { data } = await axios.post<Entry>(
    `${apiBaseUrl}/patients/${patientId}/entries`, // Correct endpoint
    object
  );
  return data;
};

export default {
  getAll,
  create,
  addEntry,
};
