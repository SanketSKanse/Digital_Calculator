let currentExpression = '';
        let history = JSON.parse(localStorage.getItem('calcHistory')) || [];
        let theme = localStorage.getItem('calcTheme') || 'dark';

        document.addEventListener('DOMContentLoaded', function() {
            applyTheme();
            updateDisplay();
            renderHistory();
        });

        // Theme management
        function toggleTheme() {
            theme = theme === 'dark' ? 'light' : 'dark';
            localStorage.setItem('calcTheme', theme);
            applyTheme();
        }

        function applyTheme() {
            document.body.setAttribute('data-theme', theme);
            const toggleBtn = document.querySelector('.theme-toggle');
            toggleBtn.textContent = theme === 'dark' ? '☀️ Light' : '🌙 Dark';
        }