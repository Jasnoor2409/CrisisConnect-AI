# 🚨 CrisisConnect AI

> An AI-powered emergency incident reporting and safety assistance platform.

CrisisConnect AI is a web-based emergency incident management platform that allows citizens to report emergency situations with their location and receive AI-powered classification, severity assessment, and safety recommendations.

This project is being developed as a team-based academic project and is currently at the **first evaluation stage (approximately 1/3 of the planned project)**.

---
ai project
## 🎯 Project Objective

During an emergency, citizens may not know how to properly describe an incident, determine its urgency, or identify immediate safety actions.

CrisisConnect AI aims to provide a centralized platform where users can:

- Register and securely log in
- Report emergency incidents
- Specify the incident location using an interactive map
- View their previously reported incidents
- Receive AI-based emergency classification
- Receive AI-based severity/priority assessment
- Get immediate safety recommendations

---

# ✨ Features Implemented — First Evaluation

## 1. User Registration

Users can create an account by providing:

- Name
- Email
- Password
- Role

Supported roles:

- 👤 Citizen
- 🚑 Responder
- 🛡️ Admin

Passwords are securely hashed before being stored in MongoDB.

---

## 2. User Login & Authentication

Users can securely log in using their registered credentials.

The system provides:

- Email and password validation
- Secure password verification
- JWT authentication
- Authentication error handling
- Protected API access

The JWT token is stored locally to maintain the user's session.

---

## 3. Role-Based Access Control (RBAC)

CrisisConnect AI implements role-based authorization.

### Citizen
Can:

- Report incidents
- View their own reports
- Access citizen-level functionality

### Responder
Can:

- Access citizen-level functionality
- Access responder-level endpoints

### Admin
Can:

- Access citizen-level functionality
- Access responder-level functionality
- Access admin-level endpoints

Unauthorized users receive appropriate `401 Unauthorized` or `403 Forbidden` responses.

---

## 4. User Profile & Session Management

Authenticated users can view their profile information.

The profile displays:

- Name
- Email
- Role
- Account creation date

The application also:

- Restores sessions after page refresh
- Validates JWT tokens
- Automatically clears invalid sessions
- Provides logout functionality

---

## 5. Emergency Incident Reporting

Citizens can submit emergency reports containing:

- Incident title
- Category
- Description
- Severity
- Location

### Incident Categories

- Accident
- Fire
- Medical Emergency
- Crime
- Natural Disaster
- Other

### Severity Levels

- Low
- Medium
- High
- Critical

Each incident receives a unique incident reference ID such as:

`INC-2026-CC6NN`

Incident information is stored in MongoDB.

---

## 6. Interactive Location & Map

Incident reports include an interactive map powered by **Leaflet** and OpenStreetMap.

Users can:

- Click on the map to select a location
- Drag the location marker
- Use their current GPS location
- View latitude and longitude
- Enter or obtain an address

The selected location is stored with the incident.

Example:

```text
Latitude: 30.3398
Longitude: 76.3869
Address: Selected emergency location
