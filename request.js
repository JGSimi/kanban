const api = "https://personal-ga2xwx9j.outsystemscloud.com/TaskBoard_CS/rest/TaskBoard/"

const request = async (endpoint, method, body) => {
    const response = await fetch(`${api}${endpoint}`, {
        method,
        body
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
}

const requests = {
    // Person
    GetPeople: async () => await request(`People`, "GET"),
    GetPersonById: async (personId) => await request(`PersonById?PersonId=${personId}`, "GET"),
    GetPersonByEmail: async (email) => await request(`GetPersonByEmail?Email=${email}`, "GET"),
    GetPersonConfig: async (personId) => await request(`PersonConfigById?PersonId=${personId}`, "GET"),
    ConfigPersonTheme: async (personId, theme) => await request(`ConfigPersonTheme?PersonId=${personId}&Theme=${theme}`, "PATCH"),

    // Boards
    GetBoards: async () => await request(`Boards`, "GET"),
    GetBoardById: async (boardId) => await request(`Board?BoardId=${boardId}`, "GET"),
    CreateBoard: async (board) => await request(`Board`, "POST", board),
    UpdateBoard: async (board) => await request(`Board`, "PUT", board),
    DeleteBoard: async (boardId) => await request(`Board?BoardId=${boardId}`, "DELETE"),


    // Columns
    GetColumnsByBoardId: async (boardId) => await request(`ColumnByBoardId?BoardId=${boardId}`, "GET"),
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