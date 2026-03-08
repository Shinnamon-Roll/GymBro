document.addEventListener('DOMContentLoaded', () => {
    loadProfile();
});

async function loadProfile() {
    const session = JSON.parse(localStorage.getItem('gymbro_user'));
    if (!session || !session.user) return;

    // If Admin is viewing this page
    if (session.role === 'admin') {
        setTextByClass('user-name-display', "Admin User");
        setTextByClass('user-email-display', "admin@gymbro.com");
        return;
    }

    const userId = session.user.id;
    try {
        const res = await fetch(`${window.API}/customers/${userId}`);
        if (!res.ok) throw new Error('Failed to fetch profile');
        const user = await res.json();
        
        // Update UI
        updateProfileUI(user);

    } catch (error) {
        console.error('Error loading profile:', error);
        // Fallback to local storage if API fails
        const user = session.user;
        updateProfileUI(user);
    }
}

function updateProfileUI(user) {
    setTextByClass('user-name-display', user.fullName);
    setTextByClass('user-email-display', user.email);
    setTextByClass('user-phone-display', user.phone);
    setTextByClass('user-type-display', user.memberType || 'Standard');
    setTextByClass('user-level-display', user.memberLevel || 'Beginner');
    setTextByClass('user-id-display', `#${String(user.id).padStart(3, '0')}`);
    
    if (user.memberStartDate) {
        const since = new Date(user.memberStartDate).toLocaleDateString('th-TH', { dateStyle: 'long' });
        setTextByClass('user-start-display', since);
    } else {
        setTextByClass('user-start-display', '-');
    }
    
    if (user.memberEndDate) {
        const until = new Date(user.memberEndDate).toLocaleDateString('th-TH', { dateStyle: 'long' });
        setTextByClass('user-end-display', until);
    } else {
         setTextByClass('user-end-display', 'Lifetime / No Expiry');
    }
}

function setTextByClass(className, text) {
    const elements = document.querySelectorAll(`.${className}`);
    elements.forEach(el => {
        el.textContent = text;
    });
}
