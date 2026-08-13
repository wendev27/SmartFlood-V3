# SmartFlood V3

## Overview

SmartFlood V3 represents the Capstone 1 implementation of the SmartFlood project and serves as the first complete, fully integrated version of the platform.

This version combined real-time flood monitoring, AI-assisted relief allocation, user and family management, and mobile application integration into a single disaster management ecosystem.

Compared to previous versions, SmartFlood V3 focused on improving overall architecture, user experience, system reliability, and operational workflows while preparing the project for future production deployment.

---

## Project Objectives

The objectives of SmartFlood V3 were to:

* Build a complete disaster management platform for the Capstone 1 presentation.
* Integrate real-time IoT sensor monitoring.
* Connect the platform with an AI-assisted relief recommendation system.
* Improve the administrative dashboard and user experience.
* Integrate the web platform with the SmartFlood mobile application.
* Develop a family management system for more accurate relief allocation.

---

## Features

### Real-Time Flood Monitoring

* Near real-time sensor monitoring
* Live sensor data stored in MongoDB Atlas
* Working hardware sensor integration
* Flood status visualization dashboard

### AI-Assisted Relief Recommendation

* Human-in-the-Loop decision support
* Analytical Hierarchy Process (AHP)
* Fuzzy Logic recommendation engine
* Relief allocation suggestions
* Equipment-based recommendation generation

The AI service analyzes:

* Sensor information
* Family vulnerability information
* Available relief equipment
* Disaster-related parameters

to generate recommended relief allocations for administrators.

---

### Family Management System

One of the major improvements introduced in this version was a more structured family management system.

Features include:

* Family Head registration
* Family member association
* Household clustering
* Individual vulnerability profiles
* AHP-based household assessment

Instead of treating every resident independently, users are grouped into family units, allowing the system to perform more meaningful relief planning.

---

### Mobile Application Integration

SmartFlood V3 is fully integrated with the companion mobile application.

Residents can:

* Register through the mobile application
* Submit personal information
* Join family groups
* Wait for administrative approval

Administrators review and approve registrations through the web dashboard before granting system access.

---

### Administration

Complete administrative functionality includes:

* User Management
* Sensor Management
* CRUD Operations
* Registration Approval
* Family Management
* Monitoring Dashboard
* Administrative Reports

---

## Technologies Used

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

### Backend

* Node.js
* Express
* REST APIs

### Databases

* MongoDB Atlas (Sensor Data)
* Supabase (AHP Data, User Information)

### Artificial Intelligence

* Python
* FastAPI
* Human-in-the-Loop AI
* Analytical Hierarchy Process (AHP)
* Fuzzy Logic

### Deployment

* Heroku (AI Service)

---

## System Architecture

```text
                  IoT Flood Sensors
                         │
                         ▼
                 MongoDB Atlas
                         │
                         ▼
              SmartFlood Web Platform
                         │
      ┌──────────────────┼──────────────────┐
      ▼                  ▼                  ▼
 Supabase          AI Service          Mobile App
(User Data)         (Heroku)       (Resident Users)
```

The system continuously collects sensor information from deployed devices and stores it in MongoDB Atlas.

User and family information is maintained in Supabase.

The web platform communicates with the AI service hosted on Heroku, which generates relief allocation recommendations based on available sensor information and administrative inputs.

---

## Challenges

Several engineering challenges were addressed during this version:

### Hardware Integration

Successfully integrating live sensor readings into the dashboard while maintaining near real-time updates.

### Mobile Synchronization

Synchronizing user registration between the mobile application and the administrative dashboard.

### AI Integration

Designing a workflow that combines sensor information, household data, available resources, and Human-in-the-Loop decision making to generate practical recommendations.

### Family Clustering

Developing a family-centered data model that better represents actual households during disaster response.

---

## Lessons Learned

Developing SmartFlood V3 helped me understand:

* Full-stack system integration
* IoT data processing
* AI service integration
* REST API communication
* Database design
* Family relationship modeling
* Cloud deployment
* Dashboard design
* Role-Based administration
* End-to-end application development

One of the biggest lessons from this version was understanding how multiple independent systems—including IoT devices, databases, AI services, and mobile applications—can be integrated into a single platform that supports real-world disaster management workflows.

---

## Project Evolution

SmartFlood V3 represents the completion of Capstone 1.

Compared to previous versions, this release introduced:

* Improved UI/UX
* Live IoT integration
* Mobile application connectivity
* Family management
* AI-assisted relief recommendations
* Better administrative workflows
* More mature system architecture

This version also established the foundation for the next stage of development, where the project would transition toward a more modular architecture with separated frontend and backend services, Docker, CI/CD pipelines, and production-ready deployment strategies.

---

## Current Status

🚀 Capstone 1 Milestone

SmartFlood V3 represents the official Capstone 1 implementation of the SmartFlood project. It serves as the foundation for the next generation of SmartFlood, where the architecture continues to evolve toward a more scalable and production-oriented system.
