package com.smartcampus.servlet;

import com.smartcampus.dao.ComplaintDAO;
import com.smartcampus.model.Complaint;
import com.smartcampus.model.User;
import com.smartcampus.util.PriorityCalculator;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@WebServlet("/api/complaint")
@MultipartConfig(maxFileSize = 5 * 1024 * 1024) // 5 MB per image
public class ComplaintServlet extends HttpServlet {

    private final ComplaintDAO complaintDAO = new ComplaintDAO();

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
        String category = req.getParameter("category");
        String description = req.getParameter("description");
        String location = req.getParameter("location");
        BigDecimal latitude = parseNullableDecimal(req.getParameter("latitude"), new BigDecimal("-90"), new BigDecimal("90"), 7);
        BigDecimal longitude = parseNullableDecimal(req.getParameter("longitude"), new BigDecimal("-180"), new BigDecimal("180"), 7);
        BigDecimal locationAccuracy = parseNullableDecimal(req.getParameter("locationAccuracy"), BigDecimal.ZERO, new BigDecimal("99999999.99"), 2);
        boolean force = "true".equals(req.getParameter("force"));

        if (category == null || description == null || category.isEmpty() || description.isEmpty()) {
            resp.setStatus(400);
            resp.getWriter().write("{\"success\":false,\"message\":\"Category and description are required\"}");
            return;
        }

        // Duplicate check: is the same real-world problem already open, filed by anyone?
        if (!force) {
            Complaint existing = complaintDAO.findSimilarOpenComplaint(category, location, description);
            if (existing != null) {
                resp.setStatus(409);
                resp.getWriter().write("{"
                    + "\"success\":false,"
                    + "\"duplicate\":true,"
                    + "\"existingId\":" + existing.getId() + ","
                    + "\"existingStatus\":\"" + existing.getStatus() + "\","
                    + "\"message\":\"This problem looks like it's already been reported (Complaint #" + existing.getId() + ", " + existing.getStatus() + "). You can track that one, or submit anyway if yours is a separate issue.\""
                    + "}");
                return;
            }
        }

        String imagePath = saveImageIfPresent(req);

        Complaint c = new Complaint();
        c.setUserId(user.getId());
        c.setCategory(category);
        c.setDescription(description);
        c.setLocation(location);
        c.setLatitude(latitude);
        c.setLongitude(longitude);
        c.setLocationAccuracy(locationAccuracy);
        c.setImagePath(imagePath);
        c.setPriority(PriorityCalculator.calculatePriority(category, description));

        int id = complaintDAO.addComplaint(c);
        if (id != -1) {
            resp.getWriter().write("{\"success\":true,\"id\":" + id + ",\"priority\":\"" + c.getPriority() + "\"}");
        } else {
            resp.setStatus(500);
            resp.getWriter().write("{\"success\":false,\"message\":\"Could not submit complaint\"}");
        }
    }

    private BigDecimal parseNullableDecimal(String value, BigDecimal min, BigDecimal max, int scale) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        try {
            BigDecimal parsed = new BigDecimal(value.trim());
            if (parsed.compareTo(min) < 0 || parsed.compareTo(max) > 0) {
                return null;
            }
            return parsed.setScale(scale, RoundingMode.HALF_UP);
        } catch (NumberFormatException | ArithmeticException e) {
            return null;
        }
    }

    /**
     * Saves the optional "image" part under webapp/uploads/ with a random file name and
     * returns the relative web path to store in the DB (e.g. "uploads/ab12cd.jpg"), or null
     * if no image (or an empty file input) was sent.
     */
    private String saveImageIfPresent(HttpServletRequest req) throws IOException, ServletException {
        Part part;
        try {
            part = req.getPart("image");
        } catch (IOException | ServletException e) {
            return null; // not a multipart request, or no such part — no image submitted
        }
        if (part == null || part.getSize() == 0) {
            return null;
        }

        String submittedName = part.getSubmittedFileName();
        String extension = "";
        if (submittedName != null && submittedName.contains(".")) {
            extension = submittedName.substring(submittedName.lastIndexOf('.'));
        }
        String fileName = UUID.randomUUID().toString().replace("-", "") + extension;

        String uploadsRealPath = getServletContext().getRealPath("/uploads");
        File uploadsDir = new File(uploadsRealPath);
        if (!uploadsDir.exists()) {
            uploadsDir.mkdirs();
        }

        Path target = new File(uploadsDir, fileName).toPath();
        try (InputStream in = part.getInputStream()) {
            Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
        }

        return "uploads/" + fileName;
    }
}
