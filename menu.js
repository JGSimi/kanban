import requests from "./request.js";
import user from "./user.js";
import actions from "./boardActions.js";

function loadMenu() {
    const menu = Menu();
    document.body.appendChild(menu);
}

function Menu() {
    const menuContainer = document.createElement('div');
    menuContainer.classList.add('menu-container');

    const menu = document.createElement('div');
    menu.classList.add('menu', 'flex-column', 'gap-md', 'p-md');

    const header = document.createElement('div');
    header.classList.add('menu-header', 'flex-between', 'w-full', 'p-md');

    const title = document.createElement('h2');
    title.classList.add('fnt-title');
    title.textContent = 'Projetos';

    const addButton = document.createElement('button');
    addButton.classList.add('btn', 'btn-icon', 'p-sm', 'border-md');
    addButton.innerHTML = '<span class="fnt-md">Novo +</span>';
    addButton.onclick = () => actions.addNewBoardForm();

    header.appendChild(title);
    header.appendChild(addButton);

    const projectsList = document.createElement('div');
    projectsList.classList.add('projects-list', 'flex-column', 'gap-sm');
    projectsList.id = 'projects-menu';

    menu.appendChild(header);
    menu.appendChild(projectsList);
    menuContainer.appendChild(menu);

    // Função para carregar e renderizar os projetos
    async function loadProjects() {
        try {
            const boards = await requests.GetBoards();
            const userBoards = boards.filter(board => {
                const boardUserId = board.UserId ? parseInt(board.UserId) : null;
                const userId = parseInt(user.Id);
                return boardUserId === userId;
            });

            const projectsData = userBoards.map(board => ({
                name: board.Name,
                id: board.Id,
                columns: [] // Será preenchido abaixo
            }));

            // Busca as colunas para cada projeto
            for (const project of projectsData) {
                const columns = await requests.GetColumnsByBoardId(project.id);
                project.columns = columns.map(column => ({
                    name: column.Name,
                    id: column.Id,
                    tasks: [] // Será preenchido se necessário
                }));
            }

            renderProjectTree(projectsData);
        } catch (error) {
            console.error('Erro ao carregar projetos:', error);
            projectsList.innerHTML = `
                <div class="error-state flex-centralize p-sm">
                    <p class="fnt-sm">Erro ao carregar projetos</p>
                </div>
            `;
        }
    }

    // Chama a função para carregar os projetos
    loadProjects();

    return menuContainer;
}

// Inicializa o menu
async function init() {
    if (!user.load() || user.Id === null) {
        window.location.href = "login.html";
        return;
    }
    loadMenu();
}

init();