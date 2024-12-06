class ThemeToggle {
    constructor() {
        this.button = null;
        this.init();
    }

    init() {
        this.button = document.createElement('button');
        this.button.id = 'theme-toggle';
        this.button.className = `
            relative p-2 rounded-xl 
            bg-white/10 dark:bg-gray-800/50 
            hover:bg-white/20 dark:hover:bg-gray-700/50 
            focus:outline-none focus:ring-2 focus:ring-blue-500/50
            transition-all duration-300 ease-out
            group overflow-hidden
        `;

        // Criar o ícone com animação
        this.button.innerHTML = `
            <div class="relative z-10 transform transition-transform duration-500 dark:rotate-180">
                <i class="fas fa-sun absolute inset-0 opacity-0 dark:opacity-100 transform transition-all duration-500 rotate-0 dark:rotate-0"></i>
                <i class="fas fa-moon opacity-100 dark:opacity-0 transform transition-all duration-500 rotate-0 dark:-rotate-180"></i>
            </div>
            <div class="absolute inset-0 bg-gradient-to-br from-yellow-300 to-yellow-500 dark:from-blue-400 dark:to-blue-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
        `;

        // Adicionar tooltip
        this.button.setAttribute('title', 'Alternar tema claro/escuro');
        this.button.setAttribute('aria-label', 'Alternar tema claro/escuro');

        // Adicionar efeito de ripple no clique
        this.button.addEventListener('click', (e) => this.createRippleEffect(e));

        return this.button;
    }

    createRippleEffect(event) {
        const button = event.currentTarget;
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            top: ${y}px;
            left: ${x}px;
            background-color: rgba(255, 255, 255, 0.4);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 600ms linear;
            pointer-events: none;
        `;

        button.appendChild(ripple);

        ripple.addEventListener('animationend', () => {
            ripple.remove();
        });
    }

    // Método para atualizar o estado do botão
    updateState(isDark) {
        if (isDark) {
            this.button.classList.add('is-dark');
        } else {
            this.button.classList.remove('is-dark');
        }
    }
}

// Adicionar estilos globais para a animação de ripple
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

export default ThemeToggle; 