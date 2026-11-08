package com.enterprise.expense.dto;

import com.enterprise.expense.model.Role;

public class RegisterRequest {
    private String fullName;
    private String email;
    private String password;
    private Role role = Role.ROLE_EMPLOYEE;
    private String employeeId;
    private Long departmentId;
    private String phone;

    public RegisterRequest() {}

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }

    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
}
