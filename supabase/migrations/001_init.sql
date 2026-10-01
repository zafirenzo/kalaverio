-- Zarbafini: orders, waitlist, and the public Register view.
-- Run in the Zarbafini Supabase project (not Zenith's).

create table orders (
  id uuid primary key default gen_random_uuid(),
  set_slug text not null,
  size text not null check (size in ('XS','S','M','L','XL')),
  buyer_name text not null,
  register_name text not null,
  show_in_register boolean not null default false,
  city text,
  show_city boolean not null default false,
  phone text not null,
  email text not null,
  address text not null,
  pin text not null check (pin ~ '^[1-9][0-9]{5}$'),
  is_minor boolean not null,
  guardian_name text,
  guardian_phone text,
  amount_paise integer not null check (amount_paise > 0),
  gateway_order_id text unique,
  gateway_payment_id text,
  status text not null default 'created' check (status in ('created','paid','refund_due','refunded')),
  register_number integer, -- assigned only when status becomes paid
  set_number integer,
  created_at timestamptz not null default now(),
  check (not is_minor or (guardian_name is not null and guardian_phone is not null))
);

create unique index orders_register_number_paid on orders (register_number) where status = 'paid';
create unique index orders_set_number_paid on orders (set_slug, set_number) where status = 'paid';

create table waitlist (
  id uuid primary key default gen_random_uuid(),
  contact text not null unique, -- normalised: lower-case email or digits-only phone
  source text,
  created_at timestamptz not null default now()
);

alter table orders enable row level security;
alter table waitlist enable row level security;
-- No policies: only the server (service role) touches these tables.

-- The only public window onto orders. Never exposes phone, email, address or surname.
create view register_public as
  select register_number,
         case when show_in_register then register_name end as display_name,
         set_slug,
         set_number,
         case when show_city then city end as city
  from orders
  where status = 'paid';

grant select on register_public to anon, authenticated;

-- Called by the webhook only. Idempotent; never oversells; reuses places freed by refunds.
create or replace function mark_order_paid(p_gateway_order_id text, p_payment_id text, p_run_size integer)
returns jsonb language plpgsql as $$
declare o orders;
begin
  perform pg_advisory_xact_lock(7106); -- one paid-marking at a time; volume is tiny
  select * into o from orders where gateway_order_id = p_gateway_order_id for update;
  if not found then return null; end if;
  if o.status <> 'created' then return to_jsonb(o) || '{"fresh": false}'; end if; -- webhook retry

  if (select count(*) from orders where set_slug = o.set_slug and status = 'paid') >= p_run_size then
    update orders set status = 'refund_due', gateway_payment_id = p_payment_id where id = o.id returning * into o;
    return to_jsonb(o) || '{"fresh": true}';
  end if;

  update orders set
    status = 'paid',
    gateway_payment_id = p_payment_id,
    register_number = (select min(n) from generate_series(1, 1000) n
                       where n not in (select register_number from orders where status = 'paid' and register_number is not null)),
    set_number = (select min(n) from generate_series(1, p_run_size) n
                  where n not in (select set_number from orders where status = 'paid' and set_slug = o.set_slug and set_number is not null))
  where id = o.id returning * into o;
  return to_jsonb(o) || '{"fresh": true}';
end $$;

create or replace function mark_order_refunded(p_payment_id text)
returns void language sql as $$
  update orders set status = 'refunded' where gateway_payment_id = p_payment_id;
$$;

revoke execute on function mark_order_paid, mark_order_refunded from public, anon, authenticated;
