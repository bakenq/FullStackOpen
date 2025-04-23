import React from "react";
import {
  Entry,
  HealthCheckRating,
  HealthCheckEntry,
  OccupationalHealthcareEntry,
  HospitalEntry,
} from "../../types"; // Ensure specific types are imported

import FavoriteIcon from "@mui/icons-material/Favorite";

/**
 * Helper function for exhaustive type checking
 */
const assertNever = (value: never): never => {
  throw new Error(
    `Unhandled discriminated union member: ${JSON.stringify(value)}`
  );
};

// --- Specific Entry Components/Rendering Logic ---

const HealthCheckEntryDetails: React.FC<{ entry: HealthCheckEntry }> = ({
  entry,
}) => {
  const HealthRatingIcon = ({ rating }: { rating: HealthCheckRating }) => {
    // ... (switch statement for heart color based on rating)
    switch (rating) {
      case HealthCheckRating.Healthy:
        return <FavoriteIcon style={{ color: "green" }} />;
      case HealthCheckRating.LowRisk:
        return <FavoriteIcon style={{ color: "yellow" }} />;
      case HealthCheckRating.HighRisk:
        return <FavoriteIcon style={{ color: "orange" }} />;
      case HealthCheckRating.CriticalRisk:
        return <FavoriteIcon style={{ color: "red" }} />;
      default:
        return null;
    }
  };
  return (
    <div>
      <HealthRatingIcon rating={entry.healthCheckRating} />
    </div>
  );
};

const OccupationalHealthcareEntryDetails: React.FC<{
  entry: OccupationalHealthcareEntry;
}> = ({ entry }) => {
  return (
    <div>
      <p>Employer: {entry.employerName}</p>
      {entry.sickLeave && (
        <p>
          Sick leave: {entry.sickLeave.startDate} to {entry.sickLeave.endDate}
        </p>
      )}
    </div>
  );
};

const HospitalEntryDetails: React.FC<{ entry: HospitalEntry }> = ({
  entry,
}) => {
  return (
    <div>
      <p></p>
      {entry.discharge && (
        <p>
          Discharge: {entry.discharge.date} ({entry.discharge.criteria})
        </p>
      )}
    </div>
  );
};

// --- Main EntryDetails Component ---

const EntryDetails: React.FC<{ entry: Entry }> = ({ entry }) => {
  switch (entry.type) {
    case "Hospital":
      return <HospitalEntryDetails entry={entry} />;
    case "OccupationalHealthcare":
      return <OccupationalHealthcareEntryDetails entry={entry} />;
    case "HealthCheck":
      return <HealthCheckEntryDetails entry={entry} />;
    default:
      return assertNever(entry);
  }
};

export default EntryDetails;
