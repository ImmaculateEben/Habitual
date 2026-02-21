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
    // DOM Elements
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

    // Website header elements
    const headerLoginBtn = document.getElementById('header-login-btn');
    const headerSignupBtn = document.getElementById('header-signup-btn');
    const heroSignupBtn = document.getElementById('hero-signup-btn');
    const heroDemoBtn = document.getElementById('hero-demo-btn');
    const backHomeLink = document.getElementById('back-home-link');

    // Show auth section from landing
    function showAuth() {
        if (landingSection) landingSection.classList.add('hidden');
        authSection.style.display = 'flex';
        appSection.style.display = 'none';
    }

    // Show landing/homepage
    function showLanding() {
        if (landingSection) landingSection.classList.remove('hidden');
        authSection.style.display = 'none';
        appSection.style.display = 'none';
    }

    // Show app
    function showApp() {
        if (landingSection) landingSection.classList.add('hidden');
        authSection.style.display = 'none';
        appSection.style.display = 'block';
        if (typeof loadHabits === 'function') {
            loadHabits();
        }
    }

    // Handle header buttons
    if (headerLoginBtn) {
        headerLoginBtn.addEventListener('click', showAuth);
    }

    if (headerSignupBtn) {
        headerSignupBtn.addEventListener('click', () => {
            showAuth();
            // Switch to signup mode
            isSignUp = true;
            authToggleText.textContent = 'Already have an account?';
            authToggleLink.textContent = 'Sign In';
            authBtn.textContent = 'Sign Up';
            signupFields.style.display = 'block';
        });
    }

    if (heroSignupBtn) {
        heroSignupBtn.addEventListener('click', () => {
            showAuth();
            // Switch to signup mode
            isSignUp = true;
            authToggleText.textContent = 'Already have an account?';
            authToggleLink.textContent = 'Sign In';
            authBtn.textContent = 'Sign Up';
            signupFields.style.display = 'block';
        });
    }

    if (heroDemoBtn) {
        heroDemoBtn.addEventListener('click', () => {
            alert('Demo video coming soon! In the meantime, sign up for a free account to try it out.');
        });
    }

    // Back to home link
    if (backHomeLink) {
        backHomeLink.addEventListener('click', (e) => {
            e.preventDefault();
            showLanding();
        });
    }

    // Toggle between Sign In and Sign Up
    if (authToggleLink) {
        authToggleLink.addEventListener('click', (e) => {
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

    // Handle Auth Submit
    if (authForm) {
        authForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = emailInput.value;
            const password = passwordInput.value;
            
            authBtn.disabled = true;
            authBtn.textContent = 'Loading...';
            
            try {
                if (isSignUp) {
                    const fullName = fullNameInput.value;
                    const { data, error } = await supabase.auth.signUp({
                        email,
                        password,
                        options: {
                            data: {
                                full_name: fullName
                            }
                        }
                    });
                    
                    if (error) throw error;
                    
                    alert('Check your email for confirmation link!');
                } else {
                    const { data, error } = await supabase.auth.signInWithPassword({
                        email,
                        password
                    });
                    
                    if (error) throw error;
                    
                    currentUser = data.user;
                    window.currentUser = data.user;
                    showApp();
                }
            } catch (error) {
                alert(error.message);
            } finally {
                authBtn.disabled = false;
                authBtn.textContent = isSignUp ? 'Sign Up' : 'Sign In';
            }
        });
    }

    // Sign Out
    if (signoutBtn) {
        signoutBtn.addEventListener('click', async () => {
            try {
                await supabase.auth.signOut();
                currentUser = null;
                window.currentUser = null;
                showLanding();
            } catch (error) {
                alert(error.message);
            }
        });
    }

    // Check Session on Load
    async function checkSession() {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            
            if (session) {
                currentUser = session.user;
                showApp();
            }
        } catch (error) {
            console.error('Error checking session:', error);
        }
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT') {
            currentUser = null;
            showLanding();
        } else if (session) {
            currentUser = session.user;
            showApp();
        }
    });

    // Check for existing session
    checkSession();
}

// Make currentUser available globally
window.getCurrentUser = function() {
    return currentUser;
};

// Also set on window for backward compatibility
window.currentUser = currentUser;

// Update window.currentUser when it changes
function updateCurrentUser(user) {
    currentUser = user;
    window.currentUser = user;
}
