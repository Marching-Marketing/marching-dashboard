-- Add ad_account_id column to clients table
alter table clients add column if not exists ad_account_id text;
