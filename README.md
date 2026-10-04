SmartCampus
SmartCampus is a campus complaint management system that allows students to submit and track complaints and enables administrators to manage complaints through a centralized dashboard.
Features
Student Features
- Student registration and login
- Student dashboard
- Submit campus complaints
- Select complaint category
- Enter complaint description
- Enter manual location
- Upload an image as complaint evidence
- Use browser location permission to obtain latitude, longitude, and location accuracy
- View GPS location on OpenStreetMap
- View submitted complaints
- Track complaint status
- View complaint details
- View uploaded complaint images
- View stored GPS coordinates
- Update profile
- Change password
- Logout
Administrator Features
- Administrator login
- Admin dashboard
- View complaint statistics
- View complaints
- View complaint details
- View complaint description and location
- View uploaded complaint images
- View GPS coordinates and location accuracy
- Open complaint GPS location on OpenStreetMap
- Update complaint status
- Logout
Complaint Management
Each complaint contains:
- Complaint ID
- Student/User
- Category
- Description
- Manual location
- Uploaded image
- Status
- Priority
- GPS latitude
- GPS longitude
- GPS location accuracy
- Created date
- Updated date
Duplicate Complaint Detection
The system checks for an existing unresolved complaint before accepting a new complaint.
The system compares the complaint category and manually entered location.
If manual location is not provided, the system compares the complaint category and description.
Only complaints with Pending or In Progress status are considered during duplicate detection.
If a duplicate is found, the student is informed and can view the existing complaint or submit the complaint separately.
Priority Classification
Complaints are assigned one of three priority levels:
- High
- Medium
- Low
Priority is determined using the rule-based priority classification implemented in the application.
Location-Aware Complaint Reporting
Students can optionally use browser location permission when submitting a complaint.
The application obtains:
- Latitude
- Longitude
- Location accuracy
GPS information is stored separately from the manually entered location.
The stored GPS information can be viewed by students and administrators and opened using OpenStreetMap.
GPS permission is optional. Complaints can still be submitted without GPS information.
Technology Stack
Frontend
- HTML
- CSS
- JavaScript
Backend
- Java
- Java Servlets
Server
- Apache Tomcat
Database
- MySQL
- MySQL Connector/J
Location
- Browser Geolocation API
- OpenStreetMap
Project Structure
SmartCampus/
- database.sql
- lib/
- src/
  - main/
    - java/
      - com/smartcampus/
        - servlet/
        - dao/
        - model/
        - util/
        - filter/
    - webapp/
      - css/
      - js/
      - uploads/
      - WEB-INF/
      - HTML pages
- build/
Requirements
- JDK 26
- Apache Tomcat 10.1
- MySQL
- MySQL Connector/J