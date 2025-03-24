import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://fdszlnsmxgkfkhvechcx.supabase.co";
const supabaseAnonKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkc3psbnNteGdrZmtodmVjaGN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4NDExNDgsImV4cCI6MjA1ODQxNzE0OH0.sl1ENEHrWfAjkKz2zL8RuJO1iH60NnWasGupy542hnA";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
