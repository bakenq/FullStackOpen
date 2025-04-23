import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Patient, Entry, Diagnosis } from "../../types";

import EntryDetails from "./EntryDetails";

import diagnosesService from "../../services/diagnoses";

import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import WorkIcon from "@mui/icons-material/Work";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";

const PatienInformationPage = () => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiBaseUrl = "http://localhost:3001";

  useEffect(() => {
    const fetchPatientAndDiagnoses = async () => {
      if (!id) {
        setError("Patient ID missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const patientResponse = await axios.get<Patient>(
          `${apiBaseUrl}/api/patients/${id}`
        );
        setPatient(patientResponse.data);

        const diagnosesList = await diagnosesService.getAll();
        setDiagnoses(diagnosesList);
      } catch (e: unknown) {
        let errorMessage = "Failed to fetch data.";
        // Handle errors
        if (axios.isAxiosError(e)) {
          if (
            e.request?.responseURL?.includes(`/api/patients/${id}`) &&
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
  }, [id]);

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
