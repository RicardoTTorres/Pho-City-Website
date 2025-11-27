<p align="center">
  <img src="assets/images/logo.png" alt="Pho City Logo" width="200"/>
</p>

# Pho-City-Website Synopsis:

The Pho City website is a **full-stack web application** developed for the owner **Huu Trung Tran** and **Pho City**, a family-owned Vietnamese restaurant in Sacramento. The restaurant currently struggles with having an online presence without relying on third-party systems like **DoorDash** or **Yelp**, and has difficulty keeping an updated menu available online. This leads to issues such as inconsistent or outdated menus and limited access for customers trying to view hours, menu details, or contact information.

To solve these problems, this project focuses on building a user-friendly, modern, and responsive website that serves as a centralized hub for customers. The website will provide easy access to the menu, contact details, restaurant information, and ordering options. The site aims to improve customer experience and strengthen Pho City’s online presence by providing a reliable and accessible platform for customer interaction.

Another key problem this project addresses is creating an authorized administrative side of the website. This includes a full **Content Management System (CMS)** that allows the restaurant and authorized users to create, update, delete, and manage website content, such as menu categories, items, prices, descriptions, images, and page text. This ensures Pho City can independently maintain their website and keep information up to date even after the project is completed.

<br><br>

# Technologies:

| **Frontend**            | **Backend**            | **Tools**                     |
|-------------------------|-------------------------|-------------------------------|
| React                   | Node.js                 | Git & GitHub                 |
| TypeScript              | Express.js              | Vite (Build Tool)            |
| TailwindCSS             | MySQL (AWS RDS)         | Jira (Project Management)    |

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

4. Setup the .env file:

```bash
# Local MySQL Connection
DB_HOST= localhost
DB_USER= root
DB_PASS= Password                        #Choose a password
DB_NAME= Name                            #Choose a name
DB_PORT= 3306

FRONTEND_ORIGIN= http://localhost:5173

# Express server port
PORT=5000
```
<br><br>

# ER Diagram:

<br><br>

# Figma Prototype:

<br><br>

# Jira Timeline:

#### Sprint01 -

<br><br>

#### Sprint02 -

<br><br>

#### Sprint03 -

<br><br>

#### Sprint04 -

<br><br>

# Project Charter:

https://docs.google.com/document/d/1E-cD62M-6Qs4I3NS7wFqUizgAiBlvkPL/edit

<br><br>

# [Team Praxis] Credits:
#### David Lor, Mukesh Mehmi, Cole Wood, Ricardo Torres, James Garcia, Shika Kandel, Kwin Lee, Ryan Peterson