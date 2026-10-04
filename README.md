# SmartCampus – Campus Complaint Management System

SmartCampus is a web-based **Campus Complaint Management System** designed to make it easier for students to report campus-related issues and for administrators to manage, track, and resolve those complaints efficiently.

The system provides separate interfaces for **students and administrators**, with complaint tracking, priority management, profile management, and an admin complaint dashboard.

---

## 🚀 Features

### 👨‍🎓 Student Features

- Student registration and login
- Secure session-based authentication
- File a new campus complaint
- Select complaint category
- Enter complaint description
- Upload supporting images/files
- Capture current location using browser GPS
- Manually enter/edit complaint location
- View submitted complaints
- Track complaint status
- View detailed complaint information
- View complaint priority
- Manage student profile
- Update profile information
- Logout functionality

### 👨‍💼 Admin Features

- Admin login
- Admin dashboard
- View complaint statistics
- View all submitted complaints
- Review complaint details
- Filter and manage complaints
- Update complaint status
- Track complaint priority
- View recent complaint activity
- Manage complaint queue

---

## 📍 Location Detection

SmartCampus allows students to provide their location while submitting a complaint.

The system uses the browser's **Geolocation API** when the student clicks:

> 📍 Use My Current Location

If permission is granted, the application retrieves the student's:

- Latitude
- Longitude

Students can also manually enter or edit their location.

If location permission is denied, the student can continue by entering the location manually.

> **Note:** Location detection requires browser location permission and may require HTTPS in some production environments. `localhost` is generally allowed for development.

---

## 🛠️ Technologies Used

### Frontend

- HTML5
- CSS3
- JavaScript
- Fetch API
- Browser Geolocation API
- Responsive Web Design
- CSS Animations

### Backend

- Java
- Java Servlets
- Jakarta Servlet API
- JDBC

### Database

- MySQL

### Server

- Apache Tomcat 10+

### Development Tools

- Visual Studio Code / IntelliJ IDEA
- Git
- GitHub
- MySQL
- Apache Tomcat

---

## 🏗️ Project Structure

```text
SmartCampus/
│
├── src/
│   └── main/
│       ├── java/
│       │   └── com/
│       │       └── smartcampus/
│       │           ├── servlet/
│       │           │   ├── AdminServlet.java
│       │           │   ├── ComplaintServlet.java
│       │           │   ├── LoginServlet.java
│       │           │   ├── LogoutServlet.java
│       │           │   ├── MyComplaintsServlet.java
│       │           │   ├── ProfileServlet.java
│       │           │   ├── TrackComplaintServlet.java
│       │           │   └── UpdateComplaintServlet.java
│       │           │
│       │           ├── dao/
│       │           │   ├── ComplaintDAO.java
│       │           │   └── UserDAO.java
│       │           │
│       │           ├── model/
│       │           │   ├── Complaint.java
│       │           │   └── User.java
│       │           │
│       │           ├── util/
│       │           │   ├── DBConnection.java
│       │           │   └── PriorityCalculator.java
│       │           │
│       │           └── filter/
│       │               └── AuthenticationFilter.java
│       │
│       └── webapp/
│           ├── index.html
│           ├── login.html
│           ├── student-dashboard.html
│           ├── complaint.html
│           ├── my-complaints.html
│           ├── track-complaint.html
│           ├── complaint-details.html
│           ├── profile.html
│           ├── admin-dashboard.html
│           ├── admin-complaints.html
│           ├── style.css
│           ├── script.js
│           ├── uploads/
│           └── WEB-INF/
│               └── web.xml
│
├── lib/
│   └── mysql-connector-j.jar
│
├── database.sql
├── .gitignore
└── README.md
