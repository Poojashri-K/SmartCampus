package com.smartcampus.filter;

import com.smartcampus.model.User;

import jakarta.servlet.*;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.*;
import java.io.IOException;

@WebFilter("/api/*")
public class AuthenticationFilter implements Filter {

    private static final String[] PUBLIC_PATHS = {"/api/login", "/api/logout"};

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse resp = (HttpServletResponse) response;

        String path = req.getServletPath();

        for (String pub : PUBLIC_PATHS) {
            if (path.equals(pub)) {
                chain.doFilter(request, response);
                return;
            }
        }

        HttpSession session = req.getSession(false);
        User user = session == null ? null : (User) session.getAttribute("user");

        if (user == null) {
            resp.setContentType("application/json");
            resp.setStatus(401);
            resp.getWriter().write("{\"success\":false,\"message\":\"Not authenticated\"}");
            return;
        }

        if (path.startsWith("/api/admin") && !"admin".equals(user.getRole())) {
            resp.setContentType("application/json");
            resp.setStatus(403);
            resp.getWriter().write("{\"success\":false,\"message\":\"Admin access required\"}");
            return;
        }

        chain.doFilter(request, response);
    }
}
