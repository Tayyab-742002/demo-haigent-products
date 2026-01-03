-- Add cover_letter column to candidates table
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS cover_letter TEXT;
