package com.enterprise.expense.service;

import com.enterprise.expense.model.AuditLog;
import com.enterprise.expense.model.User;
import com.enterprise.expense.repository.AuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.List;

@Service
public class AuditService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    public void log(User user, String action, String entityType, Long entityId, String details) {
        String ipAddress = "127.0.0.1";
        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                HttpServletRequest request = attrs.getRequest();
                ipAddress = request.getRemoteAddr();
            }
        } catch (Exception ignored) {}

        String userName = (user != null) ? user.getFullName() + " (" + user.getEmail() + ")" : "System";
        AuditLog auditLog = new AuditLog(user, userName, action, entityType, entityId, details, ipAddress);
        auditLogRepository.save(auditLog);
    }

    public List<AuditLog> getAllAuditLogs() {
        return auditLogRepository.findAllByOrderByCreatedAtDesc();
    }
}
