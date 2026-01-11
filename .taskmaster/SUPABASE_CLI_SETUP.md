# Supabase CLI Setup for Automated Migrations

## Requirements

To run Task 2 (Database Schema) on autopilot, you need:

### 1. Supabase Project Reference
- Found in your Supabase dashboard URL: `https://supabase.com/dashboard/project/[PROJECT_REF]`
- Your project ref appears to be: `sclsdjdratafqkvklbvd` (from .env.local URL)

### 2. Supabase Access Token (Optional but Recommended)
The CLI can authenticate in two ways:

**Option A: Login via Browser (Interactive)**
```bash
supabase login
```
This opens a browser for authentication. Good for initial setup.

**Option B: Access Token (Fully Automated)**
1. Get access token from: https://supabase.com/dashboard/account/tokens
2. Set environment variable:
   ```bash
   export SUPABASE_ACCESS_TOKEN=your_access_token_here
   ```
   Or add to `.env.local`:
   ```
   SUPABASE_ACCESS_TOKEN=your_access_token_here
   ```

### 3. CLI Installation
The agent will install Supabase CLI as part of Task 2, but you can pre-install:
```bash
npm install --save-dev supabase
# OR globally:
npm install -g supabase
```

## What the Agent Will Do

1. **Initialize**: `supabase init` - Creates `supabase/` folder structure
2. **Link**: `supabase link --project-ref sclsdjdratafqkvklbvd` - Links to your remote project
3. **Create Migrations**: Creates SQL files in `supabase/migrations/` with timestamped names
4. **Push Migrations**: `supabase db push` - Applies all migrations to remote database
5. **Verify**: Uses Supabase client queries to programmatically verify schema

## Fully Automated Flow

Once the access token is set (or after `supabase login`), Task 2 can run completely on autopilot with no manual dashboard interaction needed.

## Note
If you don't set up the access token, the agent will need to run `supabase login` which requires browser interaction. For full autopilot, use the access token method.

