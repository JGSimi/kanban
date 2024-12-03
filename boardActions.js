import requests from "./request.js";
import user from "./user.js";
import Modal from './components/Modal.js';

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
        isForm: true,
        content: `
            <div class="space-y-4">
                <div>
                    <input id="name" type="text" 
                        class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
                        placeholder="Nome do quadro" required>
                </div>
                <div>
                    <input id="color" type="color" 
                        class="w-full h-14 rounded-xl cursor-pointer" 
                        value="#4F46E5">
                </div>
                <div>
                    <textarea id="description" 
                        class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
                        placeholder="Descrição do quadro" 
                        rows="3"></textarea>
                </div>
            </div>
        `,
        confirmText: 'Criar Quadro',
        cancelText: 'Cancelar',
        onConfirm: async () => {
            try {
                const name = modal.modalElement.querySelector('#name').value;
                const color = modal.modalElement.querySelector('#color').value;
                const description = modal.modalElement.querySelector('#description').value;

                await addNewBoard(name, color, description);
                window.location.reload();
            } catch (error) {
                alert('Erro ao criar quadro. Tente novamente.');
            }
        }
    });

    modal.create();
    modal.modalElement.querySelector('#name').focus();
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
        alert('Erro ao criar coluna. Tente novamente.');
    }
}

function addNewColumnForm() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50';
    
    const form = document.createElement('form');
    form.className = 'bg-white rounded-lg shadow-xl p-8 max-w-md w-full transform transition-all duration-300 scale-95 opacity-0';
    setTimeout(() => form.classList.replace('scale-95', 'scale-100'), 0);
    setTimeout(() => form.classList.replace('opacity-0', 'opacity-100'), 0);
    
    form.innerHTML = `
        <h2 class="text-2xl font-bold mb-6">Nova Coluna</h2>
        <input type="text" class="w-full px-4 py-2 mb-6 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" placeholder="Nome da coluna" required>
        <div class="flex gap-4">
            <button type="submit" class="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Criar</button>
            <button type="button" class="flex-1 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">Cancelar</button>
        </div>
    `;

    modal.appendChild(form);
    document.body.appendChild(modal);

    form.querySelector('input').focus();

    form.querySelector('button[type="button"]').onclick = () => {
        form.classList.replace('scale-100', 'scale-95');
        form.classList.replace('opacity-100', 'opacity-0');
        setTimeout(() => modal.remove(), 300);
    };

    form.onsubmit = async (e) => {
        e.preventDefault();
        try {
            await addNewColumn(form.querySelector('input').value);
            form.classList.replace('scale-100', 'scale-95');
            form.classList.replace('opacity-100', 'opacity-0');
            setTimeout(() => modal.remove(), 300);
        } catch (error) {
            alert('Erro ao criar coluna. Tente novamente.');
        }
    };
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
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50';
    
    const form = document.createElement('form');
    form.className = 'bg-white rounded-lg shadow-xl p-8 max-w-md w-full transform transition-all duration-300 scale-95 opacity-0';
    setTimeout(() => form.classList.replace('scale-95', 'scale-100'), 0);
    setTimeout(() => form.classList.replace('opacity-0', 'opacity-100'), 0);
    
    form.innerHTML = `
        <h2 class="text-2xl font-bold mb-6">Nova Tarefa</h2>
        <input type="text" id="name" class="w-full px-4 py-2 mb-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" placeholder="Nome da tarefa" required>
        <textarea id="description" class="w-full px-4 py-2 mb-6 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" placeholder="Descrição da tarefa" rows="3"></textarea>
        <div class="flex gap-4">
            <button type="submit" class="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Criar</button>
            <button type="button" class="flex-1 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">Cancelar</button>
        </div>
    `;

    modal.appendChild(form);
    document.body.appendChild(modal);

    form.querySelector('input').focus();

    form.querySelector('button[type="button"]').onclick = () => {
        form.classList.replace('scale-100', 'scale-95');
        form.classList.replace('opacity-100', 'opacity-0');
        setTimeout(() => modal.remove(), 300);
    };

    form.onsubmit = async (e) => {
        e.preventDefault();
        try {
            await addNewTask(
                columnId,
                form.querySelector('#name').value,
                form.querySelector('#description').value
            );
            form.classList.replace('scale-100', 'scale-95');
            form.classList.replace('opacity-100', 'opacity-0');
            setTimeout(() => modal.remove(), 300);
        } catch (error) {
            alert('Erro ao criar tarefa. Tente novamente.');
        }
    };
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

        if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
            const emptyMessage = document.createElement("div");
            emptyMessage.className = "flex flex-col items-center justify-center p-4 text-gray-400 text-sm";
            emptyMessage.innerHTML = `
                <i class="fas fa-tasks mb-2"></i>
                <p>Nenhuma tarefa</p>
            `;
            tasksContainer.appendChild(emptyMessage);
            return;
        }

        tasks.forEach((task, index) => {
            if (!task || !task.Title) {
                console.error('Task inválida:', task);
                return;
            }

            const taskElement = document.createElement("div");
            taskElement.className = "bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-grab active:cursor-grabbing group";
            taskElement.setAttribute('data-task-id', task.Id);
            taskElement.draggable = true;
            
            taskElement.innerHTML = `
                <div class="flex items-center justify-between gap-4">
                    <div class="flex items-center gap-4">
                        <button ${task.IsActive ? 'disabled' : ''} 
                            class="w-6 h-6 rounded-full border-2 border-gray-300 hover:border-green-500 transition-colors flex items-center justify-center"
                            title="Marcar como concluída">
                        </button>
                        <div class="flex flex-col">
                            <h3 class="font-medium" title="${task.Title}">
                                ${task.Title.length > 20 ? task.Title.substring(0, 20) + '...' : task.Title}
                            </h3>
                            <p class="text-sm text-gray-500">
                                ${task.Description ? (task.Description.length > 50 ? task.Description.substring(0, 50) + '...' : task.Description) : ''}
                            </p>
                        </div>
                    </div>
                    <button class="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-50 rounded-full text-red-500" title="Deletar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;

            // Event listeners
            taskElement.querySelector('button[title="Marcar como concluída"]').onclick = () => markAsDone(task.Id);
            taskElement.querySelector('button[title="Deletar"]').onclick = () => deleteTask(task.Id);

            tasksContainer.appendChild(taskElement);
        });

    } catch (error) {
        console.error('Erro ao carregar tasks:', error);
        const tasksContainer = document.querySelector(`[data-column-id="${columnId}"]`);
        if (tasksContainer) {
            tasksContainer.innerHTML = `
                <div class="flex items-center justify-center p-4 text-red-500">
                    <p class="text-sm">Erro ao carregar tarefas</p>
                </div>
            `;
        }
    }
}

async function markAsDone(taskId) {
    try {
        const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
        const columnId = taskElement.closest('.tasks-container').getAttribute('data-column-id');

        // Adiciona classe para iniciar animação de conclusão
        taskElement.classList.add('task-completing');
        
        // Aguarda a animação de conclusão
        await new Promise(resolve => setTimeout(resolve, 800));

        await requests.UpdateTask({
            Id: taskId,
            IsActive: false,
            UpdatedBy: user.Id
        });

        // Adiciona classe para animação de saída
        taskElement.classList.add('task-completed');
        
        // Aguarda a animação de saída
        await new Promise(resolve => setTimeout(resolve, 500));

        // Recarrega as tasks da coluna
        await loadTasks(columnId);

    } catch (error) {
        console.error('Erro ao marcar tarefa como concluída:', error);
        alert('Erro ao marcar tarefa como concluída. Tente novamente.');
    }
}

async function deleteTask(taskId) {
    try {
        const confirmDelete = confirm('Tem certeza que deseja excluir esta tarefa?');
        if (!confirmDelete) return;

        const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
        const columnId = taskElement.closest('.tasks-container').getAttribute('data-column-id');

        // Animação de saída
        taskElement.style.animation = 'taskDelete 0.3s var(--bounce) forwards';

        // Aguarda a animação terminar antes de fazer a requisição
        await new Promise(resolve => setTimeout(resolve, 300));

        await requests.DeleteTask(taskId);
        
        // Recarrega as tasks da coluna
        await loadTasks(columnId);

    } catch (error) {
        console.error('Erro ao deletar tarefa:', error);
        alert('Erro ao deletar tarefa. Tente novamente.');
    }
}

export default {
    backToBoardList,
    addNewColumnForm,
    addNewTaskForm,
    addNewBoardForm,
    loadTasks,
    markAsDone,
    deleteTask
};
