export default class EmptyState {
    constructor(options = {}) {
        this.options = {
            title: options.title || 'Nenhum item encontrado',
            description: options.description || 'Não há itens para exibir no momento.',
            icon: options.icon || 'fa-clipboard-list',
            buttonText: options.buttonText || '',
            buttonIcon: options.buttonIcon || 'fa-plus',
            onClick: options.onClick || (() => {}),
            customClass: options.customClass || '',
            showButton: options.showButton !== undefined ? options.showButton : true,
            iconColor: options.iconColor || 'blue'
        };
    }

    create() {
        const container = document.createElement('div');
        container.className = `flex flex-col items-center justify-center py-16 text-center ${this.options.customClass}`;
        
        container.innerHTML = `
            <div class="w-32 h-32 mb-8 rounded-2xl bg-gradient-to-br from-${this.options.iconColor}-100 to-${this.options.iconColor}-200 dark:from-${this.options.iconColor}-900 dark:to-${this.options.iconColor}-800 flex items-center justify-center shadow-xl shadow-${this.options.iconColor}-100 dark:shadow-${this.options.iconColor}-900/30 animate-pulse-soft">
                <i class="fas ${this.options.icon} text-5xl text-${this.options.iconColor}-600 dark:text-${this.options.iconColor}-400"></i>
            </div>
            <h2 class="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-3 bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-100 dark:to-gray-300 text-transparent bg-clip-text">
                ${this.options.title}
            </h2>
            <p class="text-gray-600 dark:text-gray-400 mb-8 text-lg">
                ${this.options.description}
            </p>
            ${this.options.showButton ? `
                <button class="px-8 py-4 bg-gradient-to-r from-${this.options.iconColor}-600 to-${this.options.iconColor}-700 dark:from-${this.options.iconColor}-700 dark:to-${this.options.iconColor}-800 text-white rounded-xl hover:shadow-lg dark:hover:shadow-${this.options.iconColor}-900/30 hover:scale-[1.02] transition-all duration-300 shadow-md dark:shadow-${this.options.iconColor}-900/20 flex items-center gap-3 group">
                    <div class="w-8 h-8 bg-white/20 dark:bg-black/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                        <i class="fas ${this.options.buttonIcon} transform group-hover:rotate-90 transition-transform duration-300"></i>
                    </div>
                    <span class="text-lg">${this.options.buttonText}</span>
                </button>
            ` : ''}
        `;

        if (this.options.showButton) {
            const button = container.querySelector('button');
            button.addEventListener('click', this.options.onClick);
        }

        return container;
    }
}