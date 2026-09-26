package com.smartcampus.servlet;

import com.smartcampus.dao.UserDAO;
import com.smartcampus.model.User;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;

@WebServlet("/api/profile")
public class ProfileServlet extends HttpServlet {

    private final UserDAO userDAO = new UserDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        HttpSession session = req.getSession(false);
        if (session == null || session.getAttribute("user") == null) {
            resp.setStatus(401);
            resp.getWriter().write("{\"success\":false,\"message\":\"Please log in\"}");
            return;
        }
        User user = (User) session.getAttribute("user");
        resp.getWriter().write(user.toJson());
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        HttpSession session = req.getSession(false);
        if (session == null || session.getAttribute("user") == null) {
            resp.setStatus(401);
            resp.getWriter().write("{\"success\":false,\"message\":\"Please log in\"}");
            return;
        }

        User user = (User) session.getAttribute("user");
        user.setName(req.getParameter("name"));
        user.setDepartment(req.getParameter("department"));
        user.setPhone(req.getParameter("phone"));

        boolean updated = userDAO.updateProfile(user);
        if (updated) {
            session.setAttribute("user", user);
            resp.getWriter().write("{\"success\":true,\"user\":" + user.toJson() + "}");
        } else {
            resp.setStatus(500);
            resp.getWriter().write("{\"success\":false,\"message\":\"Update failed\"}");
        }
    }
}
