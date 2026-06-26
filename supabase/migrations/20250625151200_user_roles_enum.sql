-- transaction: false
-- Enum renames + new value must commit before 'user' can be used as a default.

alter type public.user_role rename value 'doctora' to 'doctor';
alter type public.user_role rename value 'recepcion' to 'receptionist';
alter type public.user_role add value if not exists 'user';
