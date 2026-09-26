# SmartCampus — Complaint Management System

A Java Servlet web app for students to file, track, and get status updates on
campus complaints (hostel, academic, infrastructure, Wi-Fi, mess, security),
with an admin panel to triage and resolve them.

## Stack
- Java Servlets (Jakarta EE, `jakarta.servlet` — Tomcat 10+)
- Plain HTML/CSS/JS front end (talks to servlets as a JSON API via `fetch`)
- MySQL for storage (JDBC, no ORM)

## Project layout
```
SmartCampus/
├── src/main/java/com/smartcampus/
│   ├── servlet/    → HTTP endpoints (login, complaint CRUD, admin, profile)
│   ├── dao/        → UserDAO, ComplaintDAO (JDBC queries)
│   ├── model/      → User, Complaint POJOs (with toJson())
│   ├── util/       → DBConnection, PriorityCalculator
│   └── filter/     → AuthenticationFilter (session + role check on /api/*)
├── src/main/webapp/
│   ├── *.html      → student & admin pages
│   ├── css/style.css
│   ├── js/script.js → fetches /api/* and renders each page
│   └── WEB-INF/web.xml
├── database.sql
└── lib/            → put mysql-connector-j.jar here
```

## Setup
1. **Database**
   ```
   mysql -u root -p < database.sql
   ```
   This creates the `smartcampus` DB, `users`/`complaints` tables, and a
   default admin: `admin@smartcampus.edu` / `admin123`.

2. **Edit DB credentials** in
   `src/main/java/com/smartcampus/util/DBConnection.java` if your MySQL
   user/password differ from `root`/`root`.

3. **MySQL driver**: drop `mysql-connector-j.jar` into `lib/`, or add the
   Maven dependency:
   ```xml
   <dependency>
     <groupId>com.mysql</groupId>
     <artifactId>mysql-connector-j</artifactId>
     <version>8.4.0</version>
   </dependency>
   ```

4. **Build & deploy** as a WAR to Tomcat 10+ (needs `jakarta.servlet`, not
   `javax.servlet`). With Maven, package as `war` and drop the `.war` into
   `webapps/`. WAR-ballooned or exploded deploy both work.

5. Visit `http://localhost:8080/SmartCampus/` — register a student account,
   or log in as admin with the seeded credentials above.

## New in this version
- **Photo upload on complaints** — `complaint.html` now sends `multipart/form-data`;
  `ComplaintServlet` (annotated `@MultipartConfig`, 5&nbsp;MB limit) saves the file under
  `webapp/uploads/` with a random name and stores the relative path in the new
  `complaints.image_path` column. Thumbnails show up on My Complaints, Track,
  Complaint Details, and the admin table.
  - If your DB already existed before this column was added, run:
    `ALTER TABLE complaints ADD COLUMN image_path VARCHAR(255) AFTER location;`
- **Duplicate detection** — before inserting, `ComplaintDAO.findSimilarOpenComplaint()`
  checks for an already-open (Pending/In Progress) complaint with the same category +
  location (or, if no location was given, the exact same description). If one exists,
  the student sees a message with a link to that complaint and a "Submit Anyway" button
  (adds `force=true` to skip the check, for genuinely separate issues at the same spot).
- **Role guard** — every protected page now has `<body data-role="student">` or
  `data-role="admin">`; `enforceRole()` in `script.js` calls `/api/profile` on load and
  bounces a student out of admin pages (and vice versa) automatically. The admin pages
  also get a dark navbar so they're visually unmistakable from the student view.

## How it works
- All servlets live under `/api/*` and return JSON; `AuthenticationFilter`
  guards every path under `/api/*` except `/api/login` and `/api/logout`,
  and further restricts `/api/admin/*` to users with `role = admin`.
- `PriorityCalculator` scans the category + description for keywords
  (fire, shock, leak, security, injury → High; water/Wi-Fi/broken/hygiene →
  Medium; everything else → Low) and stamps the complaint on submission.
- Session (`HttpSession`) holds the logged-in `User`; no JWT/token layer.
- Passwords are stored in plain text for simplicity — swap in BCrypt
  (`UserDAO.register` / `authenticate`) before using this for anything real.

## Known simplifications
- No CSRF tokens on forms.
- No pagination on complaint lists (fine for a class project's data volume).
- No file/image upload on complaints.
