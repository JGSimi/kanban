import user from "./user.js";
import requests from "./request.js";

async function checkLogin() {
    if (!user.load() || user.Id === null) {
        window.location.href = "login.html";
    }
}

async function loadBoards() {
    const boards = await requests.GetBoards(user.Id);

    boards.forEach(board => {
        const boardElement = document.createElement("div");
        boardElement.classList.add("board");
        boardElement.innerHTML = `
            <div class="board-content">
                <div class="board-info">
                    <h2 class="fnt-lg" title="${board.Name}">${board.Name.length > 20 ? board.Name.substring(0,20) + '...' : board.Name}</h2>
                </div>
                <div class="board-actions">
                    <div class="dropdown">
                        <button class="btn p-sm border-sm">⋮</button>
                        <div class="dropdown-content p-sm flex-column gap-sm">
                            <button class="btn btn-primary p-sm border-sm">✐ Editar</button>
                            <button class="btn btn-primary p-sm border-sm">🗑️ Excluir</button>
                            <button class="btn btn-primary p-sm border-sm">📋 Duplicar</button>
                            <button class="btn btn-primary p-sm border-sm">⭐ Favoritar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.getElementById("boards").appendChild(boardElement);
    });
}

checkLogin();
loadBoards();
