import requests from "./request.js";
import user from "./user.js";
import Modal from './components/Modal.js';
import Card from './components/Card.js';
import AnimationService from './services/AnimationService.js';

function backToBoardList() {
    window.location.href = 'index.html';
}

async function addNewBoard(name, color, description) {
    const userId = user.Id;
    if (!userId) {
        throw new Error('Usuário não autenticado');
    }

    await requests.CreateBoard({
        Name: name,
        Description: description || '',
        HexaBackgroundCoor: color,
        CreatedBy: parseInt(userId)
    });
}

function addNewBoardForm() {
    const modal = new Modal({
        title: 'Novo Quadro',
        icon: 'fa-clipboard-list',
        iconColor: 'blue',
        size: 'md',
        position: 'center',
        animation: 'scale',
        isForm: true,
        content: `
            <div class="space-y-6">
                <div class="space-y-2">
                    <label class="text-sm font-medium text-gray-700">Nome do Quadro</label>
                    <input id="name" type="text" 
                        class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
                        placeholder="Digite o nome do quadro" required>
                </div>
                <div class="space-y-2">
                    <label class="text-sm font-medium text-gray-700">Cor do Quadro</label>
                    <div class="flex gap-4 items-center">
                        <input id="color" type="color" 
                            class="w-16 h-16 rounded-xl cursor-pointer" 
                            value="#4F46E5">
                        <div class="flex-1 h-16 rounded-xl transition-all duration-300" id="color-preview" style="background: linear-gradient(145deg, #4F46E5, #4F46E599);"></div>
                    </div>
                </div>
                <div class="space-y-2">
                    <label class="text-sm font-medium text-gray-700">Descrição</label>
                    <textarea id="description" 
                        class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
                        placeholder="Descreva o propósito do quadro" 
                        rows="3"></textarea>
                </div>
            </div>
        `,
        confirmText: 'Criar Quadro',
        cancelText: 'Cancelar',
        onOpen: () => {
            // Atualiza preview da cor quando o input muda
            const colorInput = document.getElementById('color');
            const colorPreview = document.getElementById('color-preview');
            colorInput.addEventListener('input', (e) => {
                colorPreview.style.background = `linear-gradient(145deg, ${e.target.value}, ${e.target.value}99)`;
            });
        },
        onConfirm: async () => {
            const name = document.getElementById('name').value;
            const color = document.getElementById('color').value;
            const description = document.getElementById('description').value;

            await addNewBoard(name, color, description);
            window.location.reload();
        }
    });

    modal.create();
    document.getElementById('name').focus();
}

async function addNewColumn(name) {
    const urlParams = new URLSearchParams(window.location.search);
    const boardId = urlParams.get('id');

    if (!boardId) {
        console.error('ID da board não encontrado');
        return;
    }

    try {
        await requests.CreateColumn({
            BoardId: parseInt(boardId),
            Name: name,
            IsActive: true,
            CreatedBy: user.Id,
            UpdatedBy: user.Id
        });

        window.location.reload();
    } catch (error) {
        console.error('Erro ao criar coluna:', error);
        throw error;
    }
}

function addNewColumnForm() {
    const modal = new Modal({
        title: 'Nova Coluna',
        icon: 'fa-columns',
        iconColor: 'indigo',
        size: 'sm',
        position: 'center',
        animation: 'scale',
        isForm: true,
        content: `
            <div class="space-y-4">
                <div class="space-y-2">
                    <label class="text-sm font-medium text-gray-700">Nome da Coluna</label>
                    <input type="text" id="name" 
                        class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
                        placeholder="Digite o nome da coluna" required>
                </div>
            </div>
        `,
        confirmText: 'Criar Coluna',
        cancelText: 'Cancelar',
        onConfirm: async () => {
            const name = document.getElementById('name').value;
            await addNewColumn(name);
        }
    });

    modal.create();
    document.getElementById('name').focus();
}

async function addNewTask(columnId, name, description) {
    if (!columnId) {
        console.error('ID da coluna não encontrado');
        return;
    }

    try {
        await requests.CreateTask({
            ColumnId: parseInt(columnId),
            Title: name,
            Description: description,
            IsActive: true,
            CreatedBy: user.Id,
            UpdatedBy: user.Id
        });

        await loadTasks(columnId);
    } catch (error) {
        console.error('Erro ao criar tarefa:', error);
        throw error;
    }
}

function addNewTaskForm(columnId) {
    const modal = new Modal({
        title: 'Nova Tarefa',
        icon: 'fa-tasks',
        iconColor: 'green',
        size: 'md',
        position: 'center',
        animation: 'scale',
        isForm: true,
        content: `
            <div class="space-y-6">
                <div class="space-y-2">
                    <label class="text-sm font-medium text-gray-700">Título da Tarefa</label>
                    <input type="text" id="name" 
                        class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
                        placeholder="Digite o título da tarefa" required>
                </div>
                <div class="space-y-2">
                    <label class="text-sm font-medium text-gray-700">Descrição</label>
                    <textarea id="description" 
                        class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
                        placeholder="Descreva os detalhes da tarefa" rows="3"></textarea>
                </div>
            </div>
        `,
        confirmText: 'Criar Tarefa',
        cancelText: 'Cancelar',
        onConfirm: async () => {
            const name = document.getElementById('name').value;
            const description = document.getElementById('description').value;
            await addNewTask(columnId, name, description);
        }
    });

    modal.create();
    document.getElementById('name').focus();
}

function editTaskForm(task) {
    const modal = new Modal({
        title: 'Editar Tarefa',
        icon: 'fa-edit',
        iconColor: 'yellow',
        size: 'md',
        position: 'center',
        animation: 'scale',
        isForm: true,
        content: `
            <div class="space-y-6">
                <div class="space-y-2">
                    <label class="text-sm font-medium text-gray-700">Título da Tarefa</label>
                    <input type="text" id="name" 
                        class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
                        placeholder="Digite o título da tarefa" 
                        value="${task.title}" required>
                </div>
                <div class="space-y-2">
                    <label class="text-sm font-medium text-gray-700">Descrição</label>
                    <textarea id="description" 
                        class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
                        placeholder="Descreva os detalhes da tarefa" rows="3">${task.description || ''}</textarea>
                </div>
                <div class="flex items-center gap-2">
                    <input type="checkbox" id="isActive" class="w-4 h-4 text-blue-600 rounded" ${task.isActive ? 'checked' : ''}>
                    <label class="text-sm font-medium text-gray-700">Tarefa ativa</label>
                </div>
            </div>
        `,
        confirmText: 'Salvar',
        cancelText: 'Cancelar',
        onConfirm: async () => {
            const name = document.getElementById('name').value;
            const description = document.getElementById('description').value;
            const isActive = document.getElementById('isActive').checked;

            await requests.UpdateTask({
                Id: task.id,
                Title: name,
                Description: description,
                IsActive: isActive,
                UpdatedBy: user.Id
            });

            await loadTasks(task.columnId);
        }
    });

    modal.create();
    document.getElementById('name').focus();
}

async function loadTasks(columnId) {
    try {
        const tasks = await requests.GetTasksByColumnId(columnId);
        const tasksContainer = document.querySelector(`[data-column-id="${columnId}"]`);

        if (!tasksContainer) {
            console.error('Container de tasks não encontrado');
            return;
        }

        tasksContainer.innerHTML = '';

        if (!tasks || tasks.length === 0) {
            const emptyMessage = document.createElement("div");
            emptyMessage.className = "flex flex-col items-center justify-center p-4 text-gray-400 text-sm";
            emptyMessage.innerHTML = `
                <i class="fas fa-tasks mb-2"></i>
                <p>Nenhuma tarefa</p>
            `;
            tasksContainer.appendChild(emptyMessage);
            return;
        }

        tasks.forEach((taskData, index) => {
            const task = new Task({
                id: taskData.Id,
                title: taskData.Title,
                description: taskData.Description,
                isActive: taskData.IsActive,
                columnId: columnId,
                onEdit: (task) => editTaskForm(task),
                onDelete: (taskId) => deleteTask(taskId, columnId),
                onStatusChange: (taskId, isActive) => updateTaskStatus(taskId, isActive),
                animationDelay: index * 0.05
            });

            tasksContainer.appendChild(task.create());
        });

    } catch (error) {
        console.error('Erro ao carregar tasks:', error);
        throw error;
    }
}

export default {
    backToBoardList,
    addNewBoardForm,
    addNewColumnForm,
    addNewTaskForm,
    editTaskForm,
    loadTasks
};
