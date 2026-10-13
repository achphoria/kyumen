// Klien Supabase untuk Kyuka Ramen Virtual (project ACHPHORIA).
// Anon key memang dirancang publik (dipakai di browser); keamanan data dijaga oleh aturan RLS
// di tabel hc_*. Jangan pernah menaruh service_role key di sini.
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ckoejqzownrujikefgwb.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrb2VqcXpvd25ydWppa2VmZ3diIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMjIwNjcsImV4cCI6MjA4NTc5ODA2N30.8XLaBH3g5sysO3Lvizs1NHYke4RQJvVQEZVExC4143I';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, storageKey: 'kyumen-colony-auth' },
});
