package com.smartcampus.servlet;

import com.smartcampus.dao.ComplaintDAO;
import com.smartcampus.model.Complaint;
import com.smartcampus.model.User;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;

@WebServlet("/api/track-complaint")
public class TrackComplaintServlet extends HttpServlet {

    private final ComplaintDAO complaintDAO = new ComplaintDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        HttpSession session = req.getSession(false);
        if (session == null || session.getAttribute("user") == null) {
            resp.setStatus(401);
            resp.getWriter().write("{\"success\":false,\"message\":\"Please log in\"}");
            return;
        }

        String idParam = req.getParameter("id");
        if (idParam == null || idParam.isEmpty()) {
            resp.setStatus(400);
            resp.getWriter().write("{\"success\":false,\"message\":\"Complaint id is required\"}");
            return;
        }

        try {
            int id = Integer.parseInt(idParam);
            Complaint c = complaintDAO.getComplaintById(id);

            User user = (User) session.getAttribute("user");
            if (c == null || (!"admin".equals(user.getRole()) && c.getUserId() != user.getId())) {
                resp.setStatus(404);
                resp.getWriter().write("{\"success\":false,\"message\":\"Complaint not found\"}");
                return;
            }
            resp.getWriter().write(c.toJson());
        } catch (NumberFormatException e) {
            resp.setStatus(400);
            resp.getWriter().write("{\"success\":false,\"message\":\"Invalid complaint id\"}");
        }
    }
}
