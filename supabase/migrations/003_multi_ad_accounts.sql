-- Replace single ad_account_id with an array of account IDs
alter table clients add column if not exists ad_account_ids text[] not null default '{}';

-- Migrate existing data
update clients set ad_account_ids = array[ad_account_id] where ad_account_id is not null and ad_account_id != '';
