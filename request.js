const api = "https://personal-ga2xwx9j.outsystemscloud.com/TaskBoard_CS/rest/TaskBoard/";

const request = async (endpoint, method, body) => {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(`${api}${endpoint}`, options);

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return response.json();
    }
    
    return {};
};


// Armazena as funções de requisição
const requests = {
    // Person
    GetPeople: async () => await request(`People`, "GET"),
    GetPersonById: async (personId) => await request(`PersonById?PersonId=${personId}`, "GET"),
    GetPersonByEmail: async (email) => await request(`GetPersonByEmail?Email=${email}`, "GET"),
    GetPersonConfig: async (personId) => await request(`PersonConfigById?PersonId=${personId}`, "GET"),
    ConfigPersonTheme: async (personId, theme) => await request(`ConfigPersonTheme?PersonId=${personId}&Theme=${theme}`, "PATCH"),

    // Boards
    GetBoards: async () => {
        try {
            const response = await request(`Boards`, "GET");
            console.log('Resposta da API:', response); // Debug
            
            if (Array.isArray(response)) {
                return response.map(board => ({
                    ...board,
                    UserId: board.UserId || board.CreatedBy
                }));
            }
            return [];
        } catch (error) {
            console.error('Erro ao buscar boards:', error);
            return [];
        }
    },
    GetBoardById: async (boardId) => await request(`Board?BoardId=${boardId}`, "GET"),
    CreateBoard: async (board) => await request(`Board`, "POST", board),
    UpdateBoard: async (board) => await request(`Board`, "PUT", board),
    DeleteBoard: async (boardId) => await request(`Board?BoardId=${boardId}`, "DELETE"),


    // Columns
    GetColumnsByBoardId: async (boardId) => {
        try {
            const response = await request(`ColumnByBoardId?BoardId=${boardId}`, "GET");
            return Array.isArray(response) ? response : [];
        } catch (error) {
            console.error('Erro ao buscar colunas:', error);
            return [];
        }
    },
    CreateColumn: async (column) => await request(`Column`, "POST", column),
    UpdateColumn: async (column) => await request(`Column`, "PUT", column),
    DeleteColumn: async (columnId) => await request(`Column?ColumnId=${columnId}`, "DELETE"),

    // Tasks
    GetTasksByBoardId: async (boardId) => await request(`TasksByBoardId?BoardId=${boardId}`, "GET"),
    GetTasksByColumnId: async (columnId) => await request(`TasksByColumnId?ColumnId=${columnId}`, "GET"),
    CreateTask: async (task) => await request(`Task`, "POST", task),
    DeleteTask: async (taskId) => await request(`Task?TaskId=${taskId}`, "DELETE"),
    UpdateTask: async (task) => await request(`Task`, "PUT", task),

    // Themes
    GetThemes: async () => await request(`Themes`, "GET")
}

export default requests;