-- =========================================================================
-- ENTERPRISE EXPENSE MANAGEMENT SYSTEM DATABASE SCHEMA & INITIALIZATION SCRIPT
-- Database: enterprise_expense_db
-- Technology: MySQL 8.0+
-- =========================================================================

CREATE DATABASE IF NOT EXISTS `enterprise_expense_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `enterprise_expense_db`;

-- 1. Departments Table
CREATE TABLE IF NOT EXISTS `departments` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL UNIQUE,
    `code` VARCHAR(20) NOT NULL UNIQUE,
    `description` VARCHAR(500),
    `head_user_id` BIGINT,
    `head_name` VARCHAR(100),
    `monthly_budget` DECIMAL(12, 2) DEFAULT 0.00,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Users Table
CREATE TABLE IF NOT EXISTS `users` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `full_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(120) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `role` VARCHAR(20) NOT NULL,
    `employee_id` VARCHAR(50) UNIQUE,
    `phone` VARCHAR(30),
    `department_id` BIGINT,
    `active` BOOLEAN NOT NULL DEFAULT TRUE,
    `avatar_url` VARCHAR(255),
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_users_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Projects Table
CREATE TABLE IF NOT EXISTS `projects` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(120) NOT NULL,
    `code` VARCHAR(30) NOT NULL UNIQUE,
    `department_id` BIGINT NOT NULL,
    `allocated_budget` DECIMAL(12, 2) DEFAULT 0.00,
    `spent_amount` DECIMAL(12, 2) DEFAULT 0.00,
    `status` VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    `description` VARCHAR(500),
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_projects_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Expenses Table
CREATE TABLE IF NOT EXISTS `expenses` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `expense_number` VARCHAR(50) NOT NULL UNIQUE,
    `user_id` BIGINT NOT NULL,
    `department_id` BIGINT NOT NULL,
    `project_id` BIGINT,
    `title` VARCHAR(150) NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `expense_date` DATE NOT NULL,
    `business_purpose` TEXT NOT NULL,
    `payment_method` VARCHAR(50) NOT NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED',
    `rejection_reason` TEXT,
    `policy_violations` TEXT,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_expenses_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_expenses_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`),
    CONSTRAINT `fk_expenses_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Expense Receipts Table (with file_hash index for duplicate detection)
CREATE TABLE IF NOT EXISTS `expense_receipts` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `expense_id` BIGINT NOT NULL,
    `file_name` VARCHAR(255) NOT NULL,
    `original_name` VARCHAR(255) NOT NULL,
    `file_url` VARCHAR(500) NOT NULL,
    `file_type` VARCHAR(100),
    `file_size` BIGINT,
    `file_hash` VARCHAR(64) NOT NULL,
    `uploaded_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_receipt_hash` (`file_hash`),
    CONSTRAINT `fk_receipts_expense` FOREIGN KEY (`expense_id`) REFERENCES `expenses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Approvals Table
CREATE TABLE IF NOT EXISTS `approvals` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `expense_id` BIGINT NOT NULL,
    `approver_id` BIGINT NOT NULL,
    `approver_role` VARCHAR(50) NOT NULL,
    `status` VARCHAR(30) NOT NULL,
    `comments` TEXT,
    `decision_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_approvals_expense` FOREIGN KEY (`expense_id`) REFERENCES `expenses` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_approvals_approver` FOREIGN KEY (`approver_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Budgets Table
CREATE TABLE IF NOT EXISTS `budgets` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `department_id` BIGINT NOT NULL,
    `project_id` BIGINT,
    `year` INT NOT NULL,
    `month` INT NOT NULL,
    `allocated_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `spent_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `remaining_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `alert_threshold` DOUBLE NOT NULL DEFAULT 80.0,
    CONSTRAINT `fk_budgets_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_budgets_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Reimbursements Table
CREATE TABLE IF NOT EXISTS `reimbursements` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `expense_id` BIGINT NOT NULL UNIQUE,
    `finance_user_id` BIGINT NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `payment_method` VARCHAR(50) NOT NULL,
    `transaction_reference` VARCHAR(100) NOT NULL,
    `payment_date` DATE NOT NULL,
    `notes` TEXT,
    `status` VARCHAR(30) NOT NULL DEFAULT 'REIMBURSED',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_reimbursements_expense` FOREIGN KEY (`expense_id`) REFERENCES `expenses` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_reimbursements_finance` FOREIGN KEY (`finance_user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Notifications Table
CREATE TABLE IF NOT EXISTS `notifications` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `message` TEXT NOT NULL,
    `type` VARCHAR(20) DEFAULT 'INFO',
    `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
    `link_url` VARCHAR(255),
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Audit Logs Table
CREATE TABLE IF NOT EXISTS `audit_logs` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT,
    `user_name` VARCHAR(100),
    `action` VARCHAR(100) NOT NULL,
    `entity_type` VARCHAR(50),
    `entity_id` BIGINT,
    `details` TEXT,
    `ip_address` VARCHAR(50),
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_audit_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Expense Policies Table
CREATE TABLE IF NOT EXISTS `expense_policies` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `category` VARCHAR(50) NOT NULL UNIQUE,
    `max_limit` DECIMAL(12, 2) NOT NULL,
    `receipt_required` BOOLEAN NOT NULL DEFAULT TRUE,
    `description` VARCHAR(500),
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================
-- INITIAL SEED DATA
-- Default Passwords (BCrypt hash of 'admin123', 'manager123', etc.):
-- admin123   -> $2a$10$7zB3c9...
-- =========================================================================

-- Departments
INSERT INTO `departments` (`id`, `name`, `code`, `description`, `head_name`, `monthly_budget`) VALUES
(1, 'Engineering', 'ENG', 'Core Software Engineering & Tech Operations', 'Sarah Jenkins', 50000.00),
(2, 'Sales & Marketing', 'MKT', 'Global Marketing, Branding & Enterprise Sales', NULL, 40000.00),
(3, 'Product & Design', 'PRD', 'Product Strategy, UX/UI, and Design Systems', NULL, 25000.00),
(4, 'Finance & Legal', 'FIN', 'Corporate Finance, Accounting, Compliance & Payroll', 'Mark Vance', 15000.00),
(5, 'Human Resources', 'HR', 'Talent Acquisition, People Operations & Culture', NULL, 12000.00)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- Policies
INSERT INTO `expense_policies` (`category`, `max_limit`, `receipt_required`, `description`, `is_active`) VALUES
('TRAVEL', 1500.00, 1, 'Flight & long-distance transit. Economy class required.', 1),
('FOOD', 150.00, 1, 'Daily meal limit during business travel. Itemized bill required.', 1),
('ACCOMMODATION', 800.00, 1, 'Hotel standard room rate max per night.', 1),
('TRANSPORTATION', 200.00, 1, 'Local taxi, Uber, train or car rental.', 1),
('OFFICE_SUPPLIES', 500.00, 1, 'Workstation accessories, monitors, cables, stationery.', 1),
('CLIENT_MEETINGS', 600.00, 1, 'Client entertainment, lunches, meetings. Attendee list required.', 1),
('INTERNET_AND_COMMUNICATION', 100.00, 1, 'Monthly home broadband & mobile reimbursement.', 1),
('MEDICAL', 1000.00, 1, 'Emergency on-trip healthcare or work-related physical assessment.', 1),
('OTHER', 300.00, 1, 'Miscellaneous operational expenses with approval note.', 1)
ON DUPLICATE KEY UPDATE `max_limit`=VALUES(`max_limit`);
