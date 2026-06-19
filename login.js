const btnEngrenagem = document.getElementById('btnEngrenagem');
const dropdownMenu = document.getElementById('dropdownMenu');
const btnDarkMode = document.getElementById('btnDarkMode'); 


btnEngrenagem.addEventListener('click', (event) => {
    event.stopPropagation();
    dropdownMenu.classList.toggle('show');
});

document.addEventListener('click', () => {
    dropdownMenu.classList.remove('show');
});


document.getElementById('formLogin').addEventListener('submit', function(evento) {
    evento.preventDefault(); 

    const armadilha = document.getElementById('campoArmadilha').value;
    
    if (armadilha !== "") {
        console.warn("Bloqueado pelo sistema de segurança (Bot detectado).");
        return; 
    }

    
    const matricula = document.getElementById('matriculaAdmin').value;
    const senha = document.getElementById('senhaAdmin').value;

    
    alert(`Tentativa de login realizada com segurança!\nMatrícula informada: ${matricula}`); 
    window.location.href = "tabela_reclamacao.html";
});


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
