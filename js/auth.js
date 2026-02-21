// Authentication Module

let isSignUp = false;
let currentUser = null;

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

// Landing page elements
const getStartedBtn = document.getElementById('get-started-btn');
const landingSignupBtn = document.getElementById('landing-signup-btn');

// Show auth section from landing
function showAuth() {
    if (landingSection) landingSection.classList.add('hidden');
    authSection.style.display = 'flex';
}

// Handle landing page buttons
if (getStartedBtn) {
    getStartedBtn.addEventListener('click', showAuth);
}

if (landingSignupBtn) {
    landingSignupBtn.addEventListener('click', () => {
        showAuth();
        // Automatically switch to signup mode
        isSignUp = true;
        authToggleText.textContent = 'Already have an account?';
        authToggleLink.textContent = 'Sign In';
        authBtn.textContent = 'Sign Up';
        signupFields.style.display = 'block';
    });
}

// Toggle between Sign In and Sign Up
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

// Handle Auth Submit
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
            showApp();
        }
    } catch (error) {
        alert(error.message);
    } finally {
        authBtn.disabled = false;
        authBtn.textContent = isSignUp ? 'Sign Up' : 'Sign In';
    }
});

// Sign Out
signoutBtn.addEventListener('click', async () => {
    try {
        await supabase.auth.signOut();
        currentUser = null;
        showAuth();
    } catch (error) {
        alert(error.message);
    }
});

// Check Session on Load
async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
        currentUser = session.user;
        showApp();
    }
}

// Show/Hide Sections
function showAuth() {
    if (landingSection) landingSection.classList.add('hidden');
    authSection.style.display = 'flex';
    appSection.style.display = 'none';
}

function showApp() {
    if (landingSection) landingSection.classList.add('hidden');
    authSection.style.display = 'none';
    appSection.style.display = 'block';
    loadHabits();
}

// Initialize
checkSession();

// Listen for auth changes
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
        currentUser = null;
        showAuth();
    } else if (session) {
        currentUser = session.user;
        showApp();
    }
});
