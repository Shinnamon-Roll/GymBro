// Auth Logic

// Check if we are on the login page
const isLoginPage = window.location.pathname === '/login' || window.location.pathname === '/';

// Auth Guard
if (!isLoginPage) {
    const session = JSON.parse(localStorage.getItem('gymbro_user'));
    
    if (!session || !session.user) {
        window.location.href = '/login';
    } else {
        // Role Guard
        const path = window.location.pathname;
        const role = session.role;

        if (path.startsWith('/admin') && role !== 'admin') {
            alert('Access Denied: Admin only.');
            window.location.href = '/user/dashboard';
        } 
        
        // Prevent logged-in users from going back to login (optional, but good UX)
        // Handled by logic below if we were on login page
    }
} else {
    // If on login page and already logged in, redirect
    const session = JSON.parse(localStorage.getItem('gymbro_user'));
    if (session && session.user) {
        if (session.role === 'admin') {
            window.location.href = '/admin/dashboard';
        } else {
            window.location.href = '/user/dashboard';
        }
    }
}

// Login Form Handling
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const emailVal = document.getElementById('email').value;
        const phoneVal = document.getElementById('phone').value; // Password

        // Hide error
        const errorMsg = document.getElementById('error-message');
        if (errorMsg) errorMsg.classList.add('hidden');

        try {
            const response = await fetch(`${window.API}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailVal, phone: phoneVal })
            });

            if (!response.ok) {
                throw new Error('Login failed');
            }

            const data = await response.json();
            localStorage.setItem('gymbro_user', JSON.stringify(data));

            // Redirect based on role
            if (data.role === 'admin') {
                window.location.href = '/admin/dashboard';
            } else {
                window.location.href = '/user/dashboard';
            }

        } catch (error) {
            console.error('Login Error:', error);
            if (errorMsg) {
                errorMsg.classList.remove('hidden');
                errorMsg.innerText = 'Invalid email or phone number.';
            }
        }
    });
}

// Logout Function (Global)
window.logout = function() {
    if (confirm('Are you sure you want to log out?')) {
        localStorage.removeItem('gymbro_user');
        window.location.href = '/login';
    }
};

// UI Helper: Display User Info
function displayUserInfo() {
    const session = JSON.parse(localStorage.getItem('gymbro_user'));
    if (session && session.user) {
        const userNameElements = document.querySelectorAll('.user-name-display');
        userNameElements.forEach(el => {
            el.textContent = session.user.fullName || session.user.email;
        });
        
        const userRoleElements = document.querySelectorAll('.user-role-display');
        userRoleElements.forEach(el => {
            el.textContent = session.role.toUpperCase();
        });
    }
}

// Call display info on load
document.addEventListener('DOMContentLoaded', displayUserInfo);
