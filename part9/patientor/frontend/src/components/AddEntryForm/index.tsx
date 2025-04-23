import { useState, SyntheticEvent } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  OutlinedInput,
  Checkbox,
  ListItemText,
  SelectChangeEvent,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  Box,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import { Entry, Diagnosis, NewEntry, HealthCheckRating } from "../../types";
import patientService from "../../services/patients";

interface Props {
  patientId: string;
  diagnoses: Diagnosis[];
  onSubmitSuccess: (newEntry: Entry) => void;
}

const AddEntryForm = ({ patientId, diagnoses, onSubmitSuccess }: Props) => {
  // Form State
  const [entryType, setEntryType] = useState<NewEntry["type"]>("HealthCheck");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date | null>(null);
  const [specialist, setSpecialist] = useState("");
  const [diagnosisCodes, setDiagnosisCodes] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  // HealthCheck specific
  const [healthCheckRating, setHealthCheckRating] = useState<HealthCheckRating>(
    HealthCheckRating.Healthy
  );

  // Hospital specific
  const [dischargeDate, setDischargeDate] = useState<Date | null>(null);
  const [dischargeCriteria, setDischargeCriteria] = useState("");

  // OccupationalHealthcare specific
  const [employerName, setEmployerName] = useState("");
  const [sickLeaveStartDate, setSickLeaveStartDate] = useState<Date | null>(
    null
  );
  const [sickLeaveEndDate, setSickLeaveEndDate] = useState<Date | null>(null);

  const resetForm = () => {
    setDescription("");
    setDate(null);
    setSpecialist("");
    setDiagnosisCodes([]);
    setHealthCheckRating(HealthCheckRating.Healthy);
    setDischargeDate(null);
    setDischargeCriteria("");
    setEmployerName("");
    setSickLeaveStartDate(null);
    setSickLeaveEndDate(null);
    setEntryType("HealthCheck");
    setFormError(null);
  };

  const submitNewEntry = async (event: SyntheticEvent) => {
    event.preventDefault();

    // Common base data
    const baseEntryData = {
      description,
      date: date ? date.toISOString().split("T")[0] : "",
      specialist,
      diagnosisCodes: diagnosisCodes,
    };

    // Format other dates
    const formattedDischargeDate = dischargeDate
      ? dischargeDate.toISOString().split("T")[0]
      : "";
    const formattedSickLeaveStartDate = sickLeaveStartDate
      ? sickLeaveStartDate.toISOString().split("T")[0]
      : "";
    const formattedSickLeaveEndDate = sickLeaveEndDate
      ? sickLeaveEndDate.toISOString().split("T")[0]
      : "";

    let entryToAdd: NewEntry;

    // Construct specific entry based on selected type
    try {
      switch (entryType) {
        case "HealthCheck":
          entryToAdd = {
            ...baseEntryData,
            type: "HealthCheck",
            healthCheckRating,
          };
          break;
        case "Hospital":
          if (!formattedDischargeDate || !dischargeCriteria) {
            throw new Error(
              "Discharge date and criteria are required for Hospital entries."
            );
          }
          entryToAdd = {
            ...baseEntryData,
            type: "Hospital",
            discharge: {
              date: formattedDischargeDate,
              criteria: dischargeCriteria,
            },
          };
          break;
        case "OccupationalHealthcare":
          if (!employerName) {
            throw new Error(
              "Employer name is required for Occupational Healthcare entries."
            );
          }
          const sickLeave =
            formattedSickLeaveStartDate && formattedSickLeaveEndDate
              ? {
                  startDate: formattedSickLeaveStartDate,
                  endDate: formattedSickLeaveEndDate,
                }
              : undefined;

          entryToAdd = {
            ...baseEntryData,
            type: "OccupationalHealthcare",
            employerName,
            sickLeave,
          };
          break;
        default:
          throw new Error(`Invalid entry type selected: ${entryType}`);
      }

      setFormError(null);
      const addedEntry = await patientService.addEntry(patientId, entryToAdd);

      onSubmitSuccess(addedEntry);

      // Reset form fields
      resetForm();
    } catch (e: unknown) {
      // Handle errors (validation errors from switch or API errors)
      let errorMessage = "Failed to add entry.";
      if (axios.isAxiosError(e)) {
        if (e.response?.data?.error && Array.isArray(e.response.data.error)) {
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

  return (
    <div
      style={{
        border: "1px dashed black",
        padding: "1em",
        marginTop: "1em",
        marginBottom: "1em",
      }}
    >
      <h3>Add New Entry</h3>
      {formError && <p style={{ color: "red" }}>Error: {formError}</p>}
      <Box component='form' onSubmit={submitNewEntry} sx={{ mt: 2 }}>
        {/* Entry Type Selector */}
        <FormControl fullWidth margin='normal'>
          <InputLabel id='entry-type-label'>Entry Type</InputLabel>
          <Select
            labelId='entry-type-label'
            value={entryType}
            label='Entry Type'
            onChange={(event: SelectChangeEvent<NewEntry["type"]>) =>
              setEntryType(event.target.value as NewEntry["type"])
            }
          >
            <MenuItem value='HealthCheck'>Health Check</MenuItem>
            <MenuItem value='Hospital'>Hospital</MenuItem>
            <MenuItem value='OccupationalHealthcare'>
              Occupational Healthcare
            </MenuItem>
          </Select>
        </FormControl>

        {/* Common Fields */}
        <TextField
          label='Description'
          fullWidth
          margin='normal'
          value={description}
          onChange={({ target }) => setDescription(target.value)}
          required
        />
        <DatePicker
          label='Date'
          value={date}
          onChange={(newValue: Date | null) => setDate(newValue)}
          sx={{ width: "100%", mt: 1, mb: 1 }}
        />
        <TextField
          label='Specialist'
          fullWidth
          margin='normal'
          value={specialist}
          onChange={({ target }) => setSpecialist(target.value)}
          required
        />
        {/* Diagnosis Codes MultiSelect */}
        <FormControl fullWidth margin='normal'>
          <InputLabel id='diagnosis-codes-label'>Diagnosis Codes</InputLabel>
          <Select
            labelId='diagnosis-codes-label'
            multiple
            value={diagnosisCodes}
            onChange={(event: SelectChangeEvent<typeof diagnosisCodes>) => {
              const {
                target: { value },
              } = event;
              setDiagnosisCodes(
                typeof value === "string" ? value.split(",") : value
              );
            }}
            input={<OutlinedInput label='Diagnosis Codes' />}
            renderValue={(selected) => selected.join(", ")}
          >
            {diagnoses.map((diagnosis) => (
              <MenuItem key={diagnosis.code} value={diagnosis.code}>
                <Checkbox
                  checked={diagnosisCodes.indexOf(diagnosis.code) > -1}
                />
                <ListItemText
                  primary={`${diagnosis.code} - ${diagnosis.name}`}
                />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* --- Conditional Fields --- */}

        {/* HealthCheck Specific - Radio Buttons */}
        {entryType === "HealthCheck" && (
          <FormControl component='fieldset' margin='normal' required>
            <FormLabel component='legend'>Health Rating</FormLabel>
            <RadioGroup
              row
              aria-label='health rating'
              name='healthCheckRating'
              value={healthCheckRating}
              onChange={({ target }) =>
                setHealthCheckRating(Number(target.value) as HealthCheckRating)
              }
            >
              {Object.entries(HealthCheckRating)
                .filter(([key]) => isNaN(Number(key)))
                .map(([key, value]) => (
                  <FormControlLabel
                    key={key}
                    value={value}
                    control={<Radio />}
                    label={`${key} (${value})`}
                  />
                ))}
            </RadioGroup>
          </FormControl>
        )}

        {/* Hospital Specific */}
        {entryType === "Hospital" && (
          <Box
            sx={{
              border: "1px solid lightgrey",
              p: 2,
              mt: 1,
              borderRadius: 1,
            }}
          >
            <FormLabel component='legend' sx={{ mb: 1 }}>
              Discharge
            </FormLabel>
            <DatePicker
              label='Discharge Date'
              value={dischargeDate}
              onChange={(newValue) => setDischargeDate(newValue)}
              sx={{ width: "100%", mb: 1 }}
            />
            <TextField
              label='Discharge Criteria'
              fullWidth
              margin='normal'
              value={dischargeCriteria}
              onChange={({ target }) => setDischargeCriteria(target.value)}
              required={entryType === "Hospital"}
              multiline
              rows={2}
            />
          </Box>
        )}

        {/* OccupationalHealthcare Specific */}
        {entryType === "OccupationalHealthcare" && (
          <>
            <TextField
              label='Employer Name'
              fullWidth
              margin='normal'
              value={employerName}
              onChange={({ target }) => setEmployerName(target.value)}
              required={entryType === "OccupationalHealthcare"}
            />
            <Box
              sx={{
                border: "1px solid lightgrey",
                p: 2,
                mt: 1,
                borderRadius: 1,
              }}
            >
              <FormLabel component='legend' sx={{ mb: 1 }}>
                Sick Leave (Optional)
              </FormLabel>
              <DatePicker
                label='Start Date'
                value={sickLeaveStartDate}
                onChange={(newValue) => setSickLeaveStartDate(newValue)}
                sx={{ width: "100%", mb: 1 }}
              />
              <DatePicker
                label='End Date'
                value={sickLeaveEndDate}
                onChange={(newValue) => setSickLeaveEndDate(newValue)}
                sx={{ width: "100%", mb: 1 }}
              />
            </Box>
          </>
        )}
        {/* --- End Conditional Fields --- */}

        <Button
          type='submit'
          variant='contained'
          color='primary'
          sx={{ mt: 2 }}
        >
          Add Entry
        </Button>
      </Box>
    </div>
  );
};

export default AddEntryForm;
