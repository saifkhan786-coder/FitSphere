# Gym Smart

Smart Gym Management & Fitness Tracking System

Use the uploaded wireframe image as the primary reference for the application's UI structure, layout, navigation, and page hierarchy.

Build a modern, professional, responsive web application called Smart Gym Management & Fitness Tracking System.

The application has two separate roles:

Admin

Gym Member

The design should be clean, modern, premium, fitness-focused, and suitable for a final-year engineering project. Do not simply copy the wireframe visually; use it as a structural reference and create a polished production-quality interface.

Technology

Frontend:

React

TypeScript

Tailwind CSS

React Router

Lucide React icons

Recharts for analytics/charts

Backend-ready architecture:

REST API structure

Authentication-ready

Role-based access: ADMIN and MEMBER

Design components so they can later connect to Node.js + Express + MongoDB

For the first stage, focus primarily on the complete frontend UI and navigation using realistic mock data.

1. Authentication

Create a professional login page.

Features:

Email/username

Password

Show/hide password

Remember me

Forgot password

Login button

Admin login

Member login

After login, route the user according to their role.

Admin → Admin Dashboard

Member → Member Dashboard

Create protected routes for both roles.

2. Admin Panel

Create a persistent sidebar navigation.

Admin sidebar:

Dashboard

Members

Memberships

Payments

Attendance

Exercises

Analytics

Notifications

Settings

Logout

Top navbar:

Search

Notifications

Admin profile

Profile menu

Admin Dashboard

Show statistics cards:

Total Members

Active Members

Expiring Memberships

Monthly Revenue

Add:

Revenue chart

Membership statistics

Today's attendance

Recent members

Recent payments

Expiring memberships

Use Recharts for professional charts.

3. Member Management

Create a Members page.

Features:

Search members

Filter by membership status

Filter by membership plan

Add member

Edit member

View member

Delete member

Pagination

Table columns:

Name

Phone

Membership

Start Date

Expiry Date

Payment Status

Status

Actions

Use confirmation dialogs for destructive actions.

4. New Member Registration

Create a complete registration form.

Personal information:

Full name

Email

Phone

Date of birth

Gender

Address

Fitness information:

Height

Weight

Fitness goal

Experience level

Training days per week

Membership information:

Membership plan

Start date

Duration

Fee

Payment method

Initial payment

Add proper form validation.

After registration show a success notification.

5. Membership Management

Create membership plans:

Basic — 1 Month

Standard — 3 Months

Premium — 6 Months

Annual — 12 Months

Admin should be able to:

Create plan

Edit plan

Delete plan

Change price

Change duration

View active members for each plan

Show membership status:

Active

Expiring Soon

Expired

Use badges with clear visual distinction.

6. Payment Management

Create a payment management page.

Show:

Member

Payment date

Amount

Payment method

Payment status

Remaining amount

Receipt

Payment methods:

Cash

UPI

Card

Bank Transfer

Add:

Record payment

Edit payment

View payment

Generate/download receipt

Create payment statistics:

Today's revenue

This month's revenue

Pending payments

Total revenue

7. QR Attendance

Create an attendance page.

Show:

QR scanner area

Today's attendance

Present members

Absent members

Attendance percentage

Allow members to scan a gym QR code to mark attendance.

For now, create the frontend flow using mock data and make the architecture ready for real QR scanning later.

Show attendance history:

Daily

Weekly

Monthly

8. Exercise Library

Create an exercise library.

Categories:

Chest

Back

Shoulders

Biceps

Triceps

Legs

Abs

Cardio

Each exercise card should contain:

Exercise image/video placeholder

Exercise name

Target muscle

Equipment

Difficulty

Sets

Reps

Rest time

Instructions

Add:

Search

Category filter

Difficulty filter

Exercise details page

9. Workout System

Members should have a personalized workout page.

Example workout:

Chest + Triceps

Bench Press

4 sets

10 reps

40 kg

60 sec rest

Incline Dumbbell Press

3 sets

10 reps

Cable Fly

3 sets

12 reps

Push-ups

3 sets

Add a workout timer.

Timer functionality:

Start

Pause

Reset

Countdown

Rest timer

Set completion

Show:

Current exercise

Current set

Reps

Weight

Rest time

Workout progress

When a set is completed, update the progress indicator.

10. Nutrition Tracker

Create a nutrition tracking page.

Meal categories:

Breakfast

Lunch

Snacks

Dinner

Food search.

Each food item should display:

Calories

Protein

Carbohydrates

Fat

Fiber

Serving size

Allow members to add food to meals.

Automatically calculate:

Total calories

Total protein

Total carbs

Total fat

Total fiber

Show nutrition progress using progress bars and charts.

Example:

Calories:
1850 / 2400 kcal

Protein:
125 / 140 g

Carbs:
220 / 300 g

Fat:
52 / 70 g

11. Calorie & Macro Calculator

Create a calculator where the member enters:

Age

Gender

Height

Weight

Activity level

Fitness goal

Goals:

Muscle Gain

Weight Loss

Maintenance

Calculate an estimated:

Daily calorie target

Protein target

Carbohydrate target

Fat target

Present the results clearly.

Include a disclaimer that these are general estimates and not medical advice.

12. Member Dashboard

Create a personalized dashboard.

Header:

"Hello, Rahul 👋"

Show:

Current weight

Target weight

Daily calories

Daily protein

Monthly workouts

Membership remaining days

Show:

Today's Workout

Example:

Chest + Triceps

4 Exercises · 45 min

[Start Workout]

Today's Nutrition

Calories
1850 / 2400

Protein
125 / 140g

Carbs
220 / 300g

Fat
52 / 70g

Recent Progress

Show a weight progress chart.

Achievements

Examples:

7 Day Streak

10 Workouts Completed

50 Workouts Completed

13. Progress Tracking

Create a progress page.

Track:

Weight

Chest

Waist

Arms

Thighs

Workout performance

Create charts using Recharts.

Tabs:

Weight

Measurements

Workout Performance

Allow members to add new progress records.

14. Member Profile

Create a profile page.

Show:

Profile photo

Name

Email

Phone

Height

Weight

Fitness goal

Experience level

Training frequency

Allow editing profile information.

15. Notifications

Create a notification center.

Examples:

Membership expires in 5 days

Payment pending

Workout reminder

Nutrition target not reached

New achievement

Membership renewed

Show unread/read states.

16. AI Fitness Coach

Create an optional AI Fitness Coach page.

Create a modern chat interface.

Example user message:

"I want a chest workout for today."

Example response:

"Here's a beginner-friendly chest workout:

Bench Press — 4 × 8-10

Incline Dumbbell Press — 3 × 10

Cable Fly — 3 × 12

Push-ups — 3 sets"

For the first version, use mock responses and create the interface so a real AI API can be connected later.

Do not provide medical diagnosis or unsafe medical advice.

17. Gamification

Create an achievements section.

Examples:

🔥 7 Day Streak

💪 10 Workouts Completed

🏆 50 Workouts Completed

🥇 Goal Achieved

Create an XP system and optional leaderboard.

18. Design System

Use a premium modern gym aesthetic.

Requirements:

Responsive desktop/tablet/mobile design

Clean typography

Strong visual hierarchy

Rounded cards

Subtle shadows

Professional charts

Consistent spacing

Modern icons

Accessible contrast

Smooth hover states

Loading states

Empty states

Error states

Toast notifications

Confirmation dialogs

Use a dark/charcoal + white base with a strong fitness accent color.

Avoid making every page overly dark.

The UI should feel like a modern SaaS dashboard combined with a premium fitness application.

19. Navigation

Admin:

Login
→ Admin Dashboard
→ Members
→ Member Registration
→ Memberships
→ Payments
→ Attendance
→ Exercises
→ Analytics
→ Notifications
→ Settings

Member:

Login
→ Member Dashboard
→ Workout
→ Exercise Library
→ Nutrition
→ Calorie/Macro Calculator
→ Progress
→ Attendance
→ Membership
→ Profile
→ Achievements
→ AI Fitness Coach

20. Important Development Rule

First build the complete frontend experience with realistic mock data.

Do NOT leave pages as empty placeholders.

Every page should have:

Proper layout

Navigation

Forms

Tables

Cards

Charts where appropriate

Buttons

Modals

Loading states

Empty states

Sample data

Keep the code modular and reusable.

Create reusable components for:

Sidebar

Navbar

StatCard

DataTable

Modal

FormField

Button

Badge

Chart

ProgressBar

Notification

WorkoutCard

FoodCard

ExerciseCard

The application should be structured so that the mock data can later be replaced with APIs from a Node.js + Express + MongoDB backend without rebuilding the UI.

Use the uploaded wireframe as the structural reference, but improve the visual design substantially and make the final application feel like a real commercial product.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/536d81f7-6e7e-4994-b8a6-86ea2f3a9b89).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
