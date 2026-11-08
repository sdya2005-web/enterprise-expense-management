package com.enterprise.expense.model;

public enum ExpenseCategory {
    TRAVEL("Travel"),
    FOOD("Food"),
    ACCOMMODATION("Accommodation"),
    TRANSPORTATION("Transportation"),
    OFFICE_SUPPLIES("Office Supplies"),
    CLIENT_MEETINGS("Client Meetings"),
    INTERNET_AND_COMMUNICATION("Internet and Communication"),
    MEDICAL("Medical"),
    OTHER("Other Expenses");

    private final String displayName;

    ExpenseCategory(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
