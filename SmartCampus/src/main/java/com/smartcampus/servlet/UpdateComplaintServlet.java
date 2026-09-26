package com.smartcampus.servlet;

import com.smartcampus.dao.ComplaintDAO;
import com.smartcampus.model.User;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;

@WebServlet("/api/admin/update-complaint")
public class UpdateComplaintServlet extends HttpServlet {

    private static final String[] VALID_STATUSES = {"Pending", "In Progress", "Resolved", "Rejected"};

    private final ComplaintDAO complaintDAO = new ComplaintDAO();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        HttpSession session = req.getSession(false);
        User user = session == null ? null : (User) session.getAttribute("user");

        if (user == null || !"admin".equals(user.getRole())) {
            resp.setStatus(403);
            resp.getWriter().write("{\"success\":false,\"message\":\"Admin access required\"}");
            return;
        }

        String idParam = req.getParameter("id");
        String status = req.getParameter("status");

        boolean validStatus = false;
        for (String s : VALID_STATUSES) {
            if (s.equals(status)) { validStatus = true; break; }
        }

        if (idParam == null || !validStatus) {
            resp.setStatus(400);
            resp.getWriter().write("{\"success\":false,\"message\":\"Valid id and status are required\"}");
            return;
        }

        try {
            int id = Integer.parseInt(idParam);
            boolean updated = complaintDAO.updateStatus(id, status);
            resp.getWriter().write("{\"success\":" + updated + "}");
        } catch (NumberFormatException e) {
            resp.setStatus(400);
            resp.getWriter().write("{\"success\":false,\"message\":\"Invalid complaint id\"}");
        }
    }
}
