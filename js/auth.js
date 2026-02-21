// Authentication Module

let isSignUp = false;
let currentUser = null;
let supabase;

// Initialize when Supabase is ready
window.supabaseReady.then((sb) => {
    supabase = sb;
    initializeAuth();
});

function initializeAuth() {
    // Get all DOM elements first
    const landingSection = document.getElementById('landing-section');
    const authSection = document.getElementById('auth-section');
    const appSection = document.getElementById('app-section');
    const authForm = document.getElementById('auth-form');
    const authBtn = document.getElementById('auth-btn');
    const authToggleLink = document.getElementById('auth-toggle-link');
    const authToggleText = document.getElementById('auth-toggle-text');
    const signupFields = document.getElementById('signup-fields');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const fullNameInput = document.getElementById('full-name');
    const signoutBtn = document.getElementById('signout-btn');

    // Hide landing page and show auth
    if (landingSection) {
        landingSection.style.display = 'none';
    }
    if (authSection) {
        authSection.style.display = 'flex';
    }

    // Show auth section
    function showAuth() {
        if (authSection) authSection.style.display = 'flex';
        if (appSection) appSection.style.display = 'none';
    }

    // Show app (dashboard)
    function showApp() {
        if (landingSection) landingSection.style.display = 'none';
        if (authSection) authSection.style.display = 'none';
        if (appSection) appSection.style.display = 'block';
        if (typeof loadHabits === 'function') {
            loadHabits();
        }
    }

    // Toggle between Sign In and Sign Up
    if (authToggleLink) {
        authToggleLink.addEventListener('click', function(e) {
            e.preventDefault();
            isSignUp = !isSignUp;
            
            if (isSignUp) {
                authToggleText.textContent = 'Already have an account?';
                authToggleLink.textContent = 'Sign In';
                authBtn.textContent = 'Sign Up';
                signupFields.style.display = 'block';
            } else {
                authToggleText.textContent = "Don't have an account?";
                authToggleLink.textContent = 'Sign Up';
                authBtn.textContent = 'Sign In';
                signupFields.style.display = 'none';
            }
        });
    }

    // Handle Auth Form Submit
    if (authForm) {
        authForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = emailInput.value;
            const password = passwordInput.value;
            
            authBtn.disabled = true;
            authBtn.textContent = 'Loading...';
            
            if (isSignUp) {
                // Sign Up
                const fullName = fullNameInput.value;
                supabase.auth.signUp({
                    email: email,
                    password: password,
                    options: {
                        data: {
                            full_name: fullName
                        }
                    }
                }).then(({ data, error }) => {
                    authBtn.disabled = false;
                    authBtn.textContent = 'Sign Up';
                    
                    if (error) {
                        alert(error.message);
                    } else {
                        alert('Check your email for confirmation link!');
                    }
                });
            } else {
                // Sign In
                supabase.auth.signInWithPassword({
                    email: email,
                    password: password
                }).then(({ data, error }) => {
                    authBtn.disabled = false;
                    authBtn.textContent = 'Sign In';
                    
                    if (error) {
                        alert(error.message);
                    } else {
                        currentUser = data.user;
                        window.currentUser = data.user;
                        showApp();
                    }
                });
            }
        });
    }

    // Sign Out
    if (signoutBtn) {
        signoutBtn.addEventListener('click', function() {
            supabase.auth.signOut().then(() => {
                currentUser = null;
                window.currentUser = null;
                showAuth();
            }).catch((error) => {
                alert(error.message);
            });
        });
    }

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
            currentUser = session.user;
            window.currentUser = session.user;
            showApp();
        }
    });

    // Listen for auth changes
    supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT') {
            currentUser = null;
            window.currentUser = null;
            showAuth();
        } else if (session) {
            currentUser = session.user;
            window.currentUser = session.user;
            showApp();
        }
    });
}
