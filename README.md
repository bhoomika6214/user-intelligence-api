# 🚀 User Intelligence API

A secure and scalable REST API built with Node.js, Express, and SQLite.

## ✨ Features

* JWT Authentication
* Full CRUD Operations
* Search & Sorting
* Intelligent User Scoring
* Secure Password Hashing

## 🔐 Authentication

All user routes are protected using JWT tokens.

## 📡 API Endpoints

### Auth

* POST /register
* POST /login

### Users

* GET /users
* GET /users/:id
* POST /users
* PUT /users/:id
* DELETE /users/:id

## 🛠 Tech Stack

* Node.js
* Express.js
* SQLite
* JWT
* Bcrypt

## 🚀 Run Locally

```bash
npm install
node server.js
```

## 🧪 Testing

Use Postman or curl to test endpoints with Authorization headers.
Using curl in the terminal i have tested endpoints and here is the video of some testcases = https://drive.google.com/file/d/1ENYoKtfGGcjZ9eMbJBEZivTix4775Ae2/view?usp=sharing


## 🧠 Unique Approach

This API introduces a scoring mechanism to evaluate users based on data patterns, simulating real-world backend intelligence systems.
