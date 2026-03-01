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
    
    // Landing page buttons
    const headerLoginBtn = document.getElementById('header-login-btn');
    const headerSignupBtn = document.getElementById('header-signup-btn');
    const heroSignupBtn = document.getElementById('hero-signup-btn');
    const backHomeLink = document.getElementById('back-home-link');

    // Show landing page by default (home page)
    if (landingSection) {
        landingSection.style.display = 'block';
    }
    if (authSection) {
        authSection.style.display = 'none';
    }

    // Show landing page (home)
    function showLanding() {
        if (landingSection) landingSection.style.display = 'block';
        if (authSection) authSection.style.display = 'none';
        if (appSection) appSection.style.display = 'none';
    }

    // Show auth section
    function showAuth() {
        if (landingSection) landingSection.style.display = 'none';
        if (authSection) authSection.style.display = 'flex';
        if (appSection) appSection.style.display = 'none';
    }

    // Show landing page navigation
    if (headerLoginBtn) {
        headerLoginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            isSignUp = false;
            authToggleText.textContent = "Don't have an account?";
            authToggleLink.textContent = 'Sign Up';
            authBtn.textContent = 'Sign In';
            signupFields.style.display = 'none';
            showAuth();
        });
    }

    if (headerSignupBtn) {
        headerSignupBtn.addEventListener('click', function(e) {
            e.preventDefault();
            isSignUp = true;
            authToggleText.textContent = 'Already have an account?';
            authToggleLink.textContent = 'Sign In';
            authBtn.textContent = 'Sign Up';
            signupFields.style.display = 'block';
            showAuth();
        });
    }

    if (heroSignupBtn) {
        heroSignupBtn.addEventListener('click', function(e) {
            e.preventDefault();
            isSignUp = true;
            authToggleText.textContent = 'Already have an account?';
            authToggleLink.textContent = 'Sign In';
            authBtn.textContent = 'Sign Up';
            signupFields.style.display = 'block';
            showAuth();
        });
    }

    if (backHomeLink) {
        backHomeLink.addEventListener('click', function(e) {
            e.preventDefault();
            showLanding();
        });
    }

    // Watch Demo button - scroll to features
    const heroDemoBtn = document.getElementById('hero-demo-btn');
    if (heroDemoBtn) {
        heroDemoBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const featuresSection = document.getElementById('features');
            if (featuresSection) {
                featuresSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // Smooth scroll for navigation links
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navLinksContainer = document.querySelector('.nav-links');
    
    if (mobileMenuBtn && navLinksContainer) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinksContainer.classList.toggle('mobile-open');
        });
    }

    // Dark mode toggle for landing page
    const darkModeBtn = document.getElementById('dark-mode-btn');
    if (darkModeBtn) {
        darkModeBtn.addEventListener('click', function() {
            const isDark = document.body.getAttribute('data-theme') === 'dark';
            document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
            darkModeBtn.textContent = isDark ? '🌙' : '☀️';
        });
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
                showLanding();
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
        // If no session, show landing page (home)
    });

    // Listen for auth changes
    supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT') {
            currentUser = null;
            window.currentUser = null;
            showLanding();
        } else if (session) {
            currentUser = session.user;
            window.currentUser = session.user;
            showApp();
        }
    });
}
