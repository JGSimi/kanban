import AnimationService from '../services/AnimationService.js';
import Task from './Task.js';
import EmptyState from './EmptyState.js';

export default class Column {
    constructor(options = {}) {
        this.options = {
            id: options.id,
            name: options.name || '',
            onAddTask: options.onAddTask || (() => {}),
            onEditColumn: options.onEditColumn || (() => {}),
            onDeleteColumn: options.onDeleteColumn || (() => {}),
            onMoveTask: options.onMoveTask || (() => {}),
            customClass: options.customClass || '',
            animationDelay: options.animationDelay || 0,
            color: options.color || 'blue',
            icon: options.icon || 'fa-list',
            showTaskCount: options.showTaskCount !== undefined ? options.showTaskCount : true,
            collapsible: options.collapsible !== undefined ? options.collapsible : true,
            collapsed: options.collapsed || false,
            maxHeight: options.maxHeight || '70vh'
        };

        this.container = null;
        this.tasksContainer = null;
        this.isCollapsed = this.options.collapsed;
        this.taskCount = 0;
    }

    create() {
        this.container = document.createElement('div');
        this.container.className = `flex-shrink-0 w-80 bg-gray-50 rounded-xl shadow-md overflow-hidden ${this.options.customClass}`;
        this.container.setAttribute('data-dropzone', 'true');
        this.container.setAttribute('data-column-id', this.options.id);
        
        this.container.innerHTML = `
            <div class="p-4 bg-white border-b border-gray-200">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3 flex-1 min-w-0">
                        <div class="w-8 h-8 rounded-lg bg-${this.options.color}-100 flex items-center justify-center">
                            <i class="fas ${this.options.icon} text-${this.options.color}-600"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <h3 class="font-semibold text-gray-800 truncate" title="${this.options.name}">
                                ${this.options.name}
                            </h3>
                            ${this.options.showTaskCount ? `
                                <div class="text-sm text-gray-500 task-count">
                                    <span class="count">0</span> tarefas
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    <div class="flex items-center gap-1">
                        ${this.options.collapsible ? `
                            <button class="collapse-button p-1.5 hover:bg-gray-100 rounded-lg transition-colors duration-300 group" title="${this.isCollapsed ? 'Expandir' : 'Recolher'}">
                                <i class="fas fa-chevron-${this.isCollapsed ? 'down' : 'up'} text-gray-500 text-sm transform transition-transform duration-300"></i>
                            </button>
                        ` : ''}
                        <button class="edit-button p-1.5 hover:bg-gray-100 rounded-lg transition-colors duration-300 group" title="Editar coluna">
                            <i class="fas fa-pencil text-gray-500 text-sm group-hover:rotate-12 transition-transform duration-300"></i>
                        </button>
                        <button class="delete-button p-1.5 hover:bg-red-50 rounded-lg transition-colors duration-300 group" title="Excluir coluna">
                            <i class="fas fa-trash text-red-500 text-sm group-hover:rotate-12 transition-transform duration-300"></i>
                        </button>
                    </div>
                </div>
            </div>
            <div class="column-content transition-all duration-300" style="max-height: ${this.options.maxHeight};">
                <div class="tasks-container min-h-[100px] p-4 space-y-3 overflow-y-auto" data-column-id="${this.options.id}">
                    <div class="flex items-center justify-center h-24 text-gray-400">
                        <i class="fas fa-spinner fa-spin"></i>
                    </div>
                </div>
                <div class="p-4 pt-0">
                    <button class="add-task-button w-full p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 group hover:shadow-md">
                        <i class="fas fa-plus transform group-hover:rotate-90 transition-transform duration-300"></i>
                        <span>Adicionar Tarefa</span>
                    </button>
                </div>
            </div>
        `;

        // Adiciona animação de entrada
        if (this.options.animationDelay > 0) {
            AnimationService.slideUp(this.container, this.options.animationDelay);
        }

        // Event listeners
        this.setupEventListeners();

        // Atualiza estado inicial
        this.updateCollapsedState();

        return this.container;
    }

    setupEventListeners() {
        const addTaskButton = this.container.querySelector('.add-task-button');
        const editButton = this.container.querySelector('.edit-button');
        const deleteButton = this.container.querySelector('.delete-button');
        const collapseButton = this.container.querySelector('.collapse-button');

        addTaskButton.addEventListener('click', () => this.options.onAddTask(this.options.id));
        editButton.addEventListener('click', () => this.options.onEditColumn(this.options));
        deleteButton.addEventListener('click', async () => {
            // Anima o botão antes de excluir
            const icon = deleteButton.querySelector('i');
            icon.classList.add('rotate-180');
            await new Promise(resolve => setTimeout(resolve, 300));
            this.options.onDeleteColumn(this.options.id);
        });

        if (collapseButton) {
            collapseButton.addEventListener('click', () => this.toggleCollapse());
        }

        // Hover effect na coluna
        this.container.addEventListener('mouseenter', () => {
            AnimationService.addHoverEffect(this.container, 1.01);
        });
    }

    async renderTasks(tasks = []) {
        this.tasksContainer = this.container.querySelector('.tasks-container');
        this.tasksContainer.innerHTML = '';
        this.taskCount = tasks.length;

        if (!tasks || tasks.length === 0) {
            const emptyState = new EmptyState({
                title: 'Nenhuma tarefa',
                description: 'Adicione uma nova tarefa para começar',
                icon: 'fa-tasks',
                iconColor: this.options.color,
                showButton: false,
                customClass: 'py-8'
            });

            this.tasksContainer.appendChild(emptyState.create());
            this.updateTaskCount(0);
            return;
        }

        // Atualiza contador de tarefas
        this.updateTaskCount(tasks.length);

        // Renderiza as tasks
        tasks.forEach((taskData, index) => {
            const task = new Task({
                id: taskData.Id,
                title: taskData.Title,
                description: taskData.Description,
                isActive: taskData.IsActive,
                columnId: this.options.id,
                onEdit: this.options.onEditTask,
                onDelete: this.options.onDeleteTask,
                onStatusChange: this.options.onStatusChange,
                animationDelay: index * 0.05,
                color: this.options.color
            });

            this.tasksContainer.appendChild(task.create());
        });
    }

    toggleCollapse() {
        if (!this.options.collapsible) return;

        this.isCollapsed = !this.isCollapsed;
        this.updateCollapsedState();

        // Anima o ícone
        const icon = this.container.querySelector('.collapse-button i');
        icon.classList.remove('fa-chevron-up', 'fa-chevron-down');
        icon.classList.add(this.isCollapsed ? 'fa-chevron-down' : 'fa-chevron-up');

        // Atualiza o título do botão
        const button = this.container.querySelector('.collapse-button');
        button.title = this.isCollapsed ? 'Expandir' : 'Recolher';
    }

    updateCollapsedState() {
        const content = this.container.querySelector('.column-content');
        if (this.isCollapsed) {
            content.style.maxHeight = '0';
            content.style.opacity = '0';
            content.style.padding = '0';
        } else {
            content.style.maxHeight = this.options.maxHeight;
            content.style.opacity = '1';
            content.style.padding = '';
        }
    }

    updateTaskCount(count) {
        if (!this.options.showTaskCount) return;
        
        const countElement = this.container.querySelector('.task-count .count');
        if (countElement) {
            // Anima a mudança do número
            const currentCount = parseInt(countElement.textContent);
            if (currentCount !== count) {
                countElement.style.transform = 'translateY(-10px)';
                countElement.style.opacity = '0';
                
                setTimeout(() => {
                    countElement.textContent = count;
                    countElement.style.transform = 'translateY(0)';
                    countElement.style.opacity = '1';
                }, 200);
            }
        }
    }

    shake() {
        AnimationService.shake(this.container);
    }
} 