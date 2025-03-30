# Store Ratings

## Overview

This is a web application with a full-stack that enables users to give ratings to stores listed on the platform. The application has support for role-based access control with three user roles: **System Administrator, Normal User, and Store Owner.**

## Tech Stack

- **Frontend:** React.js
- **Backend:** Express.js (Node.js)
- **Database:** PostgreSQL

## Features

### System Administrator
- Can create new stores, normal users, and admin users.
- Is able to access a dashboard that shows:
- Number of total users
- Number of total stores
- Number of total submitted ratings
- Can create new users with information:
  - Name, Email, Password, Address
- Can display and filter list of stores and users.
- Can display information of all users, including ratings for Store Owners.
- Can log out.

### Normal User
- Can sign up and log in.
- Can change their password.
- Can view and search stores.
- Store listings show:
  - Store Name, Address, Overall Rating, User's Submitted Rating
  - Option to submit/change a rating (1-5).
- Can log out.

### Store Owner
- Can log in.
- Can change their password.
- Dashboard shows:
  - Users that submitted ratings for their store.
  - Average rating of their store.
- Can log out.

## Form Validations
- **Name:** 20-60 characters.
- **Address:** Max 400 characters.
- **Password:** 8-16 characters, must have at least one uppercase letter and one special character.
- **Email:** Must follow standard email validation rules.

## Setup Instructions

### Prerequisites
- Node.js
- PostgreSQL
- Git

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/kushyanthreddy19/store_rating_app.git
   cd store_rating_app

## Description
This is a Store Ratings app that enables users to review and rate stores. It is made up of a client application developed using React and a server application developed using Node.js and Express.

## Installation Instructions

### Client
1. Go to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Server
1. Go to the server directory:
```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Usage Instructions

### Client
To run the client application, execute:
```bash
npm start
```

### Server
To run the server application, execute:
```bash
npm start
```
or for development mode:
```bash
npm run dev
```

## Project Structure
```
store-ratings/
├── client/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── services/
```
│   │   │   └── api.js
│   │   └── index.js
└── server/
    ├── server.js
    └── package.json

## API Information
The client communicates with the server through Axios to make HTTP requests. The API URL is `http://localhost:5000/api`. The API has endpoints for user login, store ratings, and reviews.

## Project Working

### Overview
The Store Ratings application is intended to enable users to rate and leave reviews for different stores. The application has two primary parts: a client-side application developed with React and a server-side application developed with Node.js and Express.

### Client-Side Functionality
- The client app offers an interface that is friendly to users where they can log in, display stores, make submissions of ratings, and access reviews.
- The app employs React Router for routing between various pages, e.g., the user dashboard and admin dashboard.
- Axios makes HTTP requests to the server so the client can retrieve and send information.

### Server-Side Functionality
- The server app receives incoming requests from the client, processes them, and responds accordingly.
- It employs Express to map routes for different API endpoints, including user authentication, store ratings, and reviews.
- The server handles data storage and retrieval, with user ratings and reviews being stored securely.

### Client-Server Communication
- The client sends requests to the server using Axios, which are directed to specific API endpoints defined in the server application.
- The server handles these requests, engages with the database if need be, and sends responses to the client, which are then presented to the user.

### Key Features
- User authentication: Users can register and login to their accounts.
- Store ratings: Users can rate stores and write reviews.
- Admin dashboard: Admin users can administer stores and view user ratings and reviews.

## Contributing
Contributions are welcome! Open an issue or submit a pull request for any suggestions or improvements.

## License
This project is covered under the MIT License.
