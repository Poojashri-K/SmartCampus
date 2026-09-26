package com.smartcampus.servlet;

import com.smartcampus.dao.ComplaintDAO;
import com.smartcampus.model.Complaint;
import com.smartcampus.model.User;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.util.List;

@WebServlet("/api/my-complaints")
public class MyComplaintsServlet extends HttpServlet {

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

        User user = (User) session.getAttribute("user");
        List<Complaint> complaints = complaintDAO.getComplaintsByUser(user.getId());

        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < complaints.size(); i++) {
            sb.append(complaints.get(i).toJson());
            if (i < complaints.size() - 1) sb.append(",");
        }
        sb.append("]");
        resp.getWriter().write(sb.toString());
    }
}
