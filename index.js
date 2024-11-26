import user from "./user.js";

async function checkLogin() {
    if (!user.load() || user.Id === null) {
        window.location.href = "login.html";
    }
}

checkLogin();

