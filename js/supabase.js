// Supabase Client Configuration
const SUPABASE_URL = 'https://zvunelnrjjqtvrdcsmcs.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2dW5lbG5yampxdHZyZGNzbWNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2ODMyNjksImV4cCI6MjA4NzI1OTI2OX0.KwTfPKUEiaR6NAaSjI-XvD_bNZutL7lwP06x6kZpUcI';

// Create a promise that resolves when supabase is ready
window.supabaseReady = new Promise((resolve) => {
    function initSupabase() {
        if (window.supabase && window.supabase.createClient) {
            window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            console.log('Supabase client initialized');
            resolve(window.supabase);
        } else {
            // Retry after a short delay
            setTimeout(initSupabase, 100);
        }
    }
    initSupabase();
});
