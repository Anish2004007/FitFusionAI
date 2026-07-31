# 🏋️ FitFusion AI

> **Smart Fitness. Better You.**

FitFusion AI is an AI-powered fitness web application developed using **Django**. It helps users achieve their fitness goals by providing personalized workout plans, diet recommendations, progress tracking, and AI-powered fitness assistance.

---

## 📌 Project Overview

FitFusion AI is designed to simplify fitness management by combining intelligent recommendations with an easy-to-use interface. The application provides secure authentication, personalized user profiles, workout planning, nutrition guidance, and progress monitoring.

---

## ✨ Current Features

### 🔐 Authentication Module
- User Registration
- Secure Login & Logout
- Email OTP Verification
- Beautiful HTML OTP Email
- Forgot Password
- Password Reset using OTP
- Password Hashing
- Session Management

### 🎨 Landing Page
- Modern Responsive UI
- Hero Section
- Features Section
- Professional Footer
- Smooth Navigation
- Mobile Responsive Design

### 📧 Email System
- Gmail SMTP Integration
- Professional HTML Email Templates
- OTP Verification Email
- Password Reset Email

---

## 🚀 Upcoming Features

- 👤 User Profile Setup
- 🤖 AI Workout Generator
- 🥗 AI Diet Planner
- 📊 Progress Tracker
- 📈 BMI & BMR Calculator
- 💧 Water Intake Tracker
- 🎯 Goal Management
- 💬 AI Fitness Chatbot
- 📄 Reports & Analytics
- 📱 Fully Responsive Dashboard

---

## 🛠 Tech Stack

### Frontend
- HTML5
- CSS3
- Bootstrap 5
- JavaScript

### Backend
- Python
- Django

### Database
- MySQL

### Authentication
- Email OTP Verification
- Secure Password Hashing

### Email Service
- Gmail SMTP

### Version Control
- Git
- GitHub

---

## 📂 Project Structure

```text
FitFusionAI/
│
├── accounts/
├── chatbot/
├── dashboard/
├── diet/
├── goals/
├── reports/
├── tracker/
├── workout/
│
├── static/
│   ├── css/
│   ├── images/
│   ├── js/
│
├── templates/
│   ├── accounts/
│   ├── components/
│   ├── emails/
│
├── media/
├── manage.py
├── requirements.txt
└── README.md
```

---

## ⚙️ Installation

### 1. Clone Repository

```bash
git clone https://github.com/Anish2004007/FitFusionAI.git
```

### 2. Navigate to Project

```bash
cd FitFusionAI
```

### 3. Create Virtual Environment

```bash
python -m venv venv
```

### 4. Activate Virtual Environment

#### Windows

```bash
venv\Scripts\activate
```

#### Linux / macOS

```bash
source venv/bin/activate
```

### 5. Install Dependencies

```bash
pip install -r requirements.txt
```

### 6. Configure Environment Variables

Create a `.env` file in the project root:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
EMAIL_USE_TLS=True
```

### 7. Configure Database

Update your MySQL credentials in `settings.py`.

### 8. Run Migrations

```bash
python manage.py migrate
```

### 9. Start Server

```bash
python manage.py runserver
```

Open:

```
http://127.0.0.1:8000
```

---

## 📸 Screenshots

> Screenshots of the application will be added as development progresses.

---

## 📅 Development Status

| Module | Status |
|---------|--------|
| Landing Page | ✅ Completed |
| Authentication | ✅ Completed |
| OTP Verification | ✅ Completed |
| Forgot Password | ✅ Completed |
| Dashboard | 🚧 In Progress |
| User Profile | 🚧 Upcoming |
| AI Workout Planner | 🚧 Upcoming |
| Diet Planner | 🚧 Upcoming |
| Chatbot | 🚧 Upcoming |

---

## 🔒 Security Features

- Password Hashing
- OTP Expiration
- Session Authentication
- Secure Email Verification
- CSRF Protection
- Django Security Middleware

---

## 🎯 Project Objective

The objective of **FitFusion AI** is to provide users with a smart fitness platform that combines AI technology with personalized health recommendations to improve overall fitness and lifestyle.

---

## 👨‍💻 Developer

**Anish Gholap**

MCA Student

---

## 📜 License

This project is developed for educational purposes as part of an MCA Mini Project.

---

# ⭐ If you like this project, don't forget to star the repository!
