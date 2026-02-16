# Admin Survey Management Page

## Overview
Complete admin interface for creating and managing carbon tracking surveys with full integration to the Supabase backend.

## Location
`src/pages/AdminSurveyManagement.tsx`

## Features

### 1. Survey List with Tabs
- **Active Surveys**: Currently running surveys
- **Draft Surveys**: Unpublished surveys being prepared
- **Closed Surveys**: Completed surveys

### 2. Create Survey Dialog
The comprehensive survey creation form includes:

#### Basic Information
- **Title**: Survey name (required)
- **Description**: Purpose and details
- **Target Audience**: Students, Faculty, or Both
- **Status**: Draft, Active, or Closed
- **Start Date**: When survey becomes available
- **End Date**: When survey closes

#### Question Builder
Build custom questions with:
- **Question Text**: The question to ask
- **Question Type**: 
  - Text: Free-form text input
  - Number: Numeric input
  - Dropdown: Select from options
  - Radio Buttons: Single choice
  - Checkboxes: Multiple choice
- **Options**: For select/radio/checkbox types (comma-separated)
- **Emission Category**: Link to carbon calculation
  - electricity, diesel, petrol, lpg, png
  - travel, water, paper, ewaste, organic_waste
  - other
- **Conversion Factor**: Multiply answer by this to get kg CO₂
  - Example: 0.82 for electricity (kWh → kg CO₂)
- **Required**: Make question mandatory

### 3. Survey Management
Each survey card shows:
- Title and description
- Target audience
- Response count (live)
- Creation date
- Start/End dates

**Actions:**
- View Responses: See all survey submissions
- Analytics: View statistics and carbon totals
- Activate: Change draft to active
- Close: End an active survey
- Delete: Remove survey (with confirmation)

### 4. Responses View
Displays all survey responses in a table:
- User name
- Department
- Submission timestamp
- Total carbon emissions
- View details button (opens modal with full response)

### 5. Analytics Dashboard
Shows survey statistics:
- **Total Responses**: Count of submissions
- **Total Carbon Emissions**: Sum of all responses
- **Average per Response**: Mean carbon footprint
- **Questions List**: All questions with metadata

## Integration

### Hooks Used
```typescript
import {
  useSurveys,           // Fetch surveys by status
  useCreateSurvey,      // Create new survey
  useUpdateSurvey,      // Update survey (status, etc)
  useDeleteSurvey,      // Delete survey
  useCreateManyQuestions, // Bulk create questions
  useSurveyResponses,   // Get survey responses
  useSurveyAnalytics,   // Get analytics data
  useSurveyQuestions    // Get survey questions
} from '@/hooks/useSurveys';
```

### Supabase Tables
- `surveys`: Survey metadata
- `survey_questions`: Question definitions
- `survey_responses`: User submissions

## Usage

### Creating a Survey
1. Click "Create Survey" button
2. Fill in basic information
3. Add questions using the question builder
4. Click "Add Question" for each question
5. Review added questions
6. Click "Create Survey"

### Managing Questions
- Questions are displayed in order added
- Each shows: type, options, category, factor
- Remove with trash icon
- No editing after creation (delete & recreate survey)

### Viewing Responses
1. Click "View Responses" on any survey
2. Browse table of all submissions
3. Click eye icon to see full response details
4. View calculated emissions breakdown

### Analytics
1. Click "Analytics" on any survey
2. See high-level statistics
3. Review all questions in the survey
4. Export data (future feature)

## UI Components Used
- Card, Dialog, Tabs, Table, Badge
- Input, Textarea, Select, Switch
- Button, Label, Separator
- ScrollArea for long lists
- Alert for empty states

## Emission Categories

### Standard Categories
- **electricity**: kWh usage
- **diesel**: Liters consumed
- **petrol**: Liters consumed
- **lpg**: Kilograms used
- **png**: Cubic meters
- **travel**: Kilometers traveled
- **water**: Liters consumed
- **paper**: Kilograms used
- **ewaste**: Kilograms disposed
- **organic_waste**: Kilograms composted
- **other**: Custom category

### Conversion Factors
Examples (adjust based on your emission factors):
- Electricity: 0.82 kg CO₂/kWh
- Diesel: 2.68 kg CO₂/L
- Petrol: 2.31 kg CO₂/L
- LPG: 3.0 kg CO₂/kg
- PNG: 2.0 kg CO₂/m³
- Travel (car): 0.12 kg CO₂/km
- Water: 0.0003 kg CO₂/L

## Styling
Uses Tailwind CSS with shadcn/ui components for:
- Responsive grid layouts
- Consistent spacing and typography
- Dark mode support
- Accessible form controls
- Professional appearance

## Best Practices

### Survey Design
1. Use clear, concise question text
2. Provide appropriate options for select/radio/checkbox
3. Set conversion factors based on emission factors table
4. Mark important questions as required
5. Start surveys as draft, activate when ready

### Response Collection
- Monitor response count
- Review responses regularly
- Check for anomalies in carbon totals
- Use analytics to identify trends

### Data Quality
- Set appropriate conversion factors
- Use correct emission categories
- Validate numeric inputs in questions
- Provide clear instructions in description

## Future Enhancements
- Edit existing surveys
- Clone/duplicate surveys
- Export responses to CSV
- Response filtering and search
- Question templates
- Conditional questions
- Email notifications
- Scheduled survey activation
