export default class Modal {
    constructor(options = {}) {
        this.options = {
            title: options.title || '',
            content: options.content || '',
            onConfirm: options.onConfirm || (() => {}),
            onCancel: options.onCancel || (() => {}),
            confirmText: options.confirmText || 'Confirmar',
            cancelText: options.cancelText || 'Cancelar',
            width: options.width || 'md',
            showCancelButton: options.showCancelButton !== undefined ? options.showCancelButton : true,
            customClass: options.customClass || '',
            isForm: options.isForm || false
        };
        this.modalElement = null;
    }

    create() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50';
        
        const modalContent = document.createElement(this.options.isForm ? 'form' : 'div');
        modalContent.className = `
            bg-white rounded-xl shadow-2xl p-8 
            ${this.options.width === 'md' ? 'max-w-md' : 'max-w-lg'} 
            w-full transform transition-all duration-300 
            scale-95 opacity-0 
            ${this.options.customClass}
        `;
        
        modalContent.innerHTML = `
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    ${this.options.title}
                </h2>
                <button type="button" class="close-modal p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                    <i class="fas fa-times text-gray-500"></i>
                </button>
            </div>
            <div class="mb-6">${this.options.content}</div>
            <div class="flex gap-4">
                <button type="${this.options.isForm ? 'submit' : 'button'}" class="confirm-button flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2">
                    <i class="fas fa-check"></i>
                    ${this.options.confirmText}
                </button>
                ${this.options.showCancelButton ? `
                    <button type="button" class="cancel-button flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-300 flex items-center justify-center gap-2">
                        <i class="fas fa-times"></i>
                        ${this.options.cancelText}
                    </button>
                ` : ''}
            </div>
        `;

        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        // Animações
        requestAnimationFrame(() => {
            modalContent.classList.replace('scale-95', 'scale-100');
            modalContent.classList.replace('opacity-0', 'opacity-100');
        });

        // Event Listeners
        const closeModal = () => this.close();
        
        modalContent.querySelector('.close-modal').addEventListener('click', closeModal);
        modalContent.querySelector('.cancel-button')?.addEventListener('click', () => {
            this.close();
            this.options.onCancel();
        });

        if (this.options.isForm) {
            modalContent.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.options.onConfirm(e);
            });
        } else {
            modalContent.querySelector('.confirm-button').addEventListener('click', async () => {
                await this.options.onConfirm();
            });
        }

        // Fechar no ESC
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleEsc);
            }
        };
        document.addEventListener('keydown', handleEsc);

        // Fechar no click fora
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        this.modalElement = modal;
        return modal;
    }

    close() {
        if (!this.modalElement) return;
        
        const modalContent = this.modalElement.firstElementChild;
        modalContent.classList.replace('scale-100', 'scale-95');
        modalContent.classList.replace('opacity-100', 'opacity-0');
        
        setTimeout(() => {
            this.modalElement.remove();
            this.modalElement = null;
        }, 300);
    }
}
