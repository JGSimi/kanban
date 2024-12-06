import requests from '../request.js';
import ThemeToggle from '../components/ThemeToggle.js';

class ThemeService {
    constructor() {
        this.darkMode = document.documentElement.classList.contains('dark');
        this.themeTransitionClasses = ['transition-colors', 'duration-300'];
        this.themeToggle = new ThemeToggle();
        console.log('ThemeService construído - Estado inicial:', this.darkMode ? 'dark' : 'light');
    }

    init() {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const savedTheme = localStorage.getItem('theme');
        
        if (savedTheme) {
            this.darkMode = savedTheme === 'dark';
        } else {
            this.darkMode = prefersDark;
        }

        console.log('ThemeService init - Tema definido para:', this.darkMode ? 'dark' : 'light');

        this.applyTheme(false);

        window.matchMedia('(prefers-color-scheme: dark)')
            .addEventListener('change', e => this.handleSystemThemeChange(e));
            
        setTimeout(() => {
            document.documentElement.classList.add(...this.themeTransitionClasses);
        }, 100);

        const existingButton = document.getElementById('theme-toggle');
        if (existingButton) {
            existingButton.replaceWith(this.themeToggle.init());
        }

        this.themeToggle.button.addEventListener('click', () => this.toggle());

        return this;
    }

    async applyTheme(animate = true) {
        const html = document.documentElement;

        console.log('Aplicando tema:', this.darkMode ? 'dark' : 'light');

        if (animate && !html.classList.contains(this.themeTransitionClasses[0])) {
            html.classList.add(...this.themeTransitionClasses);
        }

        if (this.darkMode) {
            html.classList.add('dark');
        } else {
            html.classList.remove('dark');
        }

        this.themeToggle.updateState(this.darkMode);

        localStorage.setItem('theme', this.darkMode ? 'dark' : 'light');

        const user = JSON.parse(localStorage.getItem('user'));
        if (user?.Id) {
            try {
                const themes = await requests.GetThemes();
                const themeId = themes.find(t => t.Label === (this.darkMode ? 'dark' : 'light'))?.Id;
                
                if (themeId !== undefined) {
                    await requests.ConfigPersonTheme(parseInt(user.Id), {
                        ThemeId: themeId
                    });
                }
            } catch (error) {
                console.error('Erro ao salvar tema:', error);
            }
        }

        window.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { isDark: this.darkMode }
        }));

        console.log('Tema aplicado:', this.darkMode ? 'dark' : 'light');
    }

    async toggle() {
        console.log('Toggle tema - Estado anterior:', this.darkMode ? 'dark' : 'light');
        this.darkMode = !this.darkMode;
        await this.applyTheme(true);
        console.log('Toggle tema - Novo estado:', this.darkMode ? 'dark' : 'light');
    }

    async loadUserPreference(userId) {
        try {
            const config = await requests.GetPersonConfig(userId);
            if (config && config.DefaultThemeId !== undefined) {
                const themes = await requests.GetThemes();
                const theme = themes.find(t => t.Id === config.DefaultThemeId);
                this.darkMode = theme?.Label === 'dark';
                await this.applyTheme(true);
            }
        } catch (error) {
            console.error('Erro ao carregar preferência de tema:', error);
        }
    }

    handleSystemThemeChange(e) {
        if (!localStorage.getItem('theme')) {
            console.log('Mudança na preferência do sistema detectada:', e.matches ? 'dark' : 'light');
            this.darkMode = e.matches;
            this.applyTheme(true);
        }
    }
}

export default ThemeService;
