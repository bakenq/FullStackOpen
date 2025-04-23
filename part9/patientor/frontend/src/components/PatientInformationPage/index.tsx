import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Patient, Entry } from "../../types"; // Import full Patient type

const PatienInformationPage = () => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiBaseUrl = "http://localhost:3001";

  useEffect(() => {
    const fetchPatientDetails = async () => {
      if (!id) {
        setError("Patient ID missing.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get<Patient>(
          `${apiBaseUrl}/api/patients/${id}`
        );
        setPatient(response.data);
      } catch (e: unknown) {
        // Handle errors
        let errorMessage = "Failed to fetch patient details.";
        if (axios.isAxiosError(e)) {
          if (e.response?.status === 404) {
            errorMessage = "Patient not found.";
          } else {
            errorMessage += ` Error: ${e.message}`;
          }
        } else if (e instanceof Error) {
          errorMessage += ` Error: ${e.message}`;
        }
        console.error(errorMessage);
        setError(errorMessage);
        setPatient(null);
      } finally {
        setLoading(false);
      }
    };

    void fetchPatientDetails();
  }, [id]);

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
          <div key={entry.id}>
            <p>
              {entry.date} {entry.description}
            </p>
            {entry.diagnosisCodes && entry.diagnosisCodes.length > 0 && (
              <>
                <ul>
                  {entry.diagnosisCodes.map((code) => (
                    <li key={code}>{code}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        ))
      ) : (
        <p>No entries for this patient yet.</p>
      )}
    </div>
  );
};

export default PatienInformationPage;
