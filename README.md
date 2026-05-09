<p align="center">
  <img src="frontend/public/logo.png" alt="Pho City Logo" width="200"/>
</p>

# Pho-City-Website Synopsis:

The Pho City website is a **full-stack web application** developed for the owner **Huu Trung Tran** and **Pho City**, a family-owned Vietnamese restaurant in Sacramento. The restaurant currently struggles with having an online presence without relying on third-party systems like **DoorDash** or **Yelp**, and has difficulty keeping an updated menu available online. This leads to issues such as inconsistent or outdated menus and limited access for customers trying to view hours, menu details, or contact information.

To solve these problems, this project focuses on building a user-friendly, modern, and responsive website that serves as a centralized hub for customers. The website will provide easy access to the menu, contact details, restaurant information, and ordering options. The site aims to improve customer experience and strengthen Pho City’s online presence by providing a reliable and accessible platform for customer interaction.

Another key problem this project addresses is creating an authorized administrative side of the website. This includes a full **Content Management System (CMS)** that allows the restaurant and authorized users to create, update, delete, and manage website content, such as menu categories, items, prices, descriptions, images, and page text. This ensures Pho City can independently maintain their website and keep information up to date even after the project is completed.

<br></br>

# Table of Contents

- [Technologies](#technologies)
- [Installation Instructions](#installation-instructions)
- [Database Setup](#database-setup)
- [Environment Files](#environment-files)
- [File Organization](#file-organization)
- [Backend API](#backend-api)
- [Testing](#testing)
- [Deployment](#deployment)
- [ER Diagram](#er-diagram)
- [Figma Prototype](#figma-prototype)
- [Website Screenshots](#website-screenshots)
- [Jira Timeline](#jira-timeline)
  - [Sprint 01](#sprint01---project-initialization)
  - [Sprint 02](#sprint02---base-layout--structure)
  - [Sprint 03](#sprint03---core-functionality-setup)
  - [Sprint 04](#sprint04---ongoing-development)
  - [Sprint 05](#sprint05---ongoing-development)
  - [Sprint 06](#sprint06---ongoing-development)
  - [Sprint 07](#sprint07---ongoing-development)
  - [Sprint 08](#sprint08---testing)
  - [Sprint 09](#sprint09---testing--deployment)
- [Project Charter](#project-charter)
- [Team Praxis Credits](#team-praxis-credits)

<br><br>

# Technologies:

| **Frontend** | **Backend**     | **Tools**                 |
| ------------ | --------------- | ------------------------- |
| React        | Node.js         | Git & GitHub              |
| TypeScript   | Express.js      | Vite (Build Tool)         |
| TailwindCSS  | MySQL (AWS RDS) | Jira (Project Management) |

<br><br>

# Installation Instructions:

#### Clone the repository

```bash
mkdir FolderName                                                         #(1) Replace FolderName with your desired folder name
cd FolderName                                                            #(2) Moves you to the folder directory
git clone https://github.com/RicardoTTorres/Pho-City-Website.git         #(3) Clones the project
cd Pho-City-Website                                                      #(4) Move into project root directory
```

#### Running Frontend

```bash
cd frontend                                                              #(5) Navigate into the frontend folder
npm install                                                              #(6) Install all frontend dependencies
npm run dev                                                              #(7) Start the frontend server
```

#### Running Backend

```bash
cd backend                                                               #(8) Navigate into the backend folder
npm install                                                              #(9) Install backend dependencies
npm run dev                                                              #(10) Start the backend server
```

<br><br>

# Database Setup:

To run the project locally with MySQL, follow the steps below.

#### Create a Local Database in MySQL Workbench

1. Open **MySQL Workbench**.
2. In the SQL Editor, run the following commands:

```sql
CREATE DATABASE <db_name>;
USE <db_name>;
```

3. Click File -> Open SQL script and import .sql file and click lightning bolt icon
4. See the section below to configure the .env file with the details of your database

<br><br>

# Environment Files:

In the backend folder, create a file titled `.env` with the following contents:

```bash
# Local MySQL Connection
DB_HOST=localhost
DB_USER=root
DB_PASS=Your MySQL root password
DB_NAME=Your MySQL database name
DB_PORT=3306

# The url of the frontend to filter requests
FRONTEND_ORIGIN="http://localhost:5173"

# The port to run the Express server on
PORT=5000
```

In the frontend folder, create a file titled `.env` with the following contents:

```bash
# The url of the backend api
VITE_API_URL="http://localhost:5000"
```

<br><br>

# File Organization:

```
Pho-City-Website/
├── backend/                           # Node/Express API service
│   ├── src/                          # Runtime backend source code
│   │   ├── server.js                 # Express app bootstrap & middleware setup
│   │   ├── controllers/              # Request handlers (business logic + DB calls)
│   │   ├── routes/                   # Express route definitions
│   │   ├── middleware/               # Reusable request middleware
│   │   │   └── requireAuth.js        # JWT auth guard for protected endpoints
│   │   └── db/                       # Database utilities
│   │       └── connect_db.js         # MySQL connection pool
│   ├── db/                           # SQL artifacts (migrations, seeds)
│   ├── package.json
│   └── package-lock.json
│
├── frontend/                          # React/Vite web application
│   ├── src/
│   │   ├── app/                      # App shell & composition layer
│   │   │   ├── App.tsx               # Top-level routing & layout
│   │   │   ├── analytics/            # Analytics tracking
│   │   │   └── providers/            # Global React contexts
│   │   │
│   │   ├── features/                 # Feature modules
│   │   │   ├── auth/                 # Authentication
│   │   │   │   └── pages/AdminLogin.tsx
│   │   │   ├── cms/                  # Admin CMS
│   │   │   │   ├── components/       # CMS-specific components
│   │   │   │   ├── layouts/          # CMS layout wrappers
│   │   │   │   ├── pages/            # CMS pages
│   │   │   │   └── sections/         # CMS page sections
│   │   │   └── public/               # Public-facing site
│   │   │       ├── components/
│   │   │       ├── pages/            # Home, About, Menu, Contact
│   │   │       └── sections/         # Hero, footer, navbar
│   │   │
│   │   ├── shared/                   # Cross-feature shared code
│   │   │   ├── api/                  # API client functions
│   │   │   ├── assets/               # Images, icons
│   │   │   ├── components/ui/        # Shared UI components
│   │   │   ├── config/               # Configuration constants
│   │   │   ├── content/              # Content models & types
│   │   │   ├── data/                 # Static/mock data
│   │   │   ├── lib/                  # Utility functions
│   │   │   └── menu/                 # Menu data utilities
│   │   │
│   │   ├── styles/                   # Global styles
│   │   └── main.tsx                  # Application entry point
│   │
│   ├── public/                       # Static assets
│   ├── package.json
│   └── package-lock.json
```

<br><br>

# Backend API:

| Route                                                | Description                              |
| ---------------------------------------------------- | ---------------------------------------- |
| **About**                                            |                                          |
| `GET /api/about`                                     | Get about page contents                  |
| `PUT /api/about`                                     | Edit about page contents                 |
| **Auth**                                             |                                          |
| `POST /api/admin/login`                              | Admin login                              |
| `POST /api/admin/logout`                             | Admin logout                             |
| `GET /api/admin/me`                                  | Get current authenticated user           |
| `GET /api/admin/verify`                              | Verify auth token                        |
| `POST /api/admin/update-password`                    | Update admin password                    |
| **Contact**                                          |                                          |
| `POST /api/contact`                                  | Send message from contact page           |
| `GET /api/admin/contact`                             | Get contact page contents                |
| `PUT /api/admin/contact`                             | Edit contact page contents               |
| **Hero**                                             |                                          |
| `GET /api/hero`                                      | Get hero section contents                |
| `PUT /api/hero`                                      | Edit hero section contents               |
| **Navbar**                                           |                                          |
| `GET /api/navbar`                                    | Get navbar configuration                 |
| `PUT /api/admin/navbar`                              | Edit navbar configuration                |
| **Footer**                                           |                                          |
| `GET /api/footer`                                    | Get footer configuration                 |
| `PUT /api/footer`                                    | Edit footer configuration                |
| **Dashboard**                                        |                                          |
| `GET /api/admin/dashboard/stats`                     | Get stats for dashboard page             |
| **Menu**                                             |                                          |
| `GET /api/menu`                                      | Get all public menu data                 |
| `GET /api/menu/admin`                                | Get all menu data including hidden items |
| `POST /api/menu/categories`                          | Create new category                      |
| `PUT /api/menu/categories/:id`                       | Edit category                            |
| `DELETE /api/menu/categories/:id`                    | Delete category                          |
| `PUT /api/menu/categories/reorder`                   | Reorder categories                       |
| `POST /api/menu/items`                               | Create new menu item                     |
| `PUT /api/menu/items/:id`                            | Edit menu item                           |
| `DELETE /api/menu/items/:id`                         | Delete menu item                         |
| `PUT /api/menu/categories/:categoryId/items/reorder` | Reorder items within a category          |
| **Analytics**                                        |                                          |
| `GET /api/admin/analytics/traffic`                   | Get traffic analytics data               |
| `POST /api/analytics/traffic`                        | Record a traffic visit                   |
| **Admin Users**                                      |                                          |
| `GET /api/adminUsers`                                | Get list of admin users                  |
| **Activity**                                         |                                          |
| `GET /api/admin/activity`                            | Get recent admin activity log            |

<br><br>

# Testing:

<br><br>

# Deployment:

<br><br>

# ER Diagram:

<img src="assets/images/erd.png" width="700"/>

<br></br>

# Figma Prototype:

#### Home Page

<img src="assets/images/proto_home.png" width="700"/>

#### Menu Page

<img src="assets/images/proto_menu.png" width="700"/>

#### About Us Page

<img src="assets/images/proto_about.png" width="700"/>

### CMS

#### Login Page

<img src="assets/images/proto_login.png" width="700"/>

#### Admin Home Page

<img src="assets/images/proto_adminHome.png" width="700"/>

#### Editing View

<img src="assets/images/proto_editing.png" width="700"/>

<br><br>

# Website Screenshots:

#### Home Page

<img src="assets/images/home.png" width="700"/>

#### Contact Page

<img src="assets/images/contact.png" width="700"/>

#### About Page

<img src="assets/images/about.png" width="700"/>

#### Menu Page

<img src="assets/images/menu.png" width="700"/>

### CMS

#### Admin Dashboard

<img src="assets/images/admin_dashboard.png" width="700"/>

#### Admin Users

<img src="assets/images/admin_users.png" width="700"/>

#### Admin Menu

<img src="assets/images/admin_menu.png" width="700"/>

#### Admin Content

<img src="assets/images/admin_content_hero.png" width="700"/>

#### Admin Media

<img src="assets/images/admin_media.png" width="700"/>

#### Admin Messages

<img src="assets/images/admin_messages.png" width="700"/>

#### Admin Settings

<img src="assets/images/admin_settings.png" width="700"/>

<br><br>

# Jira Timeline:

## Sprint01 - Project Initialization

- Create ERD
- Research API
- Decide tech stack
- Write product charter
- Create UI mockups
- Research database costs
- Lab meeting notes
- Retrospective notes
- Client review meeting

## Sprint02 - Base Layout & Structure

- PC-7
- PC-60
- PC-79
- PC-58
- PC-61
- PC-78
- PC-17
- PC-72

## Sprint03 - Core Functionality Setup

- PC-55
- PC-46
- PC-40
- PC-27
- PC-82
- PC-58
- PC-41
- PC-19
- PC-21
- PC-24
- PC-70
- PC-80

## Sprint04 - Ongoing Development

- PC-101
- PC-90
- PC-91
- PC-92
- PC-29
- PC-74
- PC-76
- PC-95
- PC-26
- PC-93
- PC-94
- PC-103
- PC-96

## Sprint05 - Ongoing Development

- PC-23
- PC-24
- PC-83
- PC-86
- PC-88
- PC-93
- PC-94
- PC-104
- PC-106
- PC-107

## Sprint06 - Ongoing Development

- PC-23
- PC-86
- PC-87
- PC-88
- PC-93
- PC-105
- PC-108
- PC-127
- PC-135
- PC-136
- PC-137
- PC-146

## Sprint07 - Ongoing Development

- PC-23
- PC-109
- PC-156
- PC-157
- PC-158
- PC-163
- PC-164
- PC-165
- PC-166
- PC-168

## Sprint08 - Testing

- PC-159
- PC-160
- PC-161
- PC-162
- PC-169
- PC-170
- PC-171
- PC-172

## Sprint09 - Testing & Deployment

- PC-167
- PC-173
- PC-174
- PC-175
- PC-176
- PC-177
- PC-178
- PC-180

<br><br>

# Project Charter:

The project charter outlines the agreement between the client and the development team.

[**Open Project Charter**](https://docs.google.com/document/d/1E-cD62M-6Qs4I3NS7wFqUizgAiBlvkPL/edit)

<br><br>

# [Team Praxis] Credits:

| Name           | Github                                               |
| -------------- | ---------------------------------------------------- |
| David Lor      | [@davidlor2015](https://github.com/davidlor2015)     |
| Mukesh Mehmi   | [@MukeshByte](https://github.com/MukeshByte)         |
| Cole Wood      | [@ColeWood1](https://github.com/ColeWood1)           |
| Ricardo Torres | [@RicardoTTorres](https://github.com/RicardoTTorres) |
| James Garcia   | [@jamesg00](https://github.com/jamesg00)             |
| Shika Kandel   | [@skandelol](https://github.com/skandelol)           |
| Kwin Lee       | [@KwinLeeGit](https://github.com/KwinLeeGit)         |
| Ryan Petersen  | [@ryanp4096](https://github.com/ryanp4096)           |
