package com.smartcampus.dao;

import com.smartcampus.model.Complaint;
import com.smartcampus.util.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class ComplaintDAO {

    public int addComplaint(Complaint c) {
        String sql = "INSERT INTO complaints (user_id, category, description, location, image_path, status, priority) VALUES (?, ?, ?, ?, ?, 'Pending', ?)";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setInt(1, c.getUserId());
            ps.setString(2, c.getCategory());
            ps.setString(3, c.getDescription());
            ps.setString(4, c.getLocation());
            ps.setString(5, c.getImagePath());
            ps.setString(6, c.getPriority());
            int rows = ps.executeUpdate();
            if (rows > 0) {
                try (ResultSet keys = ps.getGeneratedKeys()) {
                    if (keys.next()) {
                        return keys.getInt(1);
                    }
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return -1;
    }

    public List<Complaint> getComplaintsByUser(int userId) {
        List<Complaint> list = new ArrayList<>();
        String sql = "SELECT c.*, u.name AS user_name FROM complaints c JOIN users u ON c.user_id = u.id " +
                     "WHERE c.user_id = ? ORDER BY c.created_at DESC";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapRow(rs));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    public Complaint getComplaintById(int id) {
        String sql = "SELECT c.*, u.name AS user_name FROM complaints c JOIN users u ON c.user_id = u.id WHERE c.id = ?";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapRow(rs);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public List<Complaint> getAllComplaints() {
        List<Complaint> list = new ArrayList<>();
        String sql = "SELECT c.*, u.name AS user_name FROM complaints c JOIN users u ON c.user_id = u.id " +
                     "ORDER BY FIELD(c.priority,'High','Medium','Low'), c.created_at DESC";
        try (Connection con = DBConnection.getConnection();
             Statement st = con.createStatement();
             ResultSet rs = st.executeQuery(sql)) {
            while (rs.next()) {
                list.add(mapRow(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    /**
     * Looks for an already-open complaint (Pending / In Progress) that looks like the same
     * real-world problem, regardless of which user filed it:
     *   1) same category + same location (case/space-insensitive) — most reliable signal, or
     *   2) if no location was given, same category + the exact same description text.
     * Returns null when nothing similar is open.
     */
    public Complaint findSimilarOpenComplaint(String category, String location, String description) {
        String byLocationSql =
            "SELECT c.*, u.name AS user_name FROM complaints c JOIN users u ON c.user_id = u.id " +
            "WHERE c.category = ? AND LOWER(TRIM(c.location)) = LOWER(TRIM(?)) " +
            "AND c.status IN ('Pending','In Progress') ORDER BY c.created_at DESC LIMIT 1";

        String byDescriptionSql =
            "SELECT c.*, u.name AS user_name FROM complaints c JOIN users u ON c.user_id = u.id " +
            "WHERE c.category = ? AND LOWER(TRIM(c.description)) = LOWER(TRIM(?)) " +
            "AND c.status IN ('Pending','In Progress') ORDER BY c.created_at DESC LIMIT 1";

        boolean hasLocation = location != null && !location.trim().isEmpty();
        String sql = hasLocation ? byLocationSql : byDescriptionSql;
        String matchValue = hasLocation ? location : description;

        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, category);
            ps.setString(2, matchValue);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapRow(rs);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public boolean updateStatus(int id, String status) {
        String sql = "UPDATE complaints SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, status);
            ps.setInt(2, id);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    private Complaint mapRow(ResultSet rs) throws SQLException {
        Complaint c = new Complaint();
        c.setId(rs.getInt("id"));
        c.setUserId(rs.getInt("user_id"));
        c.setUserName(rs.getString("user_name"));
        c.setCategory(rs.getString("category"));
        c.setDescription(rs.getString("description"));
        c.setLocation(rs.getString("location"));
        c.setImagePath(rs.getString("image_path"));
        c.setStatus(rs.getString("status"));
        c.setPriority(rs.getString("priority"));
        c.setCreatedAt(rs.getTimestamp("created_at"));
        c.setUpdatedAt(rs.getTimestamp("updated_at"));
        return c;
    }
}
