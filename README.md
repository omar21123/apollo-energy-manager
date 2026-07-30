<p align="center">
  <h1 align="center">Apollo Energy Asset Manager</h1>
</p>

<p align="center">
  A production-ready full-stack web application for managing renewable energy projects and tasks, built with Laravel, React, PostgreSQL, Docker, and JWT authentication.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Laravel-12-FF2D20?logo=laravel&logoColor=white" alt="Laravel">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Docker-Containerized-2496ED?logo=docker&logoColor=white" alt="Docker">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License">
</p>

---

## 🎥 Live Demo

<video src="https://c3rb3rus.dev/assets/img/posts/apollo-energy-manager/demo.mp4" controls width="100%" poster="https://c3rb3rus.dev/assets/img/posts/apollo-energy-manager/login-page.png"></video>

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Screenshots](#screenshots)
- [Architecture](#architecture)
- [Data Model](#data-model)
- [Tech Stack](#tech-stack)
- [Requirements](#requirements)
- [Installation & Setup](#installation--setup)
- [Environment Configuration](#environment-configuration)
- [Database Initialization](#database-initialization)
- [Running the Application](#running-the-application)
- [Docker Cheat Sheet](#docker-cheat-sheet)
- [API Documentation](#api-documentation)
- [Security Features](#security-features)
- [Project Structure](#project-structure)
- [Roadmap](#roadmap)
- [Troubleshooting](#troubleshooting)
- [License](#license)
- [Author](#author)

---

## Project Overview

Apollo Energy Asset Manager is a modern full-stack web application developed as a technical solution for Apollo Green Solutions. 

The platform enables authenticated users to manage renewable-energy projects and organize project tasks through an intuitive dashboard and Kanban interface. It demonstrates modern backend and frontend engineering standards including JWT authentication, containerized deployment, automated database migrations, and robust security workflows.

---

## Features

- **User Authentication:** Registration, email verification, login, logout, profile updates, password changes, and forgot/reset password workflows.
- **Project Management:** Create, list, view, update, and delete projects scoped securely to the authenticated user.
- **Task Tracking:** Create, list, view, update, and delete tasks associated with specific projects, featuring priorities and statuses.
- **Interactive Dashboard:** Live KPIs (total projects, active projects, total tasks, overdue tasks, completion rates) and a recent-activity feed.
- **Kanban Board:** Drag-and-drop status updates with instantaneous UI synchronization.

---

## Screenshots

| Login Page | Dashboard |
| :---: | :---: |
| ![Login Page](https://c3rb3rus.dev/assets/img/posts/apollo-energy-manager/login-page.png) | ![Dashboard](https://c3rb3rus.dev/assets/img/posts/apollo-energy-manager/dashboard.png) |

| Kanban Board | Mailpit Integration |
| :---: | :---: |
| ![Kanban Board](https://c3rb3rus.dev/assets/img/posts/apollo-energy-manager/kanban.png) | ![Mailpit](https://c3rb3rus.dev/assets/img/posts/apollo-energy-manager/mailpit.png) |

---

## Architecture

The application follows a modern containerized client-server architecture. The frontend and backend are deployed as independent services and communicate through a secure REST API protected with JWT authentication. Supporting services such as PostgreSQL, Redis, Mailpit, and Nginx complete the stack, providing data persistence, caching, email testing, and reverse proxy capabilities.

![System Architecture](/assets/img/posts/apollo-energy-manager/architecture.png)

### Architecture Overview

- **Browser:** Interacts with the React application and communicates with the backend through authenticated REST API requests.
- **React / TanStack Start:** Serves the Single Page Application (SPA) running on port **8080**.
- **Nginx:** Acts as a reverse proxy and forwards PHP requests to Laravel through **FastCGI**.
- **Laravel API:** Handles authentication, business logic, validation, and database operations using JWT authentication.
- **PostgreSQL 17:** Stores users, projects, tasks, and application data securely.
- **Redis 8:** Provides caching and queue support to improve application performance.
- **Mailpit:** Captures verification and password-reset emails during development without requiring a real SMTP provider.

### Container Services

| Container | Purpose |
|---|---|
| `apollo_backend` | Laravel API (PHP-FPM) |
| `apollo_frontend` | React / TanStack Start |
| `apollo_nginx` | Reverse Proxy |
| `apollo_postgres` | PostgreSQL Database |
| `apollo_redis` | Redis Cache & Queue |
| `apollo_mailpit` | SMTP Testing & Web Interface |

---

## Data Model

![Data Model](/assets/img/posts/apollo-energy-manager/data-model.png)

### Business Rules

1. A user can own multiple projects or none at all.
2. Each project belongs to exactly one user.
3. A project can contain zero, one, or multiple tasks.
4. Each task belongs to exactly one project.
5. Primary keys (`user_id`, `project_id`, `task_id`) are unique and preserved using soft deletes.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Laravel 12, PHP 8.4, `tymon/jwt-auth` (JWT), Eloquent ORM |
| **Frontend** | React 19, TypeScript, TanStack Start/Router, TanStack Query, React Hook Form + Zod, Tailwind CSS, shadcn/ui |
| **Database** | PostgreSQL 17 |
| **Cache / Queue** | Redis 8 |
| **Mail (dev)** | Mailpit (catches verification/reset emails locally) |
| **Web Server** | Nginx |
| **Containerization** | Docker & Docker Compose |

---

## Requirements

Before starting, make sure you have installed:
- Git
- Docker Engine 28+
- Docker Compose v2+
- PHP 8.4 *(optional, for local setup without Docker)*
- Composer 2 *(optional)*
- Node.js 22+ and npm *(optional)*

---

## Installation & Setup

### 1. Clone the Repository

```bash
git clone [https://github.com/omar21123/apollo-energy-manager.git](https://github.com/omar21123/apollo-energy-manager.git)
cd apollo-energy-manager
