package com.smartcampus.servlet;

import com.smartcampus.dao.UserDAO;
import com.smartcampus.model.User;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;

@WebServlet("/api/login")
public class LoginServlet extends HttpServlet {

    private final UserDAO userDAO = new UserDAO();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        String action = req.getParameter("action") == null ? "login" : req.getParameter("action");

        if ("register".equals(action)) {
            handleRegister(req, resp);
        } else {
            handleLogin(req, resp);
        }
    }

    private void handleLogin(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String email = req.getParameter("email");
        String password = req.getParameter("password");

        User user = userDAO.authenticate(email, password);
        if (user != null) {
            HttpSession session = req.getSession(true);
            session.setAttribute("user", user);
            session.setMaxInactiveInterval(30 * 60);
            resp.getWriter().write("{\"success\":true,\"role\":\"" + user.getRole() + "\",\"user\":" + user.toJson() + "}");
        } else {
            resp.setStatus(401);
            resp.getWriter().write("{\"success\":false,\"message\":\"Invalid email or password\"}");
        }
    }

    private void handleRegister(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String name = req.getParameter("name");
        String email = req.getParameter("email");
        String password = req.getParameter("password");
        String department = req.getParameter("department");
        String phone = req.getParameter("phone");

        if (name == null || email == null || password == null || name.isEmpty() || email.isEmpty() || password.isEmpty()) {
            resp.setStatus(400);
            resp.getWriter().write("{\"success\":false,\"message\":\"All fields are required\"}");
            return;
        }
        if (userDAO.emailExists(email)) {
            resp.setStatus(409);
            resp.getWriter().write("{\"success\":false,\"message\":\"Email already registered\"}");
            return;
        }

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(password);
        user.setRole("student");
        user.setDepartment(department);
        user.setPhone(phone);

        boolean created = userDAO.register(user);
        if (created) {
            resp.getWriter().write("{\"success\":true,\"message\":\"Registered successfully. Please log in.\"}");
        } else {
            resp.setStatus(500);
            resp.getWriter().write("{\"success\":false,\"message\":\"Registration failed\"}");
        }
    }
}
