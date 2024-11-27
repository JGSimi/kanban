import requests from "./request.js";
import user from "./user.js";
import actions from "./boardActions.js";

// Adiciona estilos de animação
const style = document.createElement('style');
style.textContent = `
    :root {
        --tree-line-color: #e0e0e0;
        --tree-line-width: 1px;
        --tree-indent: 20px;
    }

    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    .menu-container {
        width: 280px;
        height: 100vh;
        border-right: 1px solid #e0e0e0;
        animation: slideIn 0.5s var(--bounce);
    }

    .menu {
        height: 100%;
        overflow-y: auto;
    }

    .menu-header {
        padding: 16px;
        border-bottom: 1px solid #e0e0e0;
    }

    .logout-btn {
        width: auto;
        height: auto;
        padding: 10px;
        border-radius: 50%;
        border: 1px solid #e0e0e0;
        background: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: var(--transition);
        color: #666;
    }

    .logout-btn:hover {
        background: #fff5f5;
        color: #ff4444;
        border-color: #ff4444;
    }

    .tree-view {
        padding: 16px;
    }

    .tree-item {
        position: relative;
        padding-left: var(--tree-indent);
    }

    .tree-item::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: var(--tree-line-width);
        background: var(--tree-line-color);
    }

    .tree-item::after {
        content: '';
        position: absolute;
        left: 0;
        top: 12px;
        width: var(--tree-indent);
        height: var(--tree-line-width);
        background: var(--tree-line-color);
    }

    .tree-item:last-child::before {
        height: 12px;
    }

    .tree-content {
        padding: 4px 8px;
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        border-radius: 4px;
        transition: var(--transition);
    }

    .tree-content:hover {
        background: #f5f5f5;
    }

    .chevron {
        width: 16px;
        height: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.3s var(--bounce);
    }

    .chevron.expanded {
        transform: rotate(90deg);
    }

    .tree-children {
        margin-left: var(--tree-indent);
        overflow: hidden;
        max-height: 1000px;
        opacity: 1;
        transition: all 0.3s var(--bounce);
    }

    .tree-children.collapsed {
        max-height: 0;
        opacity: 0;
    }

    .tree-item .icon {
        width: 16px;
        text-align: center;
        color: #666;
    }

    .tree-content span {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 180px; /* Ajuste conforme necessário */
    }

    .tree-content:hover span {
        color: var(--primary);
    }
`;

document.head.appendChild(style);

function loadMenu() {
    const menu = Menu();
    document.body.appendChild(menu);
}

function Menu() {
    const menuContainer = document.createElement('div');
    menuContainer.classList.add('menu-container');

    const menu = document.createElement('div');
    menu.classList.add('menu');

    // Header com botão de logout e novo
    const header = document.createElement('div');
    header.classList.add('menu-header', 'flex-between');

    const leftSection = document.createElement('div');
    leftSection.classList.add('flex-row', 'gap-md');

    const logoutButton = document.createElement('button');
    logoutButton.classList.add('logout-btn');
    logoutButton.innerHTML = '<i class="fas fa-sign-out-alt"></i>';
    logoutButton.title = 'Sair';
    logoutButton.onclick = handleLogout;

    const addButton = document.createElement('button');
    addButton.classList.add('btn', 'btn-primary', 'flex-row', 'gap-sm', 'border-md', 'p-sm', 'w-full');
    addButton.innerHTML = 'Novo +';
    addButton.onclick = () => actions.addNewBoardForm();

    leftSection.appendChild(logoutButton);
    leftSection.appendChild(addButton);
    header.appendChild(leftSection);

    // Container da árvore de projetos
    const treeView = document.createElement('div');
    treeView.classList.add('tree-view');
    treeView.id = 'projects-tree';

    menu.appendChild(header);
    menu.appendChild(treeView);
    menuContainer.appendChild(menu);

    loadProjects();
    return menuContainer;
}

function handleLogout() {
    user.clear();
    window.location.href = 'login.html';
}

async function loadProjects() {
    try {
        const boards = await requests.GetBoards();
        const userBoards = boards.filter(board => {
            const boardUserId = board.UserId ? parseInt(board.UserId) : null;
            const userId = parseInt(user.Id);
            return boardUserId === userId;
        });

        const projectsData = await Promise.all(userBoards.map(async board => {
            const columns = await requests.GetColumnsByBoardId(board.Id);
            const columnsWithTasks = await Promise.all(columns.map(async column => {
                const tasks = await requests.GetTasksByColumnId(column.Id);
                return {
                    ...column,
                    tasks: tasks || []
                };
            }));

            return {
                name: board.Name,
                id: board.Id,
                columns: columnsWithTasks
            };
        }));

        renderProjectTree(projectsData);
    } catch (error) {
        console.error('Erro ao carregar projetos:', error);
        const treeView = document.getElementById('projects-tree');
        treeView.innerHTML = `
            <div class="error-state flex-centralize p-md">
                <p class="fnt-sm">Erro ao carregar projetos</p>
            </div>
        `;
    }
}

function renderProjectTree(projects) {
    const treeView = document.getElementById('projects-tree');
    treeView.innerHTML = '';

    // Título "Projetos" com ícone de seta
    const projectsTitle = document.createElement('div');
    projectsTitle.classList.add('tree-content');
    projectsTitle.innerHTML = `
        <i class="fas fa-chevron-right chevron expanded"></i>
        <i class="fas fa-folder icon"></i>
        <span class="fnt-md fw-bold">Projetos</span>
    `;

    const projectsList = document.createElement('div');
    projectsList.classList.add('tree-children');

    // Evento para expandir/retrair todos os projetos
    projectsTitle.onclick = () => {
        const chevron = projectsTitle.querySelector('.chevron');
        chevron.classList.toggle('expanded');
        projectsList.classList.toggle('collapsed');
    };

    treeView.appendChild(projectsTitle);
    treeView.appendChild(projectsList);

    projects.forEach(project => {
        const projectItem = createTreeItem(project.name, 'clipboard-list', true);
        const projectChildren = document.createElement('div');
        projectChildren.classList.add('tree-children', 'collapsed');

        project.columns.forEach(column => {
            const columnItem = createTreeItem(column.Name, 'list', true);
            const tasksContainer = document.createElement('div');
            tasksContainer.classList.add('tree-children', 'collapsed');

            column.tasks.forEach(task => {
                const taskItem = createTreeItem(task.Title, 'tasks', false);
                tasksContainer.appendChild(taskItem);
            });

            columnItem.appendChild(tasksContainer);
            projectChildren.appendChild(columnItem);
        });

        projectItem.appendChild(projectChildren);
        projectsList.appendChild(projectItem);
    });
}

function createTreeItem(name, icon, hasChildren) {
    const item = document.createElement('div');
    item.classList.add('tree-item');

    const content = document.createElement('div');
    content.classList.add('tree-content');

    // Função para truncar texto com verificação de segurança
    const truncateText = (text, maxLength = 20) => {
        if (!text) return ''; // Retorna string vazia se text for null ou undefined
        const safeText = String(text); // Converte para string caso seja número
        return safeText.length > maxLength ? safeText.substring(0, maxLength) + '...' : safeText;
    };

    // Texto truncado para exibição com verificação de segurança
    const displayText = truncateText(name || 'Sem nome');
    const titleText = name || 'Sem nome';

    if (hasChildren) {
        content.innerHTML = `
            <i class="fas fa-chevron-right chevron"></i>
            <i class="fas fa-${icon} icon"></i>
            <span class="fnt-sm" title="${titleText}">${displayText}</span>
        `;

        content.onclick = (e) => {
            const chevron = content.querySelector('.chevron');
            const children = item.querySelector('.tree-children');
            chevron.classList.toggle('expanded');
            children.classList.toggle('collapsed');
            e.stopPropagation();
        };
    } else {
        content.innerHTML = `
            <i class="fas fa-${icon} icon"></i>
            <span class="fnt-sm" title="${titleText}">${displayText}</span>
        `;
    }

    item.appendChild(content);
    return item;
}

async function init() {
    if (!user.load() || user.Id === null) {
        window.location.href = "login.html";
        return;
    }
    loadMenu();
}

init();

export { loadMenu };