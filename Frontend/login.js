// 1. CONFIGURAÇÃO DO SUPABASE
const SUPABASE_URL = 'https://qmpsvxtnqrzbgiskbrut.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_awciFXKFYcPV00RMDmKQFg_V4WWkZWM';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log("Cliente Supabase inicializado na tela de login!");

// 2. ELEMENTOS DA INTERFACE (Declarados de forma segura)
const btnEngrenagem = document.getElementById('btnEngrenagem');
const dropdownMenu = document.getElementById('dropdownMenu');
const btnDarkMode = document.getElementById('btnDarkMode'); 

// 3. LOGICA DA ENGRENAGEM E DROPDOWN
if (btnEngrenagem && dropdownMenu) {
    btnEngrenagem.addEventListener('click', (event) => {
        event.stopPropagation();
        dropdownMenu.classList.toggle('show');
    });

    document.addEventListener('click', () => {
        dropdownMenu.classList.remove('show');
    });
}

// 4. LÓGICA DO MODO ESCURO
if (btnDarkMode) {
    btnDarkMode.addEventListener('click', (event) => {
        event.stopPropagation(); 
        const htmlTag = document.documentElement;
        const isDark = htmlTag.getAttribute('data-theme') === 'dark';

        if (isDark) {
            htmlTag.removeAttribute('data-theme');
            btnDarkMode.textContent = '🌙 Modo Escuro';
        } else {
            htmlTag.setAttribute('data-theme', 'dark');
            btnDarkMode.textContent = '☀️ Modo Claro';
        }
    });
}

// 5. LÓGICA DE LOGIN REAL COM O SUPABASE
const formLogin = document.getElementById('formLogin');
if (formLogin) {
    formLogin.addEventListener('submit', async function(evento) {
        evento.preventDefault(); 

        // Sistema de segurança contra bots
        const armadilha = document.getElementById('campoArmadilha') ? document.getElementById('campoArmadilha').value : "";
        if (armadilha !== "") {
            console.warn("Bloqueado pelo sistema de segurança (Bot detectado).");
            return; 
        }

        const matricula = document.getElementById('matriculaAdmin').value.trim();
        const senha = document.getElementById('senhaAdmin').value.trim();

        console.log("Verificando credenciais no banco...");

        const { data, error } = await supabaseClient
            .from('administradores')
            .select('*')
            .eq('matricula', matricula)
            .eq('senha', senha);

        if (error) {
            console.error("Erro ao consultar banco:", error);
            alert("Erro no servidor ao tentar logar: " + error.message);
            return;
        }

        if (data && data.length > 0) {
            alert("Login realizado com sucesso! Bem-vindo.");
            window.location.href = "tabela_reclamacao.html";
        } else {
            alert("Matrícula ou senha incorretas. Tente novamente.");
        }
    });
}