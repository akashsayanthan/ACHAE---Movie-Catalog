import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://itasutpvggvqhjwpjiju.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0YXN1dHB2Z2d2cWhqd3BqaWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5OTUxNjksImV4cCI6MjA4ODU3MTE2OX0.5lMwubRoXfcSShg-jBO1tPTQpwy3xSfRhZP4UnJXPD4";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);