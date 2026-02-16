# Survey Management System - Implementation Guide

## 🎯 Overview

A complete survey management system has been created where:
- **Admins** can create custom surveys with questions
- **Students & Faculty** fill out role-specific surveys
- All data is stored in database and automatically analyzed
- Carbon emissions are calculated from survey responses

## 📋 Database Tables Created

### 1. `surveys` - Admin-created surveys
- Stores survey metadata (title, description, target audience)
- Status: draft, active, or closed
- Can target: students, faculty, or both

### 2. `survey_questions` - Questions for each survey
- Supports multiple question types: text, number, select, radio, checkbox
- Includes emission calculation metadata
- Order can be controlled

### 3. `survey_responses` - User responses
- One response per user per survey
- Automatic carbon calculation via database trigger
- Stores calculated emissions by category

## 🚀 Setup Instructions

### Step 1: Run the Migration

In Supabase SQL Editor, run:
```sql
-- Copy and paste content from:
supabase/migrations/005_survey_system.sql
```

This creates:
- ✅ 3 new tables
- ✅ Automatic calculation function
- ✅ Row-level security policies
- ✅ 2 sample surveys (Student & Faculty)

### Step 2: Verify Sample Data

Check if sample surveys were created:
```sql
SELECT * FROM surveys;
SELECT * FROM survey_questions ORDER BY survey_id, order_index;
```

You should see:
- 1 Student survey with 8 questions
- 1 Faculty survey with 6 questions

## 🎨 Features

### For Admins

1. **Create Surveys**
   - Set title, description
   - Choose target audience (student/faculty/both)
   - Set status (draft/active/closed)

2. **Add Questions**
   - Multiple question types
   - Link questions to emission categories
   - Set conversion factors for auto-calculation

3. **View Responses**
   - See all submissions
   - View analytics (total responses, avg carbon)
   - Department-wise breakdowns

### For Students/Faculty

1. **View Active Surveys**
   - Only see surveys for their role
   - Answer questions in order

2. **Submit Responses**
   - Fill out survey once
   - Automatic carbon calculation
   - Personalized results

## 📊 How Carbon Calculation Works

**Example: Student Survey**

1. Student answers: "I use devices 8 hours/day"
2. Question has `conversion_factor: 0.082` (electricity factor)
3. Calculation: `8 * 0.082 = 0.656 kWh`
4. This is stored in `calculated_emissions.electricity`
5. All categories are summed for `total_carbon`

## 🔐 Security & Permissions

**Row-Level Security Policies:**

- **Admins** can:
  - Create/update/delete surveys
  - View all responses
  - Manage all questions

- **Students/Faculty** can:
  - View active surveys for their role
  - Submit their own responses
  - View only their own submissions

## 📝 Next Steps (To Be Implemented)

### 1. Admin Survey Management Page
**File:** `src/pages/AdminSurveyManagement.tsx` ✅ Created

Features:
- List all surveys
- Create new survey
- Add/edit questions
- View responses & analytics
- Close surveys

### 2. Student Survey Page (Updated)
**File:** `src/pages/StudentSurvey.tsx` - Needs Update

Should show:
- List of active student surveys
- Survey form with dynamic questions
- Submit functionality
- View past responses

### 3. Faculty Survey Page (New)
**File:** `src/pages/FacultySurvey.tsx` - To Create

Similar to student survey but for faculty

### 4. Role-Based Routing
**File:** `src/App.tsx` - Needs Update

- Check user role from `useCurrentUser()`
- Show different nav/pages for admin vs student/faculty
- Protect admin routes

## 🛠️ Implementation Checklist

- [x] Database schema created
- [x] API functions added
- [x] TypeScript types defined
- [x] Sample surveys created
- [x] Admin management page (basic)
- [ ] Connect admin page to API
- [ ] Update student survey to use new system
- [ ] Create faculty survey page
- [ ] Add role-based routing
- [ ] Test end-to-end flow

## 💡 Usage Example

### Admin Creates Survey:
```typescript
const survey = await surveysApi.create({
  title: 'Campus Sustainability Survey',
  description: 'Help us track our carbon footprint',
  target_audience: 'both',
  status: 'draft'
});

await surveyQuestionsApi.createMany([
  {
    survey_id: survey.id,
    question_text: 'How do you commute?',
    question_type: 'select',
    options: ['Walk', 'Bus', 'Car'],
    order_index: 1,
    emission_category: 'travel',
    conversion_factor: 0.12
  }
]);

// Activate survey
await surveysApi.update(survey.id, { status: 'active' });
```

### Student Responds:
```typescript
await surveyResponsesApi.submit({
  survey_id: surveyId,
  user_id: currentUser.id,
  department_id: currentUser.department_id,
  responses: {
    [question1Id]: 'Bus',
    [question2Id]: 10 // km
  }
});
// Emissions calculated automatically!
```

## 🔗 File Locations

- **Migration**: `supabase/migrations/005_survey_system.sql`
- **Types**: `src/types/database.ts`
- **API**: `src/lib/supabase/api.ts`
- **Admin Page**: `src/pages/AdminSurveyManagement.tsx`

---

**Status**: Database & API layer complete. UI implementation in progress.
