-- Add overlay_url and mask_url columns to visite table
ALTER TABLE visite
  ADD COLUMN overlay_url TEXT NULL,
  ADD COLUMN mask_url TEXT NULL;
