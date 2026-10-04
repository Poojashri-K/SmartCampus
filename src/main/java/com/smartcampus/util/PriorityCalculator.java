package com.smartcampus.util;

public class PriorityCalculator {

    private static final String[] HIGH_KEYWORDS = {
        "fire", "electric shock", "shock", "gas leak", "leak", "ceiling fall",
        "security", "harassment", "injury", "injured", "accident", "flood",
        "short circuit", "collapse", "smoke"
    };

    private static final String[] MEDIUM_KEYWORDS = {
        "water", "wifi", "internet", "network", "ac not working", "fan not working",
        "no power", "power cut", "broken", "leakage", "toilet", "washroom",
        "mess food", "food quality", "hygiene"
    };

    private PriorityCalculator() {}

    public static String calculatePriority(String category, String description) {
        String text = ((category == null ? "" : category) + " " + (description == null ? "" : description)).toLowerCase();

        for (String kw : HIGH_KEYWORDS) {
            if (text.contains(kw)) {
                return "High";
            }
        }
        for (String kw : MEDIUM_KEYWORDS) {
            if (text.contains(kw)) {
                return "Medium";
            }
        }
        if ("hostel".equalsIgnoreCase(category) || "infrastructure".equalsIgnoreCase(category)) {
            return "Medium";
        }
        return "Low";
    }
}
