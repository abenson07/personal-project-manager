# Supabase Migrations

This directory contains database migrations for the Personal Project Manager app.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create `.env.local` file:**
   ```bash
   cp .env.example .env.local
   ```

3. **Add your Supabase credentials to `.env.local`:**
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (for migrations)

## Check Credentials

Before running migrations, verify your credentials are correct:

```bash
npm run check-supabase
```

This will test the connection and verify your environment variables are set correctly.

## Running Migrations

### Option 1: Using Supabase CLI (Recommended)

1. **Install Supabase CLI:**
   ```bash
   npm install -g supabase
   ```

2. **Link your project:**
   ```bash
   supabase link --project-ref your-project-ref
   ```

3. **Reset database (drops all tables and runs migrations):**
   ```bash
   supabase db reset
   ```

### Option 2: Generate Combined SQL File

1. **Generate combined migration file:**
   ```bash
   npm run migrate:generate
   ```

2. **Open Supabase Dashboard:**
   - Go to https://app.supabase.com
   - Select your project
   - Navigate to SQL Editor

3. **Run the migration:**
   - Open `supabase/migrate-all.sql`
   - Copy the entire contents
   - Paste into Supabase SQL Editor
   - Click "Run"

### Option 3: Manual Migration

Run each migration file in order from `supabase/migrations/`:

1. `20260112000000_create_projects_table.sql`
2. `20260113000000_create_subproject_tables.sql`
3. `20260113000001_update_projects_status.sql`
4. `20260113000002_update_assets_to_subprojects.sql`
5. `20260113000003_migrate_data_to_subprojects.sql` (skip if starting fresh)

## Migration Order

Migrations are run in alphabetical/numerical order. The naming convention ensures proper execution order:

- `YYYYMMDDHHMMSS_description.sql`

## Fresh Start

The migrations are designed to work on a fresh database. If you have existing data:

1. **Backup your data** (if needed)
2. Run migrations - they will drop existing tables first
3. The data migration script (`20260113000003_migrate_data_to_subprojects.sql`) can be skipped if starting completely fresh

## Verification

After running migrations, verify the schema:

```bash
npm run check-supabase
```

This will check that:
- Connection works
- Required tables exist
- Credentials are valid

## Troubleshooting

### "Missing environment variables"
- Ensure `.env.local` exists and contains all required variables
- Check that variable names match exactly (case-sensitive)

### "Connection failed"
- Verify Supabase URL is correct
- Check that API keys are valid
- Ensure network connection is working

### "Table does not exist"
- Run migrations first
- Check migration execution order
- Verify migrations completed successfully

