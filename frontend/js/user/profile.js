document.addEventListener('DOMContentLoaded', () => {
    loadProfile();
});

async function loadProfile() {
    const session = JSON.parse(localStorage.getItem('gymbro_user'));
    if (!session || !session.user) return;

    // If Admin is viewing this page (which shouldn't happen based on role guard, but for safety)
    if (session.role === 'admin') {
        document.getElementById('profile-name').textContent = "Admin User";
        document.getElementById('profile-email').textContent = "admin@gymbro.com";
        return;
    }

    const userId = session.user.id;
    try {
        const res = await fetch(`${window.API}/customers/${userId}`);
        if (!res.ok) throw new Error('Failed to fetch profile');
        const user = await res.json();
        
        // Update UI
        setText('profile-name', user.fullName);
        setText('profile-email', user.email);
        setText('profile-phone', user.phone);
        setText('profile-type', user.memberType || 'Standard');
        setText('profile-level', user.memberLevel || 'Beginner');
        
        if (user.memberStartDate) {
            const since = new Date(user.memberStartDate).toLocaleDateString('th-TH', { dateStyle: 'long' });
            setText('profile-since', since);
        }
        
        if (user.memberEndDate) {
            const until = new Date(user.memberEndDate).toLocaleDateString('th-TH', { dateStyle: 'long' });
            setText('profile-until', until);
        } else {
             setText('profile-until', 'Lifetime / No Expiry');
        }

    } catch (error) {
        console.error('Error loading profile:', error);
        // Fallback to local storage if API fails
        const user = session.user;
        setText('profile-name', user.fullName);
        setText('profile-email', user.email);
        setText('profile-phone', user.phone);
    }
}

function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}
