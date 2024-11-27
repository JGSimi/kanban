import requests from "./request.js";

// Função para obter o ID da board da URL
function getBoardIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

async function loadColumns() {
    const boardId = getBoardIdFromUrl();
    
    if (!boardId) {
        console.error('ID da board não encontrado');
        window.location.href = 'index.html';
        return;
    }

    const columns = await requests.GetColumnsByBoardId(boardId);

    columns.forEach(column => {
        const columnElement = document.createElement("div");
        columnElement.classList.add("column");
        columnElement.innerHTML = `
            <h2>${column.Title}</h2>
            <div class="tasks-container">
                <!-- Tasks geradas dinamicamente via JavaScript -->
            </div>
        `;

        document.querySelector(".board-container").appendChild(columnElement);
    });
}

loadColumns();