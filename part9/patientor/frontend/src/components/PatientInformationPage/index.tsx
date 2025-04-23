import { useState, useEffect, SyntheticEvent } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Patient,
  Entry,
  Diagnosis,
  NewEntry,
  HealthCheckRating,
} from "../../types";

import EntryDetails from "./EntryDetails";

import diagnosesService from "../../services/diagnoses";
import patientService from "../../services/patients";

import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import WorkIcon from "@mui/icons-material/Work";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";

const PatienInformationPage = () => {
  const { id: patientId } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // HealthCheck Entry Form
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [specialist, setSpecialist] = useState("");
  const [healthCheckRating, setHealthCheckRating] = useState<HealthCheckRating>(
    HealthCheckRating.Healthy
  );
  const [diagnosisCodes, setDiagnosisCodes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const apiBaseUrl = "http://localhost:3001";

  useEffect(() => {
    const fetchPatientAndDiagnoses = async () => {
      if (!patientId) {
        setError("Patient ID missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const patientResponse = await axios.get<Patient>(
          `${apiBaseUrl}/api/patients/${patientId}`
        );
        setPatient(patientResponse.data);

        const diagnosesList = await diagnosesService.getAll();
        setDiagnoses(diagnosesList);
      } catch (e: unknown) {
        let errorMessage = "Failed to fetch data.";
        // Handle errors
        if (axios.isAxiosError(e)) {
          if (
            e.request?.responseURL?.includes(`/api/patients/${patientId}`) &&
            e.response?.status === 404
          ) {
            errorMessage = "Patient not found.";
          } else if (e.request?.responseURL?.includes("/api/diagnoses")) {
            errorMessage = "Failed to fetch diagnoses list.";
          } else {
            errorMessage += ` Error: ${e.message}`;
          }
        } else if (e instanceof Error) {
          errorMessage += ` Error: ${e.message}`;
        }
        console.error(errorMessage);
        setError(errorMessage);
        setPatient(null);
        setDiagnoses([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchPatientAndDiagnoses();
  }, [patientId]);

  const getDiagnosisName = (code: string): string | undefined => {
    return diagnoses.find((d) => d.code === code)?.name;
  };

  const EntryIcon = ({ type }: { type: Entry["type"] }) => {
    switch (type) {
      case "HealthCheck":
        return <MedicalServicesIcon />;
      case "OccupationalHealthcare":
        return <WorkIcon />;
      case "Hospital":
        return <LocalHospitalIcon />;
      default:
        return null;
    }
  };

  const submitNewEntry = async (event: SyntheticEvent) => {
    event.preventDefault();

    if (!patientId) {
      setFormError("Cannot add entry: Patient ID is missing.");
      return;
    }

    // Construct the NewEntry object for HealthCheck type
    const entryToAdd: NewEntry = {
      type: "HealthCheck",
      description,
      date,
      specialist,
      healthCheckRating,
      diagnosisCodes: diagnosisCodes
        .split(",")
        .map((code) => code.trim())
        .filter((code) => code !== ""),
    };

    try {
      setFormError(null);
      const addedEntry = await patientService.addEntry(patientId, entryToAdd);

      if (patient) {
        setPatient({
          ...patient,
          entries: patient.entries.concat(addedEntry),
        });
      }

      setDescription("");
      setDate("");
      setSpecialist("");
      setHealthCheckRating(HealthCheckRating.Healthy);
      setDiagnosisCodes("");
    } catch (e: unknown) {
      // Handle errors from the backend POST request
      let errorMessage = "Failed to add entry.";
      if (axios.isAxiosError(e)) {
        if (e.response?.data?.error && Array.isArray(e.response.data.error)) {
          // Handle Zod issues array
          const issues = e.response.data.error as { message: string }[];
          errorMessage = `Validation failed: ${issues
            .map((issue) => issue.message)
            .join(", ")}`;
        } else if (
          e.response?.data?.error &&
          typeof e.response.data.error === "string"
        ) {
          errorMessage = e.response.data.error;
        } else {
          errorMessage = e.message || "An unknown error occurred.";
        }
      } else if (e instanceof Error) {
        errorMessage = e.message;
      }
      console.error("Error adding entry:", errorMessage);
      setFormError(errorMessage);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div style={{ color: "red" }}>Error: {error}</div>;
  }

  if (!patient) {
    return <div>Patient data could not be loaded.</div>;
  }

  return (
    <div>
      <h2>{patient.name}</h2>
      <p>SSN: {patient.ssn}</p>
      <p>Occupation: {patient.occupation}</p>
      <p>Date of Birth: {patient.dateOfBirth}</p>

      {/* --- HealthCheck Entry Form --- */}
      <div
        style={{
          border: "1px dashed black",
          padding: "1em",
          marginTop: "1em",
          marginBottom: "1em",
        }}
      >
        <h3>Add New HealthCheck Entry</h3>
        {formError && <p style={{ color: "red" }}>Error: {formError}</p>}
        <form onSubmit={submitNewEntry}>
          <div>
            <label>Description: </label>
            <input
              type='text'
              value={description}
              onChange={({ target }) => setDescription(target.value)}
              required
            />
          </div>
          <div>
            <label>Date: </label>
            <input
              type='date'
              value={date}
              onChange={({ target }) => setDate(target.value)}
              required
            />
          </div>
          <div>
            <label>Specialist: </label>
            <input
              type='text'
              value={specialist}
              onChange={({ target }) => setSpecialist(target.value)}
              required
            />
          </div>
          <div>
            <label>Health Rating: </label>
            <select
              value={healthCheckRating}
              onChange={({ target }) =>
                setHealthCheckRating(Number(target.value) as HealthCheckRating)
              }
              required
            >
              {Object.keys(HealthCheckRating)
                .filter((key) => isNaN(Number(key)))
                .map((key) => (
                  <option
                    key={key}
                    value={
                      HealthCheckRating[key as keyof typeof HealthCheckRating]
                    }
                  >
                    {key} (
                    {HealthCheckRating[key as keyof typeof HealthCheckRating]})
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label>Diagnosis Codes (comma-separated): </label>
            <input
              type='text'
              value={diagnosisCodes}
              onChange={({ target }) => setDiagnosisCodes(target.value)}
            />
          </div>
          <button type='submit' style={{ marginTop: "0.5em" }}>
            Add Entry
          </button>
        </form>
      </div>

      <h3>Entries</h3>
      {patient.entries.length > 0 ? (
        patient.entries.map((entry: Entry) => (
          <div
            key={entry.id}
            style={{
              border: "1px solid grey",
              borderRadius: "5px",
              padding: "2px",
              marginBottom: "5px",
            }}
          >
            <p>
              {entry.date} <EntryIcon type={entry.type} />
            </p>
            <p>{entry.description}</p>

            <EntryDetails entry={entry} />
            {entry.diagnosisCodes && entry.diagnosisCodes.length > 0 && (
              <>
                <ul>
                  {entry.diagnosisCodes.map((code) => (
                    <li key={code}>
                      {code} {getDiagnosisName(code) || "(Code not found)"}
                    </li>
                  ))}
                </ul>
              </>
            )}
            <p>Diagnose by {entry.specialist}</p>
          </div>
        ))
      ) : (
        <p>No entries for this patient yet.</p>
      )}
    </div>
  );
};

export default PatienInformationPage;
