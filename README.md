# 🏋️ FitFusion AI

> A full-stack personalized fitness and wellness platform built with React, Django, MySQL, and Google Gemini AI.

FitFusion AI is a web-based fitness management platform that helps users manage their **workouts, diet, hydration, fitness progress, profile information, and AI-powered fitness guidance** from one centralized application.

The project combines a **React + Vite frontend**, **Django backend**, **relational database**, and **Google Gemini AI** to provide a personalized fitness experience.

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Main Modules](#-main-modules)
- [User Profile](#-user-profile)
- [Dashboard](#-dashboard)
- [Workout Management](#-workout-management)
- [Diet Management](#-diet-management)
- [Water Tracker](#-water-tracker)
- [Progress Tracking](#-progress-tracking)
- [AI Coach](#-ai-coach)
- [AI Fitness Score](#-ai-fitness-score)
- [AI Daily Plan](#-ai-daily-plan)
- [AI Fitness Chatbot](#-ai-fitness-chatbot)
- [Gemini Fallback System](#-gemini-fallback-system)
- [Technology Stack](#-technology-stack)
- [System Architecture](#-system-architecture)
- [Project Structure](#-project-structure)
- [Application Flow](#-application-flow)
- [API Overview](#-api-overview)
- [Database Design](#-database-design)
- [AI Personalization](#-ai-personalization)
- [Authentication](#-authentication)
- [Error Handling](#-error-handling)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Database Setup](#-database-setup)
- [Running the Project](#-running-the-project)
- [Security](#-security)
- [Current Status](#-current-status)
- [Future Improvements](#-future-improvements)
- [Project Objectives](#-project-objectives)
- [License](#-license)

---

# 🎯 Overview

FitFusion AI is designed to provide a centralized platform for managing different aspects of a user's fitness journey.

Instead of using separate applications for workouts, nutrition, hydration, and progress tracking, FitFusion combines these features into a single system.

The platform allows users to:

- Manage their personal fitness profile
- Set fitness goals
- Select dietary preferences
- Follow workout plans
- Track completed workouts
- Follow personalized diet plans
- Complete meals
- Track daily water intake
- Monitor fitness progress
- View workout history
- Calculate an AI Fitness Score
- Generate an AI Daily Plan
- Chat with an AI fitness coach

---

# ✨ Key Features

| Feature | Description |
|---|---|
| 👤 Profile Management | Manage fitness information, goals, diet preference and profile picture |
| 🏠 Dashboard | Centralized overview of fitness activities |
| 💪 Workout Management | Start, complete and track workouts |
| 🍽️ Diet Management | Personalized meal plans based on goals and dietary preference |
| 🥗 Diet Filtering | Vegetarian, Eggetarian, Non-Vegetarian and Vegan support |
| 💧 Water Tracker | Record, view and delete daily water intake |
| 📊 Progress Tracking | Workout statistics, charts and recent history |
| 🧠 AI Fitness Score | Score fitness performance from 0–100 |
| 📅 AI Daily Plan | Personalized daily fitness recommendations |
| 💬 AI Chatbot | Interactive AI fitness assistant |
| 🛡️ AI Fallback | Local fallback when Gemini is unavailable |
| ⏱️ Timeout Handling | Prevents AI requests from loading indefinitely |

---

# 👤 User Profile

The Profile module stores the user's personal fitness information.

Users can manage:

- Personal information
- Fitness goal
- Current weight
- Target weight
- Diet preference
- Daily water goal
- Profile picture

## Supported Diet Preferences

FitFusion supports four dietary preferences:

### 🥗 Vegetarian

Excludes:

- Meat
- Seafood
- Eggs

### 🥚 Eggetarian

Allows:

- Vegetarian food
- Eggs

Excludes:

- Meat
- Seafood

### 🍗 Non-Vegetarian

Allows:

- Vegetarian food
- Eggs
- Meat
- Seafood

### 🌱 Vegan

Excludes:

- Meat
- Seafood
- Eggs
- Dairy

The selected diet preference is used by the diet module when filtering available food options.

---

# 🏠 Dashboard

The Dashboard acts as the main entry point of the application.

It provides access to:

- Workout
- Diet
- Water Tracker
- Progress
- Profile
- AI Coach

The dashboard connects information from multiple modules and provides a centralized fitness experience.

---

# 💪 Workout Management

The Workout module allows users to follow and track workout sessions.

## Features

- View available workouts
- Start a workout session
- View exercises
- Complete individual exercises
- Complete a complete workout
- Track completed workouts
- Store workout completion information
- Use workout activity in progress calculations
- Use workout activity in AI Fitness Score calculations

## Workout Flow

```text
User selects workout
        ↓
Start workout session
        ↓
Perform exercises
        ↓
Complete individual exercises
        ↓
Complete workout
        ↓
Workout stored as completed
        ↓
Progress and AI Score updated
