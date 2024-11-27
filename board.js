import requests from "./request.js";
import user from "./user.js";
import actions from "./boardActions.js";

function getBoardIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

async function loadBoard() {
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

        // Primeiro, busca os dados da board
        const board = await requests.GetBoardById(boardId);
        
        if (!board) {
            console.error('Board não encontrada');
            window.location.href = 'index.html';
            return;
        }

        title.textContent = board.Name;

        // Depois, busca as colunas
        const columns = await requests.GetColumnsByBoardId(boardId);
        
        // Limpa o conteúdo anterior
        boardColumns.innerHTML = '';

        // Verifica se columns é undefined ou vazio
        if (!columns || columns.length === 0) {
            const emptyMessage = document.createElement("div");
            emptyMessage.classList.add("empty-state", "flex-centralize", "flex-column", "gap-md", "p-lg");
            emptyMessage.innerHTML = `
                <h3 class="fnt-lg">Nenhuma coluna encontrada</h3>
                <p class="fnt-md">Crie uma nova coluna para começar</p>
                <button class="btn btn-primary p-sm border-md">+ Adicionar Coluna</button>
            `;
            boardColumns.appendChild(emptyMessage);
            return;
        }
        
        columns.forEach(column => {
            const columnElement = document.createElement("div");
            columnElement.classList.add("column");
            columnElement.innerHTML = `
                <h2>${column.Title}</h2>
                <div class="tasks-container flex-column gap-sm" data-column-id="${column.Id}">
                    <!-- Tasks geradas dinamicamente via JavaScript -->
                </div>
            `;
            boardColumns.appendChild(columnElement);
        });

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

// Verifica login antes de carregar a board
async function init() {
    if (!user.load() || user.Id === null) {
        window.location.href = "login.html";
        return;
    }
    await loadBoard();
}

init();