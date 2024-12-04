import AnimationService from '../services/AnimationService.js';

export default class Modal {
    constructor(options = {}) {
        this.options = {
            title: options.title || '',
            content: options.content || '',
            confirmText: options.confirmText || 'Confirmar',
            cancelText: options.cancelText || 'Cancelar',
            onConfirm: options.onConfirm || (() => {}),
            onCancel: options.onCancel || (() => {}),
            onOpen: options.onOpen || (() => {}),
            onClose: options.onClose || (() => {}),
            isForm: options.isForm || false,
            customClass: options.customClass || '',
            size: options.size || 'md', // sm, md, lg, xl, full
            showClose: options.showClose !== undefined ? options.showClose : true,
            closeOnEsc: options.closeOnEsc !== undefined ? options.closeOnEsc : true,
            closeOnClickOutside: options.closeOnClickOutside !== undefined ? options.closeOnClickOutside : true,
            showFooter: options.showFooter !== undefined ? options.showFooter : true,
            loading: options.loading || false,
            icon: options.icon || '',
            iconColor: options.iconColor || 'blue',
            preventClose: options.preventClose || false,
            position: options.position || 'center', // center, top, bottom
            animation: options.animation || 'scale' // scale, slide, fade
        };

        this.modalElement = null;
        this.isClosing = false;
    }

    create() {
        // Remove modal anterior se existir
        if (this.modalElement) {
            this.modalElement.remove();
        }

        // Cria o container do modal
        this.modalElement = document.createElement('div');
        this.modalElement.className = `fixed inset-0 z-50 ${this.getPositionClasses()}`;
        
        // Define o tamanho do modal
        const sizes = {
            sm: 'max-w-sm',
            md: 'max-w-lg',
            lg: 'max-w-2xl',
            xl: 'max-w-4xl',
            full: 'max-w-full mx-4'
        };

        // Cria o backdrop
        const backdrop = document.createElement('div');
        backdrop.className = 'absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300 opacity-0';
        this.modalElement.appendChild(backdrop);

        // Cria o conteúdo do modal
        const modalContent = document.createElement('div');
        modalContent.className = `
            relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl 
            ${sizes[this.options.size]} w-full mx-4 
            transform transition-all duration-300 
            ${this.getAnimationClasses()} 
            ${this.options.customClass}
        `;
        
        // Adiciona o HTML do modal
        modalContent.innerHTML = `
            <div class="p-6 sm:p-8">
                <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center gap-4">
                        ${this.options.icon ? `
                            <div class="w-12 h-12 rounded-xl bg-${this.options.iconColor}-100 dark:bg-${this.options.iconColor}-900 flex items-center justify-center">
                                <i class="fas ${this.options.icon} text-${this.options.iconColor}-600 dark:text-${this.options.iconColor}-400 text-xl"></i>
                            </div>
                        ` : ''}
                        <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-100">${this.options.title}</h2>
                    </div>
                    ${this.options.showClose ? `
                        <button class="close-button p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-300 group">
                            <i class="fas fa-times text-gray-500 dark:text-gray-400 group-hover:rotate-90 transition-transform duration-300"></i>
                        </button>
                    ` : ''}
                </div>

                ${this.options.isForm ? `<form class="space-y-6">` : ''}
                    <div class="modal-content">
                        ${this.options.content}
                    </div>
                    
                    ${this.options.showFooter ? `
                        <div class="flex gap-4 mt-8">
                            ${!this.options.preventClose ? `
                                <button type="button" class="cancel-button flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 flex items-center justify-center gap-2 group">
                                    <i class="fas fa-times text-sm group-hover:rotate-90 transition-transform duration-300"></i>
                                    ${this.options.cancelText}
                                </button>
                            ` : ''}
                            <button ${this.options.isForm ? 'type="submit"' : 'type="button"'} 
                                class="confirm-button flex-1 px-6 py-3 bg-${this.options.iconColor}-600 dark:bg-${this.options.iconColor}-700 text-white rounded-xl hover:bg-${this.options.iconColor}-700 dark:hover:bg-${this.options.iconColor}-800 transition-all duration-300 flex items-center justify-center gap-2 group">
                                <i class="fas fa-check text-sm group-hover:scale-110 transition-transform duration-300"></i>
                                ${this.options.confirmText}
                            </button>
                        </div>
                    ` : ''}
                ${this.options.isForm ? `</form>` : ''}

                ${this.options.loading ? `
                    <div class="loading-overlay absolute inset-0 bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-90 flex items-center justify-center rounded-2xl">
                        <div class="w-10 h-10 border-4 border-${this.options.iconColor}-600 dark:border-${this.options.iconColor}-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ` : ''}
            </div>
        `;

        this.modalElement.appendChild(modalContent);
        document.body.appendChild(this.modalElement);

        // Anima a entrada do modal
        requestAnimationFrame(() => {
            backdrop.classList.add('opacity-100');
            this.showModal(modalContent);
        });

        // Event listeners
        this.setupEventListeners(modalContent);

        // Callback de abertura
        this.options.onOpen(this);

        return this.modalElement;
    }

    setupEventListeners(modalContent) {
        const closeButton = modalContent.querySelector('.close-button');
        const cancelButton = modalContent.querySelector('.cancel-button');
        const confirmButton = modalContent.querySelector('.confirm-button');
        const form = this.options.isForm ? modalContent.querySelector('form') : null;

        if (closeButton) {
            closeButton.addEventListener('click', () => this.handleClose());
        }

        if (cancelButton) {
            cancelButton.addEventListener('click', () => this.handleClose());
        }

        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleConfirm(e);
            });
        } else if (confirmButton) {
            confirmButton.addEventListener('click', async () => {
                await this.handleConfirm();
            });
        }

        // Fecha o modal ao clicar fora
        if (this.options.closeOnClickOutside && !this.options.preventClose) {
            this.modalElement.addEventListener('click', (e) => {
                if (e.target === this.modalElement) {
                    this.handleClose();
                }
            });
        }

        // Fecha o modal com ESC
        if (this.options.closeOnEsc && !this.options.preventClose) {
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.modalElement && !this.isClosing) {
                    this.handleClose();
                }
            });
        }
    }

    async handleConfirm(event = null) {
        if (this.isClosing) return;
        
        try {
            this.setLoading(true);
            await this.options.onConfirm(event);
            await this.close();
        } catch (error) {
            console.error('Erro ao confirmar:', error);
            this.shake();
        } finally {
            this.setLoading(false);
        }
    }

    async handleClose() {
        if (this.isClosing || this.options.preventClose) return;
        
        try {
            await this.options.onCancel();
            await this.close();
        } catch (error) {
            console.error('Erro ao fechar:', error);
            this.shake();
        }
    }

    getPositionClasses() {
        switch (this.options.position) {
            case 'top':
                return 'flex items-start justify-center pt-16';
            case 'bottom':
                return 'flex items-end justify-center pb-16';
            default:
                return 'flex items-center justify-center';
        }
    }

    getAnimationClasses() {
        switch (this.options.animation) {
            case 'slide':
                return this.options.position === 'bottom' ? 'translate-y-full opacity-0' : '-translate-y-full opacity-0';
            case 'fade':
                return 'opacity-0';
            default:
                return 'scale-95 opacity-0';
        }
    }

    showModal(modalContent) {
        const animations = {
            scale: { transform: 'scale(1)', opacity: '1' },
            slide: { transform: 'translateY(0)', opacity: '1' },
            fade: { opacity: '1' }
        };

        Object.assign(modalContent.style, animations[this.options.animation]);
    }

    hideModal(modalContent) {
        const animations = {
            scale: { transform: 'scale(0.95)', opacity: '0' },
            slide: { 
                transform: this.options.position === 'bottom' ? 'translateY(100%)' : 'translateY(-100%)',
                opacity: '0'
            },
            fade: { opacity: '0' }
        };

        Object.assign(modalContent.style, animations[this.options.animation]);
    }

    setLoading(loading) {
        if (!this.modalElement) return;

        const loadingOverlay = this.modalElement.querySelector('.loading-overlay');
        const form = this.modalElement.querySelector('form');
        const buttons = this.modalElement.querySelectorAll('button');

        if (loading) {
            if (!loadingOverlay) {
                const overlay = document.createElement('div');
                overlay.className = `loading-overlay absolute inset-0 bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-90 flex items-center justify-center rounded-2xl`;
                overlay.innerHTML = `
                    <div class="w-10 h-10 border-4 border-${this.options.iconColor}-600 dark:border-${this.options.iconColor}-400 border-t-transparent rounded-full animate-spin"></div>
                `;
                this.modalElement.querySelector('.modal-content').appendChild(overlay);
            }
            if (form) form.classList.add('pointer-events-none', 'opacity-50');
            buttons.forEach(button => button.disabled = true);
        } else {
            if (loadingOverlay) loadingOverlay.remove();
            if (form) form.classList.remove('pointer-events-none', 'opacity-50');
            buttons.forEach(button => button.disabled = false);
        }
    }

    shake() {
        if (!this.modalElement) return;
        const modalContent = this.modalElement.querySelector('div');
        AnimationService.shake(modalContent);
    }

    async close() {
        if (!this.modalElement || this.isClosing) return;
        
        this.isClosing = true;
        const backdrop = this.modalElement.querySelector('div');
        const modalContent = this.modalElement.querySelector('div:nth-child(2)');

        backdrop.classList.remove('opacity-100');
        this.hideModal(modalContent);

        await new Promise(resolve => setTimeout(resolve, 300));
        
        this.modalElement.remove();
        this.modalElement = null;
        this.isClosing = false;

        // Callback de fechamento
        this.options.onClose();
    }

    setContent(content) {
        if (!this.modalElement) return;
        const contentContainer = this.modalElement.querySelector('.modal-content');
        if (contentContainer) {
            contentContainer.innerHTML = content;
        }
    }

    setTitle(title) {
        if (!this.modalElement) return;
        const titleElement = this.modalElement.querySelector('h2');
        if (titleElement) {
            titleElement.textContent = title;
        }
    }
}
