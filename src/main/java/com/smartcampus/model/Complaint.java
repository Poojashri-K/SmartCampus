package com.smartcampus.model;

import java.math.BigDecimal;
import java.sql.Timestamp;

public class Complaint {
    private int id;
    private int userId;
    private String userName;
    private String category;
    private String description;
    private String location;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private BigDecimal locationAccuracy;
    private String imagePath;
    private String status;
    private String priority;
    private Timestamp createdAt;
    private Timestamp updatedAt;

    public Complaint() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public BigDecimal getLatitude() { return latitude; }
    public void setLatitude(BigDecimal latitude) { this.latitude = latitude; }

    public BigDecimal getLongitude() { return longitude; }
    public void setLongitude(BigDecimal longitude) { this.longitude = longitude; }

    public BigDecimal getLocationAccuracy() { return locationAccuracy; }
    public void setLocationAccuracy(BigDecimal locationAccuracy) { this.locationAccuracy = locationAccuracy; }

    public String getImagePath() { return imagePath; }
    public void setImagePath(String imagePath) { this.imagePath = imagePath; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

    public Timestamp getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Timestamp updatedAt) { this.updatedAt = updatedAt; }

    public String toJson() {
        return "{"
            + "\"id\":" + id + ","
            + "\"userId\":" + userId + ","
            + "\"userName\":\"" + esc(userName) + "\","
            + "\"category\":\"" + esc(category) + "\","
            + "\"description\":\"" + esc(description) + "\","
            + "\"location\":\"" + esc(location) + "\","
            + "\"latitude\":" + jsonNumber(latitude) + ","
            + "\"longitude\":" + jsonNumber(longitude) + ","
            + "\"locationAccuracy\":" + jsonNumber(locationAccuracy) + ","
            + "\"imagePath\":\"" + esc(imagePath) + "\","
            + "\"status\":\"" + esc(status) + "\","
            + "\"priority\":\"" + esc(priority) + "\","
            + "\"createdAt\":\"" + (createdAt == null ? "" : createdAt.toString()) + "\","
            + "\"updatedAt\":\"" + (updatedAt == null ? "" : updatedAt.toString()) + "\""
            + "}";
    }

    private String esc(String s) {
        return s == null ? "" : s.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    private String jsonNumber(BigDecimal value) {
        return value == null ? "null" : value.toPlainString();
    }
}
