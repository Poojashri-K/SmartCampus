# SmartCampus

SmartCampus is a web-based campus complaint management system that allows students to submit, track, and manage complaints while providing administrators with tools to monitor and update complaints efficiently.

## Features

### Student

- Student registration and login
- Student dashboard
- Submit campus complaints
- Select complaint category
- Add complaint description
- Add manual location
- Upload complaint images
- Use current GPS location while submitting a complaint
- View GPS location on OpenStreetMap
- Track complaint status
- View complaint details
- View complaint history
- Update profile information
- Change password
- Logout

### Admin

- Admin login
- Admin dashboard
- View complaint statistics
- View all student complaints
- View complete complaint details
- View uploaded complaint images
- View manual complaint location
- View GPS coordinates and accuracy
- Open complaint location on OpenStreetMap
- Update complaint status
- Monitor pending and in-progress complaints
- Logout

## Duplicate Complaint Detection

SmartCampus includes a rule-based duplicate complaint detection feature.

When a student submits a complaint:

- The system checks for an existing unresolved complaint.
- If a manual location is provided, it compares the complaint category and location.
- If no manual location is provided, it compares the complaint category and description.
- Only complaints with `Pending` or `In Progress` status are considered.
- If a possible duplicate is found, the student is warned and can either view the existing complaint or continue submitting a new complaint.

This helps reduce repeated complaints about the same campus issue.

## Complaint Priority

Complaints are assigned a priority level based on predefined rules and keywords.

The system categorizes complaints as:

- High
- Medium
- Low

The priority helps administrators identify complaints that may require quicker attention.

## GPS Location Support

Students can optionally use their browser's location service while submitting a complaint.

The system stores:

- Latitude
- Longitude
- Location accuracy

GPS information is stored separately from the student's manually entered location.

The coordinates can be opened and viewed using OpenStreetMap.

## Technology Stack

### Frontend

- HTML
- CSS
- JavaScript
- Fetch API
- Browser Geolocation API

### Backend

- Java
- Jakarta Servlets
- Apache Tomcat

### Database

- MySQL
- MySQL Connector/J

### Map Service

- OpenStreetMap

## Project Structure

- `src/main/java` - Java Servlets, DAO, models, filters and utilities
- `src/main/webapp` - HTML, CSS, JavaScript and web resources
- `database.sql` - Database structure and required SQL
- `lib` - Required Java libraries
- `build` - Compiled Java classes

## Requirements

- JDK 26 or compatible Java version
- Apache Tomcat 10.1
- MySQL Server
- MySQL Connector/J
- Modern web browser

## Database Setup

1. Create the SmartCampus database in MySQL.
2. Run the SQL statements provided in `database.sql`.
3. Configure the database connection details in the project before running the application.

## Running the Project

1. Start MySQL.
2. Compile the Java source files.
3. Deploy the project to Apache Tomcat.
4. Start Tomcat.
5. Open the SmartCampus application in a browser.

## Default Admin Account

The project includes a default administrator account for testing and demonstration purposes.

The administrator can log in through the admin login page and manage student complaints.

## Project Purpose

SmartCampus is designed to provide a centralized platform for reporting and managing campus issues. It improves complaint tracking, reduces duplicate complaints, provides location-aware reporting, and gives administrators a structured way to manage complaints.

## Future Improvements

- Email notifications
- Real-time notifications
- Advanced duplicate detection using semantic similarity
- Mobile application
- Advanced analytics and reporting
- Role-based administrative permissions
