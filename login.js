import requests from "./request.js";
import user from "./user.js";

// Elementos do DOM
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const emailError = document.querySelector('.email-error');
const loadingState = document.getElementById('loading-state');
const errorState = document.getElementById('error-state');
const errorMessage = errorState.querySelector('.error-message');

// Configurações
const ANIMATION_DURATION = 300;
const DEBOUNCE_DELAY = 300;

// Função para debounce
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Funções de UI
function toggleElement(element, show, useAnimation = true) {
    if (show) {
        element.classList.remove('hidden');
        if (useAnimation) {
            requestAnimationFrame(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            });
        }
    } else {
        element.style.opacity = '0';
        element.style.transform = 'translateY(10px)';
        setTimeout(() => {
            element.classList.add('hidden');
        }, useAnimation ? ANIMATION_DURATION : 0);
    }
}

function showLoading() {
    toggleElement(loginForm, false);
    toggleElement(loadingState, true);
}

function hideLoading() {
    toggleElement(loadingState, false);
    toggleElement(loginForm, true);
}

function showError(message) {
    errorState.classList.remove('hidden');
    errorMessage.textContent = message;
    
    // Remove e readiciona a animação de shake
    errorState.classList.remove('animate-shake');
    void errorState.offsetWidth; // Força reflow
    errorState.classList.add('animate-shake');
}

function hideError() {
    toggleElement(errorState, false);
}

function showEmailError(message) {
    emailError.classList.remove('hidden');
    emailError.querySelector('span').textContent = message;
    emailInput.classList.add('border-red-500');
    emailInput.classList.remove('border-gray-200', 'focus:border-blue-500');
    
    // Adiciona animação de shake no input
    emailInput.classList.remove('animate-shake');
    void emailInput.offsetWidth;
    emailInput.classList.add('animate-shake');
}

function hideEmailError() {
    emailError.classList.add('hidden');
    emailError.querySelector('span').textContent = '';
    emailInput.classList.remove('border-red-500', 'animate-shake');
    emailInput.classList.add('border-gray-200', 'focus:border-blue-500');
}

// Validação de email
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    
    if (!email) {
        showEmailError('O email é obrigatório');
        return false;
    }
    
    if (!isValid) {
        showEmailError('Por favor, insira um email válido');
        return false;
    }
    
    hideEmailError();
    return true;
}

// Event Listeners
emailInput.addEventListener('input', debounce((e) => {
    if (e.target.value) {
        validateEmail(e.target.value);
    } else {
        hideEmailError();
    }
}, DEBOUNCE_DELAY));

// Efeitos visuais do input
emailInput.addEventListener('focus', () => {
    emailInput.parentElement.classList.add('scale-[1.02]');
});

emailInput.addEventListener('blur', () => {
    emailInput.parentElement.classList.remove('scale-[1.02]');
});

// Função de login
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
        console.error('Erro na requisição:', error);
        return {
            success: false,
            error: "Ocorreu um erro ao verificar o email. Por favor, tente novamente."
        };
    }
}

// Submit do formulário
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value;
    
    // Limpa estados anteriores
    hideError();
    
    // Valida o email
    if (!validateEmail(email)) {
        return;
    }
    
    try {
        showLoading();
        
        const result = await loginAction(email);
        
        if (!result.success) {
            hideLoading();
            showError(result.error);
            return;
        }

        // Salva os dados do usuário
        user.Id = result.data.Id;
        user.Name = result.data.Name;
        user.Email = result.data.Email;
        user.BirthDate = result.data.BirthDate;
        user.PhoneNumber = result.data.PhoneNumber;
        user.save();
        
        // Animação de saída
        document.body.style.opacity = '0';
        document.body.style.transform = 'scale(1.02)';
        
        setTimeout(() => {
            window.location.href = "index.html";
        }, ANIMATION_DURATION);
        
    } catch (error) {
        console.error('Erro:', error);
        hideLoading();
        showError('Erro ao realizar login. Por favor, tente novamente.');
    }
});