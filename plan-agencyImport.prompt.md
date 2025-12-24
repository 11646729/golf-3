GTFS Agency Import Plan

Goal

- Read agency.txt and insert all rows except the header into the PostgreSQL agency table.

Source & Target

- Source file: [backend/gtfs_data/TransportForIreland/agency.txt](backend/gtfs_data/TransportForIreland/agency.txt)
- Target table: schema defined in [backend/createPostgreSQLTables.js](backend/createPostgreSQLTables.js)

Schema Mapping (GTFS → agency)

- agency_id → agency_id (PRIMARY KEY)
- agency_name → agency_name (TEXT NOT NULL)
- agency_url → agency_url (TEXT NOT NULL)
- agency_timezone → agency_timezone (TEXT NOT NULL)
- agency_lang → agency_lang (TEXT, optional)
- agency_phone → agency_phone (TEXT, optional)
- agency_fare_url → agency_fare_url (TEXT, optional)
- agency_email → agency_email (TEXT, optional)
- cemv_support → NULL (unless provided; integer 0–2 per schema)

Implementation Steps

1. Confirm agency.txt path under backend/gtfs_data/\*\*.
2. Implement importer function `importAgencyTxt(filePath)` in [backend/readGtfsFiles.js](backend/readGtfsFiles.js):
   - Stream the file; use a robust CSV parser (quoted fields, commas) or minimal custom parsing.
   - Skip header row (first line) and parse remaining lines into objects.
3. Reuse Postgres utilities in [backend/databaseUtilities.js](backend/databaseUtilities.js):
   - Create a singleton connection/client.
   - Use parameterized INSERT with placeholder conversion and `ON CONFLICT DO NOTHING`.
4. Wire a runnable entry:
   - Option A: add a dedicated script `backend/gtfs_import_agency.js` that calls `importAgencyTxt()`.
   - Option B: expose a function callable from [backend/server.js](backend/server.js) for ad-hoc runs.
5. Logging & metrics:
   - Count inserted rows, skipped (duplicates), and errors; log summary at the end.
6. Error handling:
   - Validate required fields (`agency_id`, `agency_name`, `agency_url`, `agency_timezone`).
   - Skip malformed rows with warnings; do not crash the process.
7. Idempotency:
   - Use `ON CONFLICT (agency_id) DO NOTHING` to allow safe re-runs.

Insert SQL (parameterized)

- Example statement to match repo conventions:
  - INSERT INTO agency (agency_id, agency_name, agency_url, agency_timezone, agency_lang, agency_phone, agency_fare_url, agency_email)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT (agency_id) DO NOTHING;

Parser Options

- Option A: Add `csv-parse` for robust GTFS CSV parsing (handles quotes, escapes, BOMs).
- Option B: Minimal Node stream + custom line split if constraints disallow new deps (risk of edge cases).

Runner & Usage

- Provide CLI entry: `node backend/gtfs_import_agency.js --file backend/gtfs_data/TransportForIreland/agency.txt`.
- Environment: reuse existing PG connection settings in [backend/databaseUtilities.js](backend/databaseUtilities.js).

Testing

- Dry-run mode prints parsed rows without inserting (optional).
- Run against sample agency.txt; verify row counts and idempotency by re-running.

Notes

- Keep changes minimal and aligned with existing backend patterns.
- If multiple GTFS sources are introduced later, pass file path as an argument and consider a `source` tag if needed.
