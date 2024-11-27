import requests from "./request.js";
import user from "./user.js";
import actions from "./boardActions.js";

async function checkLogin() {
    if (!user.load() || user.Id === null) {
        window.location.href = "login.html";
    }
}

async function loadBoards() {
    try {
        console.log('User ID:', user.Id); // Debug
        const boards = await requests.GetBoards();
        console.log('Boards recebidas:', boards); // Debug
        
        if (!boards || !Array.isArray(boards)) {
            console.error('Resposta inválida da API');
            return;
        }

        const userBoards = boards.filter(board => {
            const boardUserId = board.UserId ? parseInt(board.UserId) : null;
            const userId = parseInt(user.Id);
            console.log('Comparando BoardUserId:', boardUserId, 'com UserId:', userId);
            return boardUserId === userId;
        });
        
        console.log('Boards do usuário:', userBoards); // Debug
        const boardsContainer = document.getElementById("boards");

        if (!userBoards.length) {
            boardsContainer.innerHTML = `
                <div class="empty-state flex-centralize flex-column gap-md p-lg">
                    <h3 class="fnt-lg">Nenhum projeto encontrado</h3>
                    <p class="fnt-md">Crie um novo projeto para começar</p>
                </div>
            `;
            return;
        }

        boardsContainer.innerHTML = '';

        userBoards.forEach((board, index) => {
            const boardElement = document.createElement("div");
            boardElement.classList.add("board");
            boardElement.style.animation = `fadeInSlideUp 0.5s ${index * 0.1}s both`;
            
            boardElement.innerHTML = `
                <div class="board-content" data-board-id="${board.Id}">
                    <div class="board-info">
                        <h2 class="fnt-lg" title="${board.Name}">
                            ${board.Name.length > 20 ? board.Name.substring(0,20) + '...' : board.Name}
                        </h2>
                    </div>
                    <div class="board-actions">
                        <div class="dropdown">
                            <button class="btn p-sm border-sm" aria-label="Opções">⋮</button>
                            <div class="dropdown-content p-sm flex-column gap-sm">
                                <button class="btn btn-primary p-sm border-sm" onclick="editBoard(${board.Id})">✐ Editar</button>
                                <button class="btn btn-primary p-sm border-sm" onclick="deleteBoard(${board.Id})">🗑️ Excluir</button>
                                <button class="btn btn-primary p-sm border-sm" onclick="duplicateBoard(${board.Id})">📋 Duplicar</button>
                                <button class="btn btn-primary p-sm border-sm" onclick="toggleFavorite(${board.Id})">⭐ Favoritar</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            boardsContainer.appendChild(boardElement);
            
            const boardContent = boardElement.querySelector('.board-content');
            boardContent.addEventListener('click', (e) => {
                if (!e.target.closest('.board-actions')) {
                    window.location.href = `board.html?id=${board.Id}`;
                }
            });
        });

    } catch (error) {
        console.error('Erro ao carregar boards:', error);
        document.getElementById("boards").innerHTML = `
            <div class="error-state flex-centralize p-lg">
                <p class="fnt-md">Erro ao carregar os projetos. Tente novamente mais tarde.</p>
            </div>
        `;
    }
}

document.getElementById('add-board').onclick = actions.addNewBoardForm;



// Garante que o usuário está logado antes de carregar as boards
async function init() {
    await checkLogin();
    await loadBoards();
}

init();
