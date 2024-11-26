import requests from "./request.js";
import user from "./user.js";

async function loginAction(email) {
    try {
        const response = await requests.GetPersonByEmail(email);
        
        if (!response || response.length === 0) {
            return {
                success: false,
                error: "Email não encontrado. Por favor, verifique e tente novamente."
            };
        }

        return {
            success: true,
            data: Array.isArray(response) ? response[0] : response
        };

    } catch (error) {
        return {
            success: false,
            error: "Ocorreu um erro ao verificar o email. Tente novamente."
        };
    }
}


document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitButton = e.target.querySelector('button[type="submit"]');
    const email = document.getElementById('email').value;
    
    try {
        submitButton.disabled = true;
        submitButton.innerHTML = 'Carregando...';
        
        const result = await loginAction(email);
        
        if (!result.success) {
            alert(result.error);
            return;
        }

        user.Id = result.data.Id;
        user.Name = result.data.Name;
        user.Email = result.data.Email;
        user.BirthDate = result.data.BirthDate;
        user.PhoneNumber = result.data.PhoneNumber;
        user.save();
        
        window.location.href = "index.html";
        
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao realizar login. Tente novamente.');
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = 'Entrar';
    }
});