-- Trigger to automatically create a user_profile when a new Auth User signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  matching_shop_id uuid;
  super_admin_count integer;
begin
  -- 1. Check if they were invited as a shop owner
  select id into matching_shop_id from public.shops where owner_email = new.email limit 1;

  -- 2. Check if we already have a super_admin
  select count(*) into super_admin_count from public.user_profiles where role = 'super_admin';

  if matching_shop_id is not null then
    -- They are a registered shop owner! Assign their role and link them to their shop.
    insert into public.user_profiles (id, name, email, role, shop_id)
    values (new.id, coalesce(new.raw_user_meta_data->>'name', 'Shop Owner'), new.email, 'shop_owner', matching_shop_id);

  elsif super_admin_count = 0 then
    -- First person to ever sign up becomes the super admin
    insert into public.user_profiles (id, name, email, role)
    values (new.id, coalesce(new.raw_user_meta_data->>'name', 'Super Admin'), new.email, 'super_admin');

  else
    -- Standard fallback for staff or unassigned users
    insert into public.user_profiles (id, name, email, role)
    values (new.id, coalesce(new.raw_user_meta_data->>'name', 'Staff'), new.email, 'shop_staff');
  end if;

  return new;
end;
$$;
