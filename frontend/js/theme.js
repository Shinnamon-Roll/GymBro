// theme.js
function initTheme() {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        updateIcon(true);
    } else {
        document.documentElement.classList.remove('dark');
        updateIcon(false);
    }
}

function toggleTheme() {
    if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        localStorage.theme = 'light';
        updateIcon(false);
    } else {
        document.documentElement.classList.add('dark');
        localStorage.theme = 'dark';
        updateIcon(true);
    }
}

function updateIcon(isDark) {
    const icon = document.getElementById('theme-icon');
    if (icon) {
        if (isDark) {
            icon.setAttribute('data-lucide', 'sun');
        } else {
            icon.setAttribute('data-lucide', 'moon');
        }
        if (window.lucide) lucide.createIcons();
    }
}

// Initialize theme on load
initTheme();
