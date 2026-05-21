-- for reference only, no need run
-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.daily_total_spends (
  spend_id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  date date NOT NULL,
  today_total_spend numeric DEFAULT 0 CHECK (today_total_spend >= 0::numeric),
  today_daily_limit numeric DEFAULT 0 CHECK (today_daily_limit >= 0::numeric),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT daily_total_spends_pkey PRIMARY KEY (spend_id),
  CONSTRAINT fk_daily_spends_user FOREIGN KEY (user_id) REFERENCES public.users(user_id)
);
CREATE TABLE public.lhdn_claims (
  claim_id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  transaction_id uuid NOT NULL,
  receipt_image_url text NOT NULL,
  receipt_date date NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT lhdn_claims_pkey PRIMARY KEY (claim_id),
  CONSTRAINT fk_claims_user FOREIGN KEY (user_id) REFERENCES public.users(user_id),
  CONSTRAINT fk_claims_transaction FOREIGN KEY (transaction_id) REFERENCES public.transactions(transaction_id)
);
CREATE TABLE public.notifications (
  notification_id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title character varying NOT NULL,
  message text NOT NULL,
  notification_type USER-DEFINED NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (notification_id),
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES public.users(user_id)
);
CREATE TABLE public.overspend_events (
  event_id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  transaction_id uuid NOT NULL,
  violated_pocket_id uuid NOT NULL,
  amount_needed numeric NOT NULL CHECK (amount_needed >= 0::numeric),
  fallback_pocket_id uuid,
  ai_intervention boolean DEFAULT false,
  ai_reason text,
  status USER-DEFINED NOT NULL,
  user_choice USER-DEFINED,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT overspend_events_pkey PRIMARY KEY (event_id),
  CONSTRAINT fk_overspend_user FOREIGN KEY (user_id) REFERENCES public.users(user_id),
  CONSTRAINT fk_overspend_transaction FOREIGN KEY (transaction_id) REFERENCES public.transactions(transaction_id),
  CONSTRAINT fk_overspend_violated_pocket FOREIGN KEY (violated_pocket_id) REFERENCES public.pockets(pocket_id),
  CONSTRAINT fk_overspend_fallback_pocket FOREIGN KEY (fallback_pocket_id) REFERENCES public.pockets(pocket_id)
);
CREATE TABLE public.pocket_transfers (
  transfer_id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  source_pocket_id uuid NOT NULL,
  destination_pocket_id uuid NOT NULL,
  amount numeric NOT NULL CHECK (amount >= 0::numeric),
  status USER-DEFINED NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT pocket_transfers_pkey PRIMARY KEY (transfer_id),
  CONSTRAINT fk_transfer_user FOREIGN KEY (user_id) REFERENCES public.users(user_id),
  CONSTRAINT fk_transfer_source_pocket FOREIGN KEY (source_pocket_id) REFERENCES public.pockets(pocket_id),
  CONSTRAINT fk_transfer_destination_pocket FOREIGN KEY (destination_pocket_id) REFERENCES public.pockets(pocket_id)
);
CREATE TABLE public.pockets (
  pocket_id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  pocket_name character varying NOT NULL,
  pocket_type USER-DEFINED NOT NULL,
  monthly_limit numeric NOT NULL CHECK (monthly_limit >= 0::numeric),
  current_pocket_balance numeric NOT NULL CHECK (current_pocket_balance >= 0::numeric),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT pockets_pkey PRIMARY KEY (pocket_id),
  CONSTRAINT fk_pockets_user FOREIGN KEY (user_id) REFERENCES public.users(user_id)
);
CREATE TABLE public.transactions (
  transaction_id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  pocket_id uuid NOT NULL,
  amount numeric NOT NULL CHECK (amount >= 0::numeric),
  transaction_type USER-DEFINED NOT NULL,
  counterparty_name character varying NOT NULL,
  reference character varying,
  status USER-DEFINED NOT NULL,
  is_tax_relief_detected boolean DEFAULT false,
  tax_relief_category character varying,
  triggers_warning boolean DEFAULT false,
  transaction_time timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT transactions_pkey PRIMARY KEY (transaction_id),
  CONSTRAINT fk_transactions_user FOREIGN KEY (user_id) REFERENCES public.users(user_id),
  CONSTRAINT fk_transactions_pocket FOREIGN KEY (pocket_id) REFERENCES public.pockets(pocket_id)
);
CREATE TABLE public.users (
  user_id uuid NOT NULL DEFAULT gen_random_uuid(),
  username character varying NOT NULL,
  email character varying,
  savings_mode USER-DEFINED NOT NULL,
  monthly_income numeric NOT NULL CHECK (monthly_income >= 0::numeric),
  payday integer DEFAULT 1 CHECK (payday >= 1 AND payday <= 31),
  main_balance numeric DEFAULT 0 CHECK (main_balance >= 0::numeric),
  current_streak integer DEFAULT 0 CHECK (current_streak >= 0),
  reward_points integer DEFAULT 0 CHECK (reward_points >= 0),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (user_id)
);