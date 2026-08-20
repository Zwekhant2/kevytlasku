using Dapper;
using Microsoft.Data.Sqlite;

namespace Api;

// Flat rows as they actually sit in SQLite — Invoices and LineItems are two
// tables, joined and reassembled into the nested Invoice shape the frontend
// expects. No ORM change-tracking, no multi-mapping magic: just SQL in,
// records out.
record InvoiceRow(
    string Id,
    long InvoiceNumber,
    string ClientName,
    string? ClientBusinessId,
    string? ClientEmail,
    string? ClientAddress,
    string IssueDate,
    string DueDate,
    long PaymentTermDays,
    string Status,
    double ServiceFeeRate
);

record LineItemRow(string Id, string InvoiceId, string Description, double Quantity, string Unit, double UnitPrice, double VatRate);

public static class InvoiceStore
{
    private const string ConnectionString = "Data Source=kevytlasku.db";

    public static SqliteConnection OpenConnection()
    {
        var connection = new SqliteConnection(ConnectionString);
        connection.Open();
        connection.Execute("PRAGMA foreign_keys = ON;");
        return connection;
    }

    /// Creates the schema if it doesn't exist yet and seeds a handful of
    /// sample invoices on a brand-new database, so a fresh clone has
    /// something to look at immediately.
    public static void Initialize()
    {
        using var db = OpenConnection();

        db.Execute(
            """
            CREATE TABLE IF NOT EXISTS Invoices (
                Id               TEXT PRIMARY KEY,
                InvoiceNumber    INTEGER NOT NULL UNIQUE,
                ClientName       TEXT NOT NULL,
                ClientBusinessId TEXT,
                ClientEmail      TEXT,
                ClientAddress    TEXT,
                IssueDate        TEXT NOT NULL,
                DueDate          TEXT NOT NULL,
                PaymentTermDays  INTEGER NOT NULL DEFAULT 14,
                Status           TEXT NOT NULL CHECK (Status IN ('draft','sent','paid','overdue')),
                ServiceFeeRate   REAL NOT NULL DEFAULT 1.9
            );

            CREATE TABLE IF NOT EXISTS LineItems (
                Id          TEXT PRIMARY KEY,
                InvoiceId   TEXT NOT NULL REFERENCES Invoices(Id) ON DELETE CASCADE,
                Description TEXT NOT NULL,
                Quantity    REAL NOT NULL,
                Unit        TEXT NOT NULL,
                UnitPrice   REAL NOT NULL,
                VatRate     REAL NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_lineitems_invoice ON LineItems(InvoiceId);
            """
        );

        var isEmpty = db.ExecuteScalar<long>("SELECT COUNT(*) FROM Invoices") == 0;
        if (isEmpty)
        {
            Seed(db);
        }
    }

    private static void Seed(SqliteConnection db)
    {
        using var tx = db.BeginTransaction();

        (string id, int number, string name, string businessId, string email, string address, string issued, string due, string status)[] invoices =
        [
            ("inv_001", 1001, "Rakennus Virtanen Oy", "1234567-8", "laskut@virtanen.fi", "Mannerheimintie 12, 00100 Helsinki", "2026-07-20", "2026-08-03", "paid"),
            ("inv_002", 1002, "Kahvila Aromi Ky", "2345678-9", "talous@aromikahvila.fi", "Aleksanterinkatu 5, 00170 Helsinki", "2026-08-01", "2026-08-15", "sent"),
            ("inv_003", 1003, "Studio Valo Oy", "3456789-0", "laskutus@studiovalo.fi", "Fredrikinkatu 33, 00120 Helsinki", "2026-07-05", "2026-07-19", "overdue"),
            ("inv_004", 1004, "Pieni Puutarha Oy", "4567890-1", "info@pienipuutarha.fi", "Puistotie 8, 02100 Espoo", "2026-08-12", "2026-08-26", "draft"),
            ("inv_005", 1005, "Kielikoulu Lingua", "5678901-2", "laskut@lingua.fi", "Yliopistonkatu 2, 33100 Tampere", "2026-06-15", "2026-06-29", "paid"),
            ("inv_006", 1006, "Rakennus Virtanen Oy", "1234567-8", "laskut@virtanen.fi", "Mannerheimintie 12, 00100 Helsinki", "2026-08-10", "2026-08-24", "sent"),
        ];

        foreach (var inv in invoices)
        {
            // Dapper rejects ValueTuples as query parameters (no reflectable
            // field names), so project into an anonymous object first.
            db.Execute(
                """
                INSERT INTO Invoices (Id, InvoiceNumber, ClientName, ClientBusinessId, ClientEmail, ClientAddress, IssueDate, DueDate, PaymentTermDays, Status, ServiceFeeRate)
                VALUES (@id, @number, @name, @businessId, @email, @address, @issued, @due, 14, @status, 1.9)
                """,
                new { inv.id, inv.number, inv.name, inv.businessId, inv.email, inv.address, inv.issued, inv.due, inv.status },
                tx);
        }

        (string id, string invoiceId, string description, double quantity, string unit, double unitPrice, double vatRate)[] lineItems =
        [
            ("li_001_1", "inv_001", "Sähkötyöt, 2 päivää", 16, "h", 65, 25.5),
            ("li_002_1", "inv_002", "Verkkosivun ylläpito, elokuu", 1, "kk", 180, 25.5),
            ("li_002_2", "inv_002", "Leipomotarvikkeet", 12, "kpl", 8.5, 14),
            ("li_003_1", "inv_003", "Kuvauspäivä, studiovuokra", 1, "pv", 420, 25.5),
            ("li_004_1", "inv_004", "Pihasuunnittelu", 6, "h", 55, 25.5),
            ("li_004_2", "inv_004", "Taimet", 20, "kpl", 6.9, 14),
            ("li_005_1", "inv_005", "Suomen kielen kurssimateriaali", 15, "kpl", 24, 10),
            ("li_006_1", "inv_006", "Sähkötyöt, jatko", 8, "h", 65, 25.5),
        ];

        foreach (var item in lineItems)
        {
            db.Execute(
                "INSERT INTO LineItems (Id, InvoiceId, Description, Quantity, Unit, UnitPrice, VatRate) VALUES (@id, @invoiceId, @description, @quantity, @unit, @unitPrice, @vatRate)",
                new { item.id, item.invoiceId, item.description, item.quantity, item.unit, item.unitPrice, item.vatRate },
                tx);
        }

        tx.Commit();
    }

    private static Invoice ToInvoice(InvoiceRow row, IEnumerable<LineItemRow> items) =>
        new(
            row.Id,
            row.InvoiceNumber,
            new Client(row.ClientName, row.ClientBusinessId, row.ClientEmail, row.ClientAddress),
            row.IssueDate,
            row.DueDate,
            row.PaymentTermDays,
            row.Status,
            items.Select(li => new LineItem(li.Id, li.Description, li.Quantity, li.Unit, li.UnitPrice, li.VatRate)).ToList(),
            row.ServiceFeeRate
        );

    public static async Task<List<Invoice>> GetAllAsync(SqliteConnection db)
    {
        var invoiceRows = (await db.QueryAsync<InvoiceRow>(
            "SELECT Id, InvoiceNumber, ClientName, ClientBusinessId, ClientEmail, ClientAddress, IssueDate, DueDate, PaymentTermDays, Status, ServiceFeeRate FROM Invoices ORDER BY IssueDate DESC"
        )).ToList();

        var lineItemRows = (await db.QueryAsync<LineItemRow>(
            "SELECT Id, InvoiceId, Description, Quantity, Unit, UnitPrice, VatRate FROM LineItems"
        )).ToList();

        var itemsByInvoice = lineItemRows.ToLookup(li => li.InvoiceId);
        return invoiceRows.Select(row => ToInvoice(row, itemsByInvoice[row.Id])).ToList();
    }

    public static async Task<Invoice?> GetByIdAsync(SqliteConnection db, string id)
    {
        var row = await db.QuerySingleOrDefaultAsync<InvoiceRow>(
            "SELECT Id, InvoiceNumber, ClientName, ClientBusinessId, ClientEmail, ClientAddress, IssueDate, DueDate, PaymentTermDays, Status, ServiceFeeRate FROM Invoices WHERE Id = @id",
            new { id });

        if (row is null) return null;

        var items = await db.QueryAsync<LineItemRow>(
            "SELECT Id, InvoiceId, Description, Quantity, Unit, UnitPrice, VatRate FROM LineItems WHERE InvoiceId = @id",
            new { id });

        return ToInvoice(row, items);
    }

    public static async Task<Invoice> CreateAsync(SqliteConnection db, InvoiceInput input)
    {
        var id = $"inv_{Guid.NewGuid()}";
        using var tx = db.BeginTransaction();

        await db.ExecuteAsync(
            """
            INSERT INTO Invoices (Id, InvoiceNumber, ClientName, ClientBusinessId, ClientEmail, ClientAddress, IssueDate, DueDate, PaymentTermDays, Status, ServiceFeeRate)
            VALUES (@Id, @InvoiceNumber, @Name, @BusinessId, @Email, @Address, @IssueDate, @DueDate, @PaymentTermDays, @Status, @ServiceFeeRate)
            """,
            new
            {
                Id = id, input.InvoiceNumber, input.Client.Name, input.Client.BusinessId, input.Client.Email, input.Client.Address,
                input.IssueDate, input.DueDate, input.PaymentTermDays, input.Status, input.ServiceFeeRate,
            },
            tx);

        await InsertLineItemsAsync(db, tx, id, input.LineItems);

        tx.Commit();
        return (await GetByIdAsync(db, id))!;
    }

    public static async Task<Invoice?> UpdateAsync(SqliteConnection db, string id, InvoiceInput input)
    {
        using var tx = db.BeginTransaction();

        var rowsAffected = await db.ExecuteAsync(
            """
            UPDATE Invoices SET
                InvoiceNumber = @InvoiceNumber, ClientName = @Name, ClientBusinessId = @BusinessId,
                ClientEmail = @Email, ClientAddress = @Address, IssueDate = @IssueDate, DueDate = @DueDate,
                PaymentTermDays = @PaymentTermDays, Status = @Status, ServiceFeeRate = @ServiceFeeRate
            WHERE Id = @Id
            """,
            new
            {
                Id = id, input.InvoiceNumber, input.Client.Name, input.Client.BusinessId, input.Client.Email, input.Client.Address,
                input.IssueDate, input.DueDate, input.PaymentTermDays, input.Status, input.ServiceFeeRate,
            },
            tx);

        if (rowsAffected == 0)
        {
            tx.Rollback();
            return null;
        }

        // The client always sends the full current line-item set (never a
        // diff), so replacing wholesale is simpler and just as correct as
        // diffing inserts/updates/deletes against what's already stored.
        await db.ExecuteAsync("DELETE FROM LineItems WHERE InvoiceId = @id", new { id }, tx);
        await InsertLineItemsAsync(db, tx, id, input.LineItems);

        tx.Commit();
        return await GetByIdAsync(db, id);
    }

    private static async Task InsertLineItemsAsync(SqliteConnection db, SqliteTransaction tx, string invoiceId, List<LineItem> items)
    {
        foreach (var item in items)
        {
            await db.ExecuteAsync(
                "INSERT INTO LineItems (Id, InvoiceId, Description, Quantity, Unit, UnitPrice, VatRate) VALUES (@Id, @InvoiceId, @Description, @Quantity, @Unit, @UnitPrice, @VatRate)",
                new { item.Id, InvoiceId = invoiceId, item.Description, item.Quantity, item.Unit, item.UnitPrice, item.VatRate },
                tx);
        }
    }
}
