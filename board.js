import requests from "./request.js";
import user from "./user.js";
import actions from "./boardActions.js";

function getBoardIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}
async function loadBoardAndTasks() {
    const boardId = getBoardIdFromUrl();
    
    if (!boardId) {
        console.error('ID da board não encontrado');
        window.location.href = 'index.html';
        return;
    }

    try {
        const boardColumns = document.getElementById("board-columns");
        const title = document.getElementById("board-title");

        if (!boardColumns || !title) {
            console.error('Elementos necessários não encontrados no HTML');
            return;
        }

        // Busca os dados da board
        const board = await requests.GetBoardById(boardId);
        
        if (!board) {
            console.error('Board não encontrada');
            window.location.href = 'index.html';
            return;
        }

        title.textContent = board.Name;

        // Busca as colunas com verificação adicional
        const columns = await requests.GetColumnsByBoardId(boardId);
        console.log('Colunas recebidas:', columns); // Debug

        // Limpa o conteúdo anterior
        boardColumns.innerHTML = '';

        // Verifica se columns é undefined, null ou vazio
        if (!columns || !Array.isArray(columns) || columns.length === 0) {
            const emptyMessage = document.createElement("div");
            emptyMessage.classList.add("empty-state", "flex-centralize", "flex-column", "gap-md", "p-lg");
            emptyMessage.innerHTML = `
                <h3 class="fnt-lg">Nenhuma coluna encontrada</h3>
                <p class="fnt-md">Crie uma nova coluna para começar</p>
            `;
            boardColumns.appendChild(emptyMessage);
            return;
        }
        
        // Renderiza as colunas com animação
        columns.forEach((column, index) => {
            if (!column || !column.Name) {
                console.error('Coluna inválida:', column);
                return;
            }

            const columnElement = document.createElement("div");
            columnElement.classList.add("column", "card", "card-primary");
            columnElement.style.animationDelay = `${index * 0.1}s`;
            columnElement.innerHTML = `
                <div class="column-header flex-space-between p-sm">
                    <h2 class="fnt-lg">${column.Name}</h2>
                    <div class="column-actions">
                        <div class="dropdown">
                            <button class="btn btn-icon p-sm" title="Mais opções">⋮</button>
                            <div class="dropdown-content gap-sm p-sm">
                                <button class="btn btn-primary p-sm border-md" title="Editar">✐ Editar</button>
                                <button class="btn btn-primary p-sm border-md" title="Deletar">🗑️ Deletar</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="tasks-container flex-column gap-sm p-sm" data-column-id="${column.Id}">
                    <!-- Tasks geradas dinamicamente via JavaScript -->
                </div>
                <button class="btn btn-secondary w-full p-sm border-md add-task-button">
                    + Adicionar tarefa
                </button>
            `;

            const addTaskButton = columnElement.querySelector('.add-task-button');
            addTaskButton.addEventListener("click", () => {
                const columnId = column.Id;
                actions.addNewTaskForm(columnId);
            });
            
            boardColumns.appendChild(columnElement);

            // Carrega as tasks para cada coluna
            actions.loadTasks(column.Id);
        });

        return true;

    } catch (error) {
        console.error('Erro ao carregar board:', error);
        const errorMessage = document.createElement("div");
        errorMessage.classList.add("error-state", "flex-centralize", "p-lg");
        errorMessage.innerHTML = `
            <p class="fnt-md">Erro ao carregar as colunas. Tente novamente mais tarde.</p>
        `;
        document.getElementById("board-columns").appendChild(errorMessage);
    }
}

document.getElementById("back-button").addEventListener("click", actions.backToBoardList);
document.getElementById("add-column-button").addEventListener("click", actions.addNewColumnForm);

// Verifica login antes de carregar a board
async function init() {
    if (!user.load() || user.Id === null) {
        window.location.href = "login.html";
        return;
    }
    await loadBoardAndTasks();
}

init();