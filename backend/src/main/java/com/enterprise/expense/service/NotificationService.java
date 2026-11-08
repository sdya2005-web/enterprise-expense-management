package com.enterprise.expense.service;

import com.enterprise.expense.model.Notification;
import com.enterprise.expense.model.User;
import com.enterprise.expense.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    @Autowired
    private NotificationRepository notificationRepository;

    public Notification notifyUser(User user, String title, String message, String type, String linkUrl) {
        if (user == null) return null;

        // In-app notification
        Notification notification = new Notification(user, title, message, type, linkUrl);
        Notification saved = notificationRepository.save(notification);

        // Simulated Email Notification
        logger.info("[EMAIL NOTIFICATION] Sending to: {} <{}> | Subject: {} | Message: {}", 
                user.getFullName(), user.getEmail(), title, message);

        return saved;
    }

    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findTop20ByUserIdOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setIsRead(true);
            notificationRepository.save(n);
        });
    }

    public void markAllAsRead(Long userId) {
        List<Notification> list = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        for (Notification n : list) {
            n.setIsRead(true);
        }
        notificationRepository.saveAll(list);
    }
}
