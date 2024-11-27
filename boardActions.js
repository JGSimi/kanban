import requests from "./request.js";
import user from "./user.js";

function backToBoardList() {
    window.location.href = 'index.html';
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

async function addNewTask(columnId, name) {

    if (!columnId) {
        console.error('ID da coluna não encontrado');
        return;
    }

    try {
        await requests.CreateTask({
            ColumnId: parseInt(columnId),
            Title: name,
            Description: "",
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
        <input type="text" class="input-primary w-full p-sm border-md" placeholder="Nome da tarefa" required>
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
        await addNewTask(columnId, form.querySelector('input').value);
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
            taskElement.innerHTML = `
                <div class="task-content w-full">
                    <div class="flex-row gap-sm align-center">
                        <div class="task-update">
                            <button ${task.IsActive ? 'disabled' : ''} class="btn p-sm btn-done" title="Marcar como concluída" onclick="markAsDone(${task.Id})"> </button>
                        </div>
                        <div class="task-title">
                            <h2 class="fnt-md" title="${task.Title}">${task.Title.length > 20 ? task.Title.substring(0, 20) + '...' : task.Title}</h2>
                        </div>
                    </div>
                    <div class="task-actions flex-row gap-sm">
                        <button class="btn btn-icon p-sm" title="Deletar" onclick="deleteTask(${task.Id})">🗑️</button>
                    </div>
                </div>
                ${task.Description ? `<p class="fnt-sm">${task.Description}</p>` : ''}
            `;

            tasksContainer.appendChild(taskElement);

            taskElement.querySelector('.btn-done').onclick = () => {
                markAsDone(task.Id);
            };
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
        const columnId = document.querySelector(`[data-task-id="${taskId}"]`)
            ?.closest('.tasks-container')
            ?.dataset.columnId;

        await requests.UpdateTask({
            Id: taskId,
            IsActive: false,
            UpdatedBy: user.Id
        });

        // Recarrega as tasks da coluna após a atualização
        if (columnId) {
            await loadTasks(columnId);
        }
    } catch (error) {
        console.error('Erro ao marcar tarefa como concluída:', error);
        alert('Erro ao marcar tarefa como concluída. Tente novamente.');
    }
}

export default {
    backToBoardList,
    addNewColumnForm,
    addNewTaskForm,
    loadTasks
}