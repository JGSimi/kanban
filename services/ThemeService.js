import requests from '../request.js';

class ThemeService {
    constructor() {
        this.darkMode = false;
        this.init();
    }

    init() {
        const savedTheme = localStorage.getItem('theme');
        const userPreference = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        this.darkMode = savedTheme ? savedTheme === 'dark' : userPreference;
        this.applyTheme(false);
    }

    async applyTheme(syncWithApi = true) {
        const html = document.documentElement;
        
        if (this.darkMode) {
            html.classList.add('dark');
        } else {
            html.classList.remove('dark');
        }

        localStorage.setItem('theme', this.darkMode ? 'dark' : 'light');

        if (syncWithApi) {
            const user = JSON.parse(localStorage.getItem('user'));
            if (user?.Id) {
                try {
                    const themeId = this.darkMode ? 1 : 0;
                    await requests.ConfigPersonTheme(parseInt(user.Id), themeId);
                } catch (error) {
                    console.error('Erro ao salvar tema:', error);
                }
            }
        }
    }

    async toggle() {
        this.darkMode = !this.darkMode;
        await this.applyTheme(true);
    }

    async loadUserPreference(userId) {
        try {
            const config = await requests.GetPersonConfig(parseInt(userId));
            if (config?.DefaultThemeId !== undefined) {
                this.darkMode = config.DefaultThemeId === 1;
                await this.applyTheme(false);
            }
        } catch (error) {
            console.error('Erro ao carregar preferência de tema:', error);
        }
    }
}

export default new ThemeService();
