const botaoToggle = document.getElementById('toggleIdentificar');
const areaEscondida = document.getElementById('areaIdentificacao');
const campoNome = document.getElementById('nomeUsuario');
const caixaTexto = document.getElementById('textoDemanda');

const btnEngrenagem = document.getElementById('btnEngrenagem');
const dropdownMenu = document.getElementById('dropdownMenu');
const btnDarkMode = document.getElementById('btnDarkMode'); 


botaoToggle.addEventListener('change', function() {
    if (this.checked) {
        areaEscondida.style.display = 'block';
        campoNome.setAttribute('required', 'true');
        caixaTexto.classList.remove('txt-grande');
        caixaTexto.classList.add('txt-curto');
    } else {
        areaEscondida.style.display = 'none';
        campoNome.value = '';
        campoNome.removeAttribute('required');
        caixaTexto.classList.remove('txt-curto');
        caixaTexto.classList.add('txt-grande');
    }
});


btnEngrenagem.addEventListener('click', (event) => {
    event.stopPropagation();
    dropdownMenu.classList.toggle('show');
});

document.addEventListener('click', () => {
    dropdownMenu.classList.remove('show');
});


document.getElementById('formDemandas').addEventListener('submit', function(evento) {
    evento.preventDefault(); 

    
    const armadilha = document.getElementById('campoArmadilha').value;
    
    
    if (armadilha !== "") {
        console.warn("Bloqueado pelo sistema de segurança (Bot detectado).");
        
        return; 
    }

    
    alert("Formulário validado com segurança e enviado com sucesso!");
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

const SUPABASE_URL = 'https://qmpsvxtnqrzbgiskbrut.supabase.co/rest/v1/';
const SUPABASE_ANON_KEY = 'sb_publishable_awciFXKFYcPV00RMDmKQFg_V4WWkZWM';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const formDemandas = document.getElementById('formDemandas');
const categoriaDemanda = document.getElementById('categoriaDemanda');

const toggleIdentificar = document.getElementById('toggleIdentificar');
const textoDemanda = document.getElementById('textoDemanda');
const nomeUsuarioInput = document.getElementById('nomeUsuario');

formDemandas.addEventListener('submit' , async (event) => {
event.preventDefault();

const campoArmadilha = document.getElementById('campoArmadilha').value;

if (campoArmadilha !== "") {
    console.log("Bot detectado.");
    return;
}

let nomeFinal = 'Anônimo';
if (toggleIdentificar.checked && nomeUsuarioInput.value.trim() !== "") {
    nomeFinal = nomeUsuarioInput.value.trim();
}

const { data, error } = await supabase.from('demandas').insert([
{
categoria: categoriaDemanda.value,
deseja_identificar: toggleIdentificar.checked,
nome_usuario: nomeFinal,
texto_demanda: textoDemanda.value,
status: 'Pendente'
}
]);

if (error) {
    alert('Erro ao enviar o registro: ' + error.message);
    console.error(error);
} else {
    alert('Registro enviado com sucesso para o Canal Fale Fácil!');
    formDemandas.reset();
}
});