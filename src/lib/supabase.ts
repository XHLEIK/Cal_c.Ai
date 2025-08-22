import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://juqnsahnnzantljcmbse.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1cW5zYWhubnphbnRsamNtYnNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0OTkzNzQsImV4cCI6MjA2MTA3NTM3NH0.d8poQ11RRchbVPxM5igqzdi0jvewtdkMq_lNNrQLVwo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
