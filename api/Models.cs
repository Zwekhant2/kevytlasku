namespace Api;

public record Client(string Name, string? BusinessId, string? Email, string? Address);

public record LineItem(string Id, string Description, double Quantity, string Unit, double UnitPrice, double VatRate);

// InvoiceNumber and PaymentTermDays are `long`, not `int`: SQLite's INTEGER
// affinity always comes back as Int64, and Dapper's record-constructor
// materializer requires an exact type match (no implicit narrowing) or it
// throws at read time.
public record Invoice(
    string Id,
    long InvoiceNumber,
    Client Client,
    string IssueDate,
    string DueDate,
    long PaymentTermDays,
    string Status,
    List<LineItem> LineItems,
    double ServiceFeeRate
);

// Same shape as Invoice, minus the server-assigned Id — used for the
// POST/PUT request body.
public record InvoiceInput(
    long InvoiceNumber,
    Client Client,
    string IssueDate,
    string DueDate,
    long PaymentTermDays,
    string Status,
    List<LineItem> LineItems,
    double ServiceFeeRate
);
