import AnimationService from '../services/AnimationService.js';

export default class Task {
    constructor(options = {}) {
        this.options = {
            id: options.id,
            title: options.title || '',
            description: options.description || '',
            isActive: options.isActive !== undefined ? options.isActive : true,
            columnId: options.columnId,
            onEdit: options.onEdit || (() => {}),
            onDelete: options.onDelete || (() => {}),
            onStatusChange: options.onStatusChange || (() => {}),
            customClass: options.customClass || '',
            animationDelay: options.animationDelay || 0
        };
    }

    create() {
        const container = document.createElement('div');
        container.className = `bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-grab active:cursor-grabbing group task ${this.options.customClass}`;
        container.setAttribute('data-task-id', this.options.id);
        container.setAttribute('data-draggable', 'true');
        
        container.innerHTML = `
            <div class="flex items-center justify-between gap-4">
                <div class="flex items-center gap-4">
                    <button class="w-6 h-6 rounded-full border-2 border-gray-300 hover:border-green-500 transition-colors flex items-center justify-center ${this.options.isActive ? '' : 'bg-green-500 border-green-500'}"
                        title="${this.options.isActive ? 'Marcar como concluída' : 'Marcar como pendente'}">
                        ${!this.options.isActive ? '<i class="fas fa-check text-white text-xs"></i>' : ''}
                    </button>
                    <div class="flex flex-col">
                        <h3 class="font-medium ${this.options.isActive ? '' : 'line-through text-gray-400'}" title="${this.options.title}">
                            ${this.options.title.length > 30 ? this.options.title.substring(0, 30) + '...' : this.options.title}
                        </h3>
                        ${this.options.description ? `
                            <p class="text-sm text-gray-500 ${this.options.isActive ? '' : 'line-through'}">
                                ${this.options.description.length > 50 ? this.options.description.substring(0, 50) + '...' : this.options.description}
                            </p>
                        ` : ''}
                    </div>
                </div>
                <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button class="p-2 hover:bg-gray-100 rounded-full transition-colors duration-300" title="Editar">
                        <i class="fas fa-pencil text-gray-500 text-sm"></i>
                    </button>
                    <button class="p-2 hover:bg-red-50 rounded-full transition-colors duration-300" title="Excluir">
                        <i class="fas fa-trash text-red-500 text-sm"></i>
                    </button>
                </div>
            </div>
        `;

        // Adiciona animação de entrada
        if (this.options.animationDelay > 0) {
            container.style.opacity = '0';
            setTimeout(() => {
                container.style.opacity = '1';
                AnimationService.fadeIn(container);
            }, this.options.animationDelay * 1000);
        }

        // Event listeners
        const statusButton = container.querySelector('button[title*="Marcar"]');
        const editButton = container.querySelector('button[title="Editar"]');
        const deleteButton = container.querySelector('button[title="Excluir"]');

        statusButton.addEventListener('click', async (e) => {
            e.stopPropagation();
            
            // Adiciona animação ao botão
            statusButton.classList.add('scale-110');
            setTimeout(() => statusButton.classList.remove('scale-110'), 200);

            await this.options.onStatusChange(this.options.id, !this.options.isActive);
        });

        editButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.options.onEdit(this.options);
        });

        deleteButton.addEventListener('click', async (e) => {
            e.stopPropagation();
            
            // Adiciona animação de shake antes de excluir
            await AnimationService.shake(container);
            await this.options.onDelete(this.options.id);
        });

        return container;
    }

    addDragListeners(onDragStart, onDragEnd) {
        this.container.draggable = true;
        this.container.addEventListener('dragstart', onDragStart);
        this.container.addEventListener('dragend', onDragEnd);
    }
} 