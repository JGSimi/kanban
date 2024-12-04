import AnimationService from '../services/AnimationService.js';

export default class Card {
    constructor(options = {}) {
        this.options = {
            title: options.title || '',
            description: options.description || '',
            backgroundColor: options.backgroundColor || '#4F46E5',
            icon: options.icon || 'fa-clipboard-list',
            onEdit: options.onEdit || (() => {}),
            onDelete: options.onDelete || (() => {}),
            onClick: options.onClick || (() => {}),
            customClass: options.customClass || '',
            animationDelay: options.animationDelay || 0,
            draggable: options.draggable || false
        };
    }

    create() {
        const container = document.createElement('div');
        container.className = `group relative rounded-2xl shadow-lg dark:shadow-gray-900 hover:shadow-xl dark:hover:shadow-gray-900/80 transition-all duration-300 transform overflow-hidden cursor-pointer ${this.options.customClass}`;
        
        if (this.options.draggable) {
            container.setAttribute('data-draggable', 'true');
        }

        // Converte a cor para um formato válido
        const baseColor = this.options.backgroundColor.startsWith('#') ? 
            this.options.backgroundColor : 
            '#' + this.options.backgroundColor;

        container.innerHTML = `
            <div class="relative h-full">
                <!-- Background com Gradiente -->
                <div class="absolute inset-0">
                    <div class="absolute inset-0 dark:opacity-90" style="background: linear-gradient(145deg, ${baseColor}, ${baseColor}99);"></div>
                    <div class="absolute inset-0 opacity-30 mix-blend-overlay dark:opacity-20" style="background-image: radial-gradient(circle at 50% 0%, white 0%, transparent 75%);"></div>
                </div>

                <!-- Conteúdo do Card -->
                <div class="relative p-6">
                    <!-- Cabeçalho -->
                    <div class="flex justify-between items-start mb-6">
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 bg-black/30 dark:bg-black/50 backdrop-blur-sm rounded-xl flex items-center justify-center transition-all duration-300 group-hover:rotate-6 shadow-lg dark:shadow-black/50 border border-white/20 dark:border-white/10" data-drag-handle>
                                <i class="fas ${this.options.icon} text-white text-xl"></i>
                            </div>
                            <div class="flex flex-col">
                                <h2 class="text-2xl font-bold text-white mb-1 truncate drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)] dark:drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                                    ${this.options.title}
                                </h2>
                                <p class="text-white text-sm line-clamp-2 drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)] dark:drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                                    ${this.options.description || 'Sem descrição'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Rodapé -->
                    <div class="flex justify-between items-center mt-6">
                        <!-- Botões de Ação -->
                        <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
                            <button class="p-2.5 bg-black/30 dark:bg-black/50 hover:bg-black/40 dark:hover:bg-black/60 backdrop-blur-sm rounded-xl transition-all duration-200 hover:scale-110 border border-white/20 dark:border-white/10 shadow-[0_2px_4px_rgba(0,0,0,0.2)] dark:shadow-[0_2px_4px_rgba(0,0,0,0.4)]" 
                                title="Editar">
                                <i class="fas fa-edit text-white"></i>
                            </button>
                            <button class="p-2.5 bg-black/30 dark:bg-black/50 hover:bg-red-500/40 dark:hover:bg-red-500/60 backdrop-blur-sm rounded-xl transition-all duration-200 hover:scale-110 border border-white/20 dark:border-white/10 shadow-[0_2px_4px_rgba(0,0,0,0.2)] dark:shadow-[0_2px_4px_rgba(0,0,0,0.4)]" 
                                title="Excluir">
                                <i class="fas fa-trash text-white"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Overlay de Hover -->
                <div class="absolute inset-0 bg-gradient-to-t from-black/40 dark:from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
        `;

        // Adiciona animações
        if (this.options.animationDelay > 0) {
            container.style.opacity = '0';
            setTimeout(() => {
                container.style.opacity = '1';
                AnimationService.slideUp(container);
            }, this.options.animationDelay * 1000);
        } else {
            AnimationService.slideUp(container);
        }

        // Adiciona efeitos de hover e click
        AnimationService.addHoverEffect(container);
        AnimationService.addClickEffect(container);

        // Event Delegation com Debounce
        let clickTimeout;
        container.addEventListener('click', (e) => {
            if (clickTimeout) {
                clearTimeout(clickTimeout);
            }
            
            clickTimeout = setTimeout(() => {
                const target = e.target;
                
                if (target.closest('button[title="Editar"]') || target.closest('button[title="Excluir"]')) {
                    e.stopPropagation();
                    const button = target.closest('button');
                    
                    if (button.title === 'Editar') {
                        this.options.onEdit();
                    } else if (button.title === 'Excluir') {
                        // Adiciona animação de shake antes de excluir
                        AnimationService.shake(container).onfinish = () => {
                            this.options.onDelete();
                        };
                    }
                    return;
                }

                this.options.onClick();
            }, 100);
        });

        return container;
    }
} 