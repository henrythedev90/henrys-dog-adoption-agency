"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Slider,
  FormControl,
  FormLabel,
  Paper,
} from "@mui/material";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import SplitText from "@/components/ui/SplitText";
import { apiClient } from "@/lib/apiClient";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import styles from "./get-started.module.css";

interface SurveyData {
  size: string;
  ageRange: [number, number]; // [minAge, maxAge]
  energy_level: number;
  barking_level: number;
  shedding_level: number;
  good_with_children: boolean;
  good_with_other_dogs: boolean;
  good_with_strangers: boolean;
  good_with_other_animals: boolean;
  borough: string;
  gender: string;
}

const steps = [
  "Size & Age",
  "Energy & Behavior",
  "Living Situation",
  "Location",
];

export default function GetStarted() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [surveyData, setSurveyData] = useState<SurveyData>({
    size: "medium",
    ageRange: [0, 5], // Default range: 0-5 years
    energy_level: 3,
    barking_level: 2,
    shedding_level: 2,
    good_with_children: true,
    good_with_other_dogs: true,
    good_with_strangers: true,
    good_with_other_animals: true,
    borough: "Manhattan",
    gender: "any",
  });

  const handleNext = async () => {
    if (activeStep === steps.length - 1) {
      setIsSaving(true);
      try {
        await apiClient.post("/auth/user/preferences", surveyData);
        localStorage.setItem("dogPreferences", JSON.stringify(surveyData));
        router.push("/dogs/suggested");
      } catch (error) {
        console.error("Error saving preferences:", error);
        router.push("/dogs");
      } finally {
        setIsSaving(false);
      }
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box
            sx={{
              mt: 4,
              display: "grid",
              gridTemplateRows: "auto auto",
              gridTemplateColumns: "1fr 1fr",
              "& > *:last-child": {
                gridColumn: "1 / -1",
              },
              gap: 1,
            }}
          >
            <FormControl component="fieldset" sx={{ mb: 4 }}>
              <FormLabel>Preferred Dog Size</FormLabel>
              <RadioGroup
                value={surveyData.size}
                onChange={(e) =>
                  setSurveyData({ ...surveyData, size: e.target.value })
                }
              >
                <FormControlLabel
                  value="small"
                  control={<Radio />}
                  label="Small"
                />
                <FormControlLabel
                  value="medium"
                  control={<Radio />}
                  label="Medium"
                />
                <FormControlLabel
                  value="large"
                  control={<Radio />}
                  label="Large"
                />
              </RadioGroup>
            </FormControl>

            <FormControl component="fieldset" sx={{ mb: 4 }}>
              <FormLabel>Preferred Gender</FormLabel>
              <RadioGroup
                value={surveyData.gender}
                onChange={(e) =>
                  setSurveyData({ ...surveyData, gender: e.target.value })
                }
              >
                <FormControlLabel
                  value="male"
                  control={<Radio />}
                  label="Male"
                />
                <FormControlLabel
                  value="female"
                  control={<Radio />}
                  label="Female"
                />
                <FormControlLabel
                  value="any"
                  control={<Radio />}
                  label="No Preference"
                />
              </RadioGroup>
            </FormControl>

            <FormControl fullWidth sx={{ mt: 4 }}>
              <FormLabel>Preferred Age Range (years)</FormLabel>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Select the age range you&apos;re comfortable with. Puppies (0-1
                year) require more training and attention, while older dogs may
                be calmer but could have health considerations.
              </Typography>
              <Slider
                value={surveyData.ageRange}
                onChange={(_, value) =>
                  setSurveyData({
                    ...surveyData,
                    ageRange: value as [number, number],
                  })
                }
                min={0}
                max={15}
                marks={[
                  { value: 0, label: "0" },
                  { value: 5, label: "5" },
                  { value: 10, label: "10" },
                  { value: 15, label: "15" },
                ]}
                valueLabelDisplay="auto"
                disableSwap
              />
              <Typography
                variant="body2"
                color="text.secondary"
                align="center"
                sx={{ mt: 1 }}
              >
                {`${surveyData.ageRange[0]} - ${surveyData.ageRange[1]} years`}
              </Typography>
            </FormControl>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 4 }}>
            <FormControl fullWidth sx={{ mb: 6 }}>
              <FormLabel sx={{ mb: 2 }}>Energy Level</FormLabel>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                1: Very calm, minimal exercise needed 5: Highly energetic, needs
                lots of activity
              </Typography>
              <Slider
                value={surveyData.energy_level}
                onChange={(_, value) =>
                  setSurveyData({
                    ...surveyData,
                    energy_level: value as number,
                  })
                }
                min={1}
                max={5}
                marks
                valueLabelDisplay="auto"
              />
              <Typography
                variant="body2"
                color="text.secondary"
                align="center"
                sx={{ mt: 2 }}
              >
                {surveyData.energy_level === 1
                  ? "Very Calm"
                  : surveyData.energy_level === 2
                  ? "Calm"
                  : surveyData.energy_level === 3
                  ? "Moderate"
                  : surveyData.energy_level === 4
                  ? "Energetic"
                  : "Very Energetic"}
              </Typography>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 6 }}>
              <FormLabel sx={{ mb: 2 }}>Barking Level</FormLabel>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                1: Rarely barks, very quiet 5: Frequent barker, may need
                training
              </Typography>
              <Slider
                value={surveyData.barking_level}
                onChange={(_, value) =>
                  setSurveyData({
                    ...surveyData,
                    barking_level: value as number,
                  })
                }
                min={1}
                max={5}
                marks
                valueLabelDisplay="auto"
              />
              <Typography
                variant="body2"
                color="text.secondary"
                align="center"
                sx={{ mt: 2 }}
              >
                {surveyData.barking_level === 1
                  ? "Very Quiet"
                  : surveyData.barking_level === 2
                  ? "Quiet"
                  : surveyData.barking_level === 3
                  ? "Moderate"
                  : surveyData.barking_level === 4
                  ? "Vocal"
                  : "Very Vocal"}
              </Typography>
            </FormControl>

            <FormControl fullWidth>
              <FormLabel sx={{ mb: 2 }}>Shedding Level</FormLabel>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                1: Minimal shedding, hypoallergenic 5: Heavy shedding, regular
                grooming needed
              </Typography>
              <Slider
                value={surveyData.shedding_level}
                onChange={(_, value) =>
                  setSurveyData({
                    ...surveyData,
                    shedding_level: value as number,
                  })
                }
                min={1}
                max={5}
                marks
                valueLabelDisplay="auto"
              />
              <Typography
                variant="body2"
                color="text.secondary"
                align="center"
                sx={{ mt: 2 }}
              >
                {surveyData.shedding_level === 1
                  ? "Minimal Shedding"
                  : surveyData.shedding_level === 2
                  ? "Light Shedding"
                  : surveyData.shedding_level === 3
                  ? "Moderate Shedding"
                  : surveyData.shedding_level === 4
                  ? "Heavy Shedding"
                  : "Very Heavy Shedding"}
              </Typography>
            </FormControl>
          </Box>
        );

      case 2:
        return (
          <Box
            sx={{
              mt: 4,
              display: "grid",
              gridTemplateRows: "auto auto",
              gridTemplateColumns: "1fr 1fr",
              "& > *:last-child": {
                gridColumn: "1 / -1",
              },
              gap: 1,
            }}
          >
            {/* Children question */}
            <FormControl component="fieldset">
              <FormLabel>Do you have children?</FormLabel>
              <RadioGroup
                value={surveyData.good_with_children}
                onChange={(e) =>
                  setSurveyData({
                    ...surveyData,
                    good_with_children: e.target.value === "true",
                  })
                }
              >
                <FormControlLabel
                  value={true}
                  control={<Radio />}
                  label="Yes"
                />
                <FormControlLabel
                  value={false}
                  control={<Radio />}
                  label="No"
                />
              </RadioGroup>
            </FormControl>

            {/* Other dogs question */}
            <FormControl component="fieldset">
              <FormLabel>Do you have other dogs?</FormLabel>
              <RadioGroup
                value={surveyData.good_with_other_dogs}
                onChange={(e) =>
                  setSurveyData({
                    ...surveyData,
                    good_with_other_dogs: e.target.value === "true",
                  })
                }
              >
                <FormControlLabel
                  value={true}
                  control={<Radio />}
                  label="Yes"
                />
                <FormControlLabel
                  value={false}
                  control={<Radio />}
                  label="No"
                />
              </RadioGroup>
            </FormControl>

            {/* Other pets question */}
            <FormControl component="fieldset">
              <FormLabel>Do you have other pets?</FormLabel>
              <RadioGroup
                value={surveyData.good_with_other_animals}
                onChange={(e) =>
                  setSurveyData({
                    ...surveyData,
                    good_with_other_animals: e.target.value === "true",
                  })
                }
              >
                <FormControlLabel
                  value={true}
                  control={<Radio />}
                  label="Yes"
                />
                <FormControlLabel
                  value={false}
                  control={<Radio />}
                  label="No"
                />
              </RadioGroup>
            </FormControl>
          </Box>
        );

      case 3:
        return (
          <Box sx={{ mt: 4 }}>
            <FormControl component="fieldset">
              <FormLabel>Preferred Borough</FormLabel>
              <RadioGroup
                value={surveyData.borough}
                onChange={(e) =>
                  setSurveyData({ ...surveyData, borough: e.target.value })
                }
              >
                <FormControlLabel
                  value="Manhattan"
                  control={<Radio />}
                  label="Manhattan"
                />
                <FormControlLabel
                  value="Brooklyn"
                  control={<Radio />}
                  label="Brooklyn"
                />
                <FormControlLabel
                  value="Queens"
                  control={<Radio />}
                  label="Queens"
                />
                <FormControlLabel
                  value="Bronx"
                  control={<Radio />}
                  label="Bronx"
                />
                <FormControlLabel
                  value="Staten Island"
                  control={<Radio />}
                  label="Staten Island"
                />
              </RadioGroup>
            </FormControl>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <ProtectedRoute>
      <div className={styles.parentContainer}>
        <Container className={styles.Container}>
          <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom align="center">
              <SplitText copy="Find Your Perfect Dog Match" role="heading" />
            </Typography>
            <Typography
              variant="subtitle1"
              gutterBottom
              align="center"
              sx={{ mb: 4 }}
            >
              Answer a few questions to help us find the right dog for you
            </Typography>

            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {renderStepContent(activeStep)}

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}
            >
              <Button
                disabled={activeStep === 0 || isSaving}
                onClickFunction={handleBack}
                variant="secondary"
                type="button"
              >
                Back
              </Button>
              <Button
                variant="primary"
                onClickFunction={handleNext}
                disabled={isSaving}
                type="button"
              >
                {isSaving
                  ? "Saving..."
                  : activeStep === steps.length - 1
                  ? "Find My Match"
                  : "Next"}
              </Button>
            </Box>
          </Paper>
        </Container>
      </div>
    </ProtectedRoute>
  );
}
