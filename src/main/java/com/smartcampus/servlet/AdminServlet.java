package com.smartcampus.servlet;

import com.smartcampus.dao.ComplaintDAO;
import com.smartcampus.model.Complaint;
import com.smartcampus.model.User;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.util.List;

@WebServlet("/api/admin/complaints")
public class AdminServlet extends HttpServlet {

    private final ComplaintDAO complaintDAO = new ComplaintDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        HttpSession session = req.getSession(false);
        User user = session == null ? null : (User) session.getAttribute("user");

        if (user == null || !"admin".equals(user.getRole())) {
            resp.setStatus(403);
            resp.getWriter().write("{\"success\":false,\"message\":\"Admin access required\"}");
            return;
        }

        List<Complaint> complaints = complaintDAO.getAllComplaints();

        long pending = complaints.stream().filter(c -> "Pending".equals(c.getStatus())).count();
        long inProgress = complaints.stream().filter(c -> "In Progress".equals(c.getStatus())).count();
        long resolved = complaints.stream().filter(c -> "Resolved".equals(c.getStatus())).count();
        long high = complaints.stream().filter(c -> "High".equals(c.getPriority())).count();

        StringBuilder sb = new StringBuilder("{");
        sb.append("\"stats\":{")
          .append("\"total\":").append(complaints.size()).append(",")
          .append("\"pending\":").append(pending).append(",")
          .append("\"inProgress\":").append(inProgress).append(",")
          .append("\"resolved\":").append(resolved).append(",")
          .append("\"high\":").append(high)
          .append("},");

        sb.append("\"complaints\":[");
        for (int i = 0; i < complaints.size(); i++) {
            sb.append(complaints.get(i).toJson());
            if (i < complaints.size() - 1) sb.append(",");
        }
        sb.append("]}");

        resp.getWriter().write(sb.toString());
    }
}
