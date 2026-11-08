package com.enterprise.expense.model;

public enum PaymentMethod {
    PERSONAL_CREDIT_CARD("Personal Credit Card"),
    CORPORATE_CARD("Corporate Card"),
    DEBIT_CARD("Debit Card"),
    CASH("Cash"),
    ONLINE_TRANSFER("Online Transfer"),
    DIRECT_DEPOSIT("Direct Deposit"),
    WIRE_TRANSFER("Wire Transfer"),
    CHEQUE("Cheque");

    private final String displayName;

    PaymentMethod(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
