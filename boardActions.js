import requests from "./request.js";
import user from "./user.js";

function backToBoardList() {
    window.location.href = 'index.html';
}

async function addNewBoard(name, color, description) {
    try {
        const newBoard = {
            Name: name,
            Description: description,
            HexaBackgroundCoor: color,
            IsActive: true,
            CreatedBy: user.Id,
            UpdatedBy: user.Id
        };
        
        console.log('Nova board sendo criada:', newBoard);
        const createdBoard = await requests.CreateBoard(newBoard);
        console.log('Board criada com sucesso:', createdBoard);

    } catch (error) {
        console.error('Erro ao criar board:', error);
    }
}

function addNewBoardForm() {
    const modal = document.createElement('div');
    modal.classList.add('modal', 'flex-centralize');
    modal.style.animation = 'modalSlideUp 0.3s var(--bounce) forwards';

    const form = document.createElement('form');
    form.classList.add('modal-content', 'card', 'card-primary');
    form.innerHTML = `
        <h2 class="fnt-lg">Novo Quadro</h2>
        <input id="name" type="text" class="input-primary w-full p-sm border-md" placeholder="Nome do quadro" required>
        <input id="color" type="color" class="input-primary w-full p-sm border-md" placeholder="Cor de fundo" required>
        <textarea id="description" class="input-primary w-full p-sm border-md" placeholder="Descrição do quadro" rows="3"></textarea>
        <div class="flex-row gap-sm w-full">
            <button type="submit" class="btn btn-primary w-full p-sm border-md">Criar</button>
            <button type="button" class="btn btn-secondary w-full p-sm border-md">Cancelar</button>
        </div>
    `;

    modal.appendChild(form);
    document.body.appendChild(modal);

    form.querySelector('input').focus();

    form.querySelector('.btn-secondary').onclick = () => {
        modal.style.animation = 'modalSlideDown 0.3s var(--bounce) forwards';
        setTimeout(() => modal.remove(), 300);
    };

    form.onsubmit = async (e) => {
        e.preventDefault();
        await addNewBoard(form.querySelector('#name').value, form.querySelector('#color').value, form.querySelector('#description').value);
        modal.style.animation = 'modalSlideDown 0.3s var(--bounce) forwards';
        setTimeout(() => {
            modal.remove();
            window.location.reload();
        }, 300);
    };

}

async function addNewColumn(name) {
    const urlParams = new URLSearchParams(window.location.search);
    const boardId = urlParams.get('id');

    if (!boardId) {
        console.error('ID da board não encontrado');
        return;
    }

    try {
        const newColumn = await requests.CreateColumn({
            BoardId: parseInt(boardId),
            Name: name,
            IsActive: true,
            CreatedBy: user.Id,
            UpdatedBy: user.Id
        });

        // Recarrega a página para mostrar a nova coluna
        window.location.reload();
    } catch (error) {
        console.error('Erro ao criar coluna:', error);
        alert('Erro ao criar coluna. Tente novamente.');
    }
}

function addNewColumnForm() {
    const modal = document.createElement('div');
    modal.classList.add('modal', 'flex-centralize');
    modal.style.animation = 'modalSlideUp 0.3s var(--bounce) forwards';

    const form = document.createElement('form');
    form.classList.add('modal-content', 'card', 'card-primary');
    form.innerHTML = `
        <h2 class="fnt-lg">Nova Coluna</h2>
        <input type="text" class="input-primary w-full p-sm border-md" placeholder="Nome da coluna" required>
        <div class="flex-row gap-sm w-full">
            <button type="submit" class="btn btn-primary w-full p-sm border-md">Criar</button>
            <button type="button" class="btn btn-secondary w-full p-sm border-md">Cancelar</button>
        </div>
    `;

    modal.appendChild(form);
    document.body.appendChild(modal);

    form.querySelector('input').focus();

    form.querySelector('.btn-secondary').onclick = () => {
        modal.style.animation = 'modalSlideDown 0.3s var(--bounce) forwards';
        setTimeout(() => modal.remove(), 300);
    };

    form.onsubmit = async (e) => {
        e.preventDefault();
        await addNewColumn(form.querySelector('input').value);
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
    } catch (error) {
        console.error('Erro ao criar tarefa:', error);
        alert('Erro ao criar tarefa. Tente novamente.');
    }
}

function addNewTaskForm(columnId) {
    const modal = document.createElement('div');
    modal.classList.add('modal', 'flex-centralize');
    modal.style.animation = 'modalSlideUp 0.3s var(--bounce) forwards';

    const form = document.createElement('form');
    form.classList.add('modal-content', 'card', 'card-primary');
    form.innerHTML = `
        <h2 class="fnt-lg">Nova Tarefa</h2>
        <input type="text" id="name" class="input-primary w-full p-sm border-md" placeholder="Nome da tarefa" required>
        <textarea id="description" class="input-primary w-full p-sm border-md" placeholder="Descrição da tarefa" rows="3"></textarea>
        <div class="flex-row gap-sm w-full">
            <button type="submit" class="btn btn-primary w-full p-sm border-md">Criar</button>
            <button type="button" class="btn btn-secondary w-full p-sm border-md">Cancelar</button>
        </div>
    `;

    modal.appendChild(form);
    document.body.appendChild(modal);

    form.querySelector('input').focus();

    form.querySelector('.btn-secondary').onclick = () => {
        modal.style.animation = 'modalSlideDown 0.3s var(--bounce) forwards';
        setTimeout(() => modal.remove(), 300);
        window.location.reload();
    };

    form.onsubmit = async (e) => {
        e.preventDefault();
        await addNewTask(columnId, form.querySelector('#name').value, form.querySelector('#description').value);
        modal.style.animation = 'modalSlideDown 0.3s var(--bounce) forwards';
        setTimeout(() => modal.remove(), 300);
        await loadTasks(columnId);
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
            emptyMessage.classList.add("empty-state", "flex-centralize", "flex-column", "gap-sm", "p-sm");
            emptyMessage.innerHTML = `
                <p class="fnt-md">Nenhuma tarefa encontrada</p>
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
            taskElement.classList.add("task");
            taskElement.style.animationDelay = `${index * 0.1}s`;
            taskElement.setAttribute('data-task-id', task.Id);
            taskElement.draggable = true;
            taskElement.innerHTML = `
                <div class="task-content w-full">
                    <div class="flex-row gap-sm align-center">
                        <div class="task-update">
                            <button ${task.IsActive ? 'disabled' : ''} class="btn p-sm btn-done" title="Marcar como concluída"> </button>
                        </div>
                        <div class="flex-column gap-sm">
                            <div class="task-title">
                                <h2 class="fnt-md" title="${task.Title}">${task.Title.length > 20 ? task.Title.substring(0, 20) + '...' : task.Title}</h2>
                            </div>
                            <div class="task-description">
                                <p class="fnt-sm">${task.Description ? (task.Description.length > 50 ? task.Description.substring(0, 50) + '...' : task.Description) : ''}</p>
                            </div>
                        </div>
                    </div>
                    <div class="task-actions flex-row gap-sm">
                        <button class="btn btn-icon p-sm" title="Deletar">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;

            // Event listeners para drag and drop
            taskElement.addEventListener('dragstart', (e) => {
                e.stopPropagation();
                taskElement.classList.add('task-dragging');
                e.dataTransfer.setData('application/json', JSON.stringify({
                    taskId: task.Id,
                    sourceColumnId: columnId
                }));
            });

            taskElement.addEventListener('dragend', () => {
                taskElement.classList.remove('task-dragging');
            });

            // Event listeners para botões
            taskElement.querySelector('.btn-done').onclick = () => markAsDone(task.Id);
            taskElement.querySelector('.btn-icon').onclick = () => deleteTask(task.Id);

            tasksContainer.appendChild(taskElement);
        });

        // Event listeners para o container
        tasksContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            const draggingElement = document.querySelector('.task-dragging');
            if (!draggingElement) return;

            tasksContainer.classList.add('column-dragover');
        });

        tasksContainer.addEventListener('dragleave', () => {
            tasksContainer.classList.remove('column-dragover');
        });

        tasksContainer.addEventListener('drop', async (e) => {
            e.preventDefault();
            tasksContainer.classList.remove('column-dragover');

            try {
                const data = JSON.parse(e.dataTransfer.getData('application/json'));
                const { taskId, sourceColumnId } = data;
                const targetColumnId = tasksContainer.getAttribute('data-column-id');

                if (sourceColumnId === targetColumnId) return;

                const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
                if (!taskElement) return;

                // Atualiza a task no backend
                await updateTaskColumn(taskId, parseInt(targetColumnId));

                // Atualiza as duas colunas envolvidas
                await Promise.all([
                    loadTasks(sourceColumnId),
                    loadTasks(targetColumnId)
                ]);

            } catch (error) {
                console.error('Erro ao mover task:', error);
                alert('Erro ao mover tarefa. Tente novamente.');
            }
        });

    } catch (error) {
        console.error('Erro ao carregar tasks:', error);
        const errorMessage = document.createElement("div");
        errorMessage.classList.add("error-state", "flex-centralize", "p-sm");
        errorMessage.innerHTML = `
            <p class="fnt-sm">Erro ao carregar as tarefas</p>
        `;
        document.querySelector(`[data-column-id="${columnId}"]`).appendChild(errorMessage);
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

function getClosestTask(container, mouseY) {
    const draggableElements = [...container.querySelectorAll('.task:not(.task-dragging)')];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = mouseY - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

async function updateTaskColumn(taskId, newColumnId) {
    try {
        console.log('Movendo task:', { taskId, newColumnId });
        const response = await requests.UpdateTask({
            Id: taskId,
            ColumnId: newColumnId,
            UpdatedBy: user.Id
        });

        if (!response) {
            throw new Error('Falha ao atualizar a tarefa');
        }

        return response;
    } catch (error) {
        console.error('Erro ao atualizar coluna da tarefa:', error);
        throw error;
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
}
