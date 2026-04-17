# TalentSync API Documentation

## Base URL
`http://localhost:5000/api`

---

## 1. Authentication (`/api/auth`)

### 1.1 Student Registration
- **URL**: `/register/student`
- **Method**: `POST`
- **Body**: `{ "name": "...", "email": "...", "password": "..." }`
- **Response**: `{ "success": true, "token": "jwt...", "user": {...} }`

### 1.2 Company Registration
- **URL**: `/register/company`
- **Method**: `POST`
- **Body**: `{ "companyName": "...", "govRegId": "...", "gstCin": "...", "email": "...", "password": "..." }`
- **Logic**: Simulates government GST check. Sets `verifiedStatus` accordingly.

### 1.3 Unified Login
- **URL**: `/login`
- **Method**: `POST`
- **Body**: `{ "email": "...", "password": "..." }`
- **Response**: Returns token and Role context (`student`, `company`, `admin`).

---

## 2. Jobs (`/api/jobs`)

### 2.1 Create Job
- **URL**: `/`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>` (Role: Company, Status: Verified)
- **Body**: `{ "title": "...", "description": "...", "skillsRequired": [...] }`

### 2.2 Get Jobs
- **URL**: `/`
- **Method**: `GET`
- **Query Param**: `?search=react`

### 2.3 Apply for Job
- **URL**: `/:id/apply`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>` (Role: Student)

---

## 3. AI NLP Engine (`/api/ai`)

### 3.1 Parse Resume
- **URL**: `/parse-resume`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>` (Role: Student)
- **Desc**: Spawns Python external script simulating spaCy NLP to calculate ATS score.

---

## 4. Admin Dashboard (`/api/admin`)

- **URL**: `/analytics` (GET) - Returns global aggregates.
- **URL**: `/verifications` (GET) - Lists pending companies.
- **URL**: `/reports` (GET) - Lists fraud reports.
- **URL**: `/verifications/:id` (PUT) - Approve or Reject `{'status': 'verified'}`

*Note: All Admin routes require Auth Header with `role === 'admin'`.*
