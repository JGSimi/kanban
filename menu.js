function loadMenu() {
    const menu = Menu();
    document.body.appendChild(menu);
}

function Menu() {
    const menu = document.createElement("div");
    menu.classList.add("menu-container");
    menu.innerHTML = `
        <div class="menu flex-column gap-md p-md">
            <div class="menu-header flex-column gap-sm">
                <div class="menu-profile flex-start gap-sm p-sm">
                    <div class="profile-pic rounded-full">👤</div>
                    <span class="fnt-md">Usuário</span>
                </div>
                <button class="btn btn-secondary flex-start gap-sm p-sm border-sm w-full">
                    <span>+</span>
                    <span class="fnt-md">Adicionar tarefa</span>
                </button>
            </div>

            <div class="menu-search p-sm">
                <input type="text" placeholder="Buscar" class="inpt-primary p-sm border-sm w-full">
            </div>

            <div class="menu-items flex-column gap-sm">
                <button class="btn flex-start gap-sm p-sm">
                    <span>📥</span>
                    <span class="fnt-md">Entrada</span>
                    <span class="count fnt-sm">1</span>
                </button>
                <button class="btn flex-start gap-sm p-sm">
                    <span>📅</span>
                    <span class="fnt-md">Hoje</span>
                </button>
                <button class="btn flex-start gap-sm p-sm">
                    <span>⏰</span>
                    <span class="fnt-md">Em breve</span>
                </button>
                <button class="btn flex-start gap-sm p-sm">
                    <span>🏷️</span>
                    <span class="fnt-md">Filtros e Etiquetas</span>
                </button>
                <button class="btn flex-start gap-sm p-sm">
                    <span>✓</span>
                    <span class="fnt-md">Concluído</span>
                </button>
            </div>

            <div class="menu-projects flex-column gap-sm">
                <h3 class="fnt-md">Favoritos</h3>
                <div class="projects-list flex-column gap-sm">
                    <button class="btn flex-start gap-sm p-sm">
                        <span>#</span>
                        <span class="fnt-md">KANBAN Project</span>
                        <span class="count fnt-sm">3</span>
                    </button>
                </div>
            </div>

            <div class="menu-projects flex-column gap-sm">
                <h3 class="fnt-md">Meus projetos</h3>
                <div class="projects-list flex-column gap-sm">
                    <button class="btn flex-start gap-sm p-sm">
                        <span>#</span>
                        <span class="fnt-md">Meu trabalho ❤️</span>
                        <span class="count fnt-sm">6</span>
                    </button>
                    <button class="btn flex-start gap-sm p-sm">
                        <span>#</span>
                        <span class="fnt-md">Estudos 📚</span>
                        <span class="count fnt-sm">4</span>
                    </button>
                    <button class="btn flex-start gap-sm p-sm">
                        <span>#</span>
                        <span class="fnt-md">Casa 🏠</span>
                        <span class="count fnt-sm">5</span>
                    </button>
                </div>
            </div>
        </div>
    `;
    return menu;
}

loadMenu();