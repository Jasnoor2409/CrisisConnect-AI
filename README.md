🚨 CrisisConnect AI

AI-Powered Emergency Response & Disaster Management Platform

CrisisConnect AI is a web-based emergency incident reporting and management platform designed to make incident information easier to submit, organize, assess, and review. It combines structured reporting, map-based location capture, evidence uploads, AI-assisted incident classification, and role-based dashboards in one centralized application.

The project aims to support a more organized emergency reporting workflow by connecting citizens with an incident review interface for responders.

---

✨ Key Features

👤 Authentication & Role-Based Access

- User registration and login.
- JWT-based authentication.
- Password hashing using bcrypt.
- Role-based access control (RBAC) for authorized features.
- Protected backend routes and access validation.

📝 Emergency Incident Reporting

- Submit incidents through a structured reporting form.
- Enter incident title, category, reported severity, and description.
- Attach supporting photos or documents.
- Store incident information for later review.

📍 Map-Based Location Capture

- Interactive maps using Leaflet and OpenStreetMap.
- Browser-based geolocation when permission is granted.
- Location selection and coordinate capture.
- Location details associated with incident reports.

🤖 AI-Assisted Incident Assessment

- Incident category prediction.
- Severity assessment and priority indication.
- Contextual safety recommendations.
- Fallback assessment logic when the configured AI service is unavailable.

Note: AI results and fallback-generated assessments are not necessarily equivalent to a live AI model response or a professional emergency assessment.

📂 My Reports

- View previously submitted incidents.
- Review incident details and available evidence.
- Filter and inspect reports using the available interface.

🛡️ Responder Dashboard

- Centralized incident review queue.
- Search incidents using available search fields.
- Inspect incident details, location, evidence, and AI-assisted assessments.
- View available incident status and assignment information.

📚 CHO Learning Lab

- A dedicated learning interface supporting the project's CHO-related academic requirements.
- Reference materials and learning content organized within the application.

---

🖥️ Technology Stack

Layer| Technologies
Frontend| React.js, Vite, JavaScript, JSX
Styling| Tailwind CSS, Custom CSS
Routing & State| React Router, Context API
API Communication| Axios, REST APIs
Backend| Node.js, Express.js
Authentication & Security| JWT, bcrypt, Middleware, RBAC
Database| MongoDB Atlas, Mongoose
Maps & Location| Leaflet, OpenStreetMap, Browser Geolocation API
AI Assessment| Configured AI service with fallback logic
Development Tools| VS Code, Google Antigravity, npm, Git, GitHub

---

🔄 Application Workflow

1. Authenticate — The user registers or logs in.
2. Report an incident — The citizen enters incident information through the reporting form.
3. Capture location and evidence — The user selects a location and attaches available supporting files.
4. Validate the request — The backend validates incoming data and processes the request.
5. Assess the incident — The application generates an AI-assisted classification, severity assessment, and safety guidance.
6. Store incident information — The incident is persisted in the database.
7. Review incidents — Citizens can view their reports, while authorized responders can review incidents through their dashboard.

---

🏗️ High-Level Architecture

Citizen / Responder
        |
        v
 React.js Frontend
        |
        | HTTP / REST API
        v
 Node.js + Express.js
        |
        +---- Authentication & RBAC
        |
        +---- Incident Processing
        |
        +---- Evidence Upload Handling
        |
        +---- AI Assessment + Fallback
        |
        v
 MongoDB Atlas

The frontend handles user interaction, the backend manages requests and application logic, and MongoDB Atlas stores application data. Mapping and AI-assisted assessment support the incident-reporting workflow.

---

🔐 Security Considerations

- Protected routes use authentication and authorization checks.
- Passwords are hashed rather than stored as plain text.
- Environment variables are used for sensitive configuration.
- Uploaded evidence should be validated and handled securely.
- Access permissions are checked according to the user's role.

Important: Never commit your actual ".env" file, database credentials, API keys, JWT secrets, or private incident evidence to GitHub.

---

🚀 Getting Started

Follow these steps to run the project locally.

Prerequisites

- "Node.js" (https://nodejs.org/) and npm
- MongoDB Atlas account or a compatible MongoDB deployment
- Git
- A code editor such as VS Code

1. Clone the repository

git clone https://github.com/Jasnoor2409/CrisisConnect-AI.git
cd CrisisConnect-AI

2. Configure the backend

cd backend
npm install

Create a ".env" file inside the "backend" directory using ".env.example" as a reference.

Configure the environment variables required by your application:

PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret

Add the optional AI provider configuration if your implementation requires it. Follow the variable names and setup instructions in the project's environment example.

3. Start the backend

npm run dev

When the server starts successfully, the health endpoint is available at:

http://localhost:5000/api/health

4. Configure and start the frontend

Open a second terminal:

cd frontend
npm install
npm run dev

Open the local URL printed by Vite, typically:

http://localhost:5173

Configuration note: Ensure the frontend API base URL matches your running backend. Check the project's configuration before changing environment-variable names or API endpoints.

---

⚙️ Configuration

Variable| Purpose
"PORT"| Backend server port
"NODE_ENV"| Application environment
"MONGODB_URI"| MongoDB connection string
"JWT_SECRET"| Secret used for signing and verifying JWTs
"GEMINI_API_KEY"| Optional Gemini provider key, if configured
"OPENAI_API_KEY"| Optional OpenAI provider key, if configured

Use only the AI provider configuration supported by your current implementation. Keep real secrets in your local environment, never in committed example files.

---

🗺️ Project Scope

Current Application

- Authentication and role-based access.
- Citizen incident reporting.
- Map-based location capture.
- Supporting evidence uploads.
- AI-assisted incident assessment and fallback handling.
- Citizen report history.
- Responder incident review interface.
- CHO Learning Lab.

🔮 Future Scope

- Dedicated Admin Dashboard for centralized monitoring and analytics.
- More comprehensive incident assignment, status-update, and resolution workflows.
- Real-time notifications for citizens and responders.
- Integration with authorized ambulance, fire, and police service APIs.
- Enhanced AI analytics, geographical hotspot detection, and incident trends.
- Production deployment, scalability, monitoring, and further security improvements.

These enhancements are planned extensions and should not be interpreted as currently implemented functionality.

---

⚠️ Limitations

CrisisConnect AI is an academic software project intended to support incident reporting and review. It does not automatically dispatch emergency services or replace official emergency channels, trained responders, or professional emergency assessment.

Users should contact the appropriate local emergency services directly when immediate assistance is required.

---

👩‍💻 Team

Project Contributors

- Jasnoor Kaur — Development
- Kaashvi Sharma — Development

Project: CrisisConnect AI
Programme: BE Computer Science Engineering
Evaluation: FA2 — Second Evaluation

---

🎯 Project Objective

The objective of CrisisConnect AI is to demonstrate how modern web technologies, geolocation, secure access control, and AI-assisted assessment can be combined to create a centralized and organized emergency incident reporting platform.

---

📄 License

No license has been specified yet. If you intend to make this project available for reuse, consider adding an appropriate open-source license.

---

Built as an academic project exploring emergency incident reporting, AI-assisted assessment, and incident coordination.
