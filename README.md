\# SmartCampus



SmartCampus is a campus complaint management system that allows students to submit and track complaints and enables administrators to manage complaints through a centralized dashboard.



\## Features



\### Student Features



\- Student registration and login

\- Student dashboard

\- Submit campus complaints

\- Select complaint category

\- Enter complaint description

\- Enter manual location

\- Upload an image as complaint evidence

\- Use browser location permission to obtain:

&#x20; - Latitude

&#x20; - Longitude

&#x20; - Location accuracy

\- Preview the detected GPS location on OpenStreetMap

\- View submitted complaints

\- Track complaint status

\- View complaint details

\- View uploaded complaint images

\- View stored GPS coordinates and map location

\- Update profile information

\- Change password

\- Logout



\### Administrator Features



\- Administrator login

\- Admin dashboard

\- View complaint statistics

\- View complaint list

\- View complaint details

\- View complaint description and location

\- View uploaded complaint evidence

\- View GPS coordinates and location accuracy when available

\- Open complaint GPS location on OpenStreetMap

\- Update complaint status

\- Manage complaints through the admin interface



\### Complaint Management



Each complaint contains information such as:



\- Complaint ID

\- Student/User

\- Category

\- Description

\- Manual location

\- Uploaded image

\- Status

\- Priority

\- GPS latitude

\- GPS longitude

\- GPS location accuracy

\- Created date

\- Updated date



\### Duplicate Complaint Detection



SmartCampus checks for an existing unresolved complaint before creating a new complaint.



The system compares:



\- Complaint category

\- Manual location



When the manual location is unavailable, the system compares:



\- Complaint category

\- Complaint description



Only complaints with the status `Pending` or `In Progress` are considered during duplicate checking.



If a possible duplicate is found, the student is informed and can choose to view the existing complaint or submit the complaint separately.



\### Priority Classification



Complaints are assigned one of three priority levels:



\- High

\- Medium

\- Low



The priority is determined using the existing rule-based priority classification implemented in the application.



\### Location-Aware Complaint Reporting



Students can optionally allow the browser to access their current location.



When permission is granted, the application obtains:



\- Latitude

\- Longitude

\- Accuracy



The GPS information is stored separately from the manually entered complaint location.



The stored coordinates can be viewed by administrators and students and opened using OpenStreetMap.



GPS permission is optional. A complaint can still be submitted without GPS information.



\## Technology Stack



\### Frontend



\- HTML

\- CSS

\- JavaScript



\### Backend



\- Java

\- Java Servlets

\- Apache Tomcat



\### Database



\- MySQL

\- MySQL Connector/J



\### Location



\- Browser Geolocation API

\- OpenStreetMap



\## Project Structure



```text

SmartCampus/

│

├── database.sql

├── lib/

│   └── mysql-connector-j.jar

│

├── src/

│   └── main/

│       ├── java/

│       │   └── com/

│       │       └── smartcampus/

│       │           ├── servlet/

│       │           ├── dao/

│       │           ├── model/

│       │           ├── util/

│       │           └── filter/

│       │

│       └── webapp/

│           ├── css/

│           ├── js/

│           ├── uploads/

│           ├── WEB-INF/

│           └── \*.html

│

└── build/

&#x20;   └── classes/

