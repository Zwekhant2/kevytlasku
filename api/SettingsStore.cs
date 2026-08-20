using Dapper;
using Microsoft.Data.Sqlite;

namespace Api;

// Single-row table: this app has one entrepreneur issuing invoices, not
// multiple tenants, so there's exactly one settings record (Id = 1) rather
// than a per-user profile system.
public static class SettingsStore
{
    public static void Initialize()
    {
        using var db = InvoiceStore.OpenConnection();

        db.Execute(
            """
            CREATE TABLE IF NOT EXISTS Settings (
                Id          INTEGER PRIMARY KEY CHECK (Id = 1),
                CompanyName TEXT NOT NULL,
                Iban        TEXT,
                Bic         TEXT
            );
            """
        );

        var isEmpty = db.ExecuteScalar<long>("SELECT COUNT(*) FROM Settings") == 0;
        if (isEmpty)
        {
            db.Execute(
                "INSERT INTO Settings (Id, CompanyName, Iban, Bic) VALUES (1, 'Your company', NULL, NULL)"
            );
        }
    }

    public static Task<Settings> GetAsync(SqliteConnection db) =>
        db.QuerySingleAsync<Settings>("SELECT CompanyName, Iban, Bic FROM Settings WHERE Id = 1");

    public static async Task<Settings> UpdateAsync(SqliteConnection db, Settings input)
    {
        await db.ExecuteAsync(
            "UPDATE Settings SET CompanyName = @CompanyName, Iban = @Iban, Bic = @Bic WHERE Id = 1",
            input
        );
        return await GetAsync(db);
    }
}
