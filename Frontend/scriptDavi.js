// 1. CONFIGURAÇÃO DO SUPABASE (Nome alterado para evitar conflito com o CDN)
const SUPABASE_URL = 'https://qmpsvxtnqrzbgiskbrut.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_awciFXKFYcPV00RMDmKQFg_V4WWkZWM';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log("Cliente Supabase criado com sucesso!");

// 2. ELEMENTOS DO FORMULÁRIO E INTERFACE
const btnEngrenagem = document.getElementById('btnEngrenagem');
const dropdownMenu = document.getElementById('dropdownMenu');
const btnDarkMode = document.getElementById('btnDarkMode');

const form = document.getElementById('formDemandas');
const categoria = document.getElementById('categoriaDemanda');
const texto = document.getElementById('textoDemanda');
const toggle = document.getElementById('toggleIdentificar');
const areaEscondida = document.getElementById('areaIdentificacao');
const campoNome = document.getElementById('nomeUsuario');

// 3. MENU DROPDOWN E MODO ESCURO
if (btnEngrenagem && dropdownMenu) {
    btnEngrenagem.addEventListener('click', (event) => {
        event.stopPropagation();
        dropdownMenu.classList.toggle('show');
    });

    document.addEventListener('click', () => {
        dropdownMenu.classList.remove('show');
    });
}

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

// 4. LÓGICA DO TOGGLE IDENTIFICAR (MOSTRAR/ESCONDER NOME)
if (toggle && areaEscondida && campoNome && texto) {
    toggle.addEventListener('change', function() {
        if (this.checked) {
            areaEscondida.style.display = 'block';
            campoNome.setAttribute('required', 'true');
            texto.classList.remove('txt-grande');
            texto.classList.add('txt-curto');
        } else {
            areaEscondida.style.display = 'none';
            campoNome.value = '';
            campoNome.removeAttribute('required');
            texto.classList.remove('txt-curto');
            texto.classList.add('txt-grande');
        }
    });
}

// 5. ENVIO DOS DADOS PARA O SUPABASE
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Sistema de segurança contra bots
        const armadilha = document.getElementById('campoArmadilha').value;
        if (armadilha !== "") {
            console.warn("Bloqueado pelo sistema de segurança (Bot detectado).");
            return;
        }

        let nomeFinal = 'Anônimo';
        if (toggle.checked && campoNome.value.trim() !== "") {
            nomeFinal = campoNome.value.trim();
        }

        console.log("Enviando dados para o banco...");

        const { data, error } = await supabaseClient
            .from('demandas')
            .insert([
                {
                    categoria_id: Number(categoria.value),
                    texto_demanda: texto.value,
                    deseja_identificar: toggle.checked,
                    nome_usuario: nomeFinal,
                    status: 'Pendente'
                }
            ]);

        if (error) {
            console.error("Erro do Supabase:", error);
            alert("Erro ao enviar: " + error.message);
        } else {
            alert("Registro enviado com sucesso!");
            form.reset();
            if (toggle) toggle.checked = false;
            if (areaEscondida) areaEscondida.style.display = 'none';
        }
    });
}

// 6. LÓGICA DE FILTROS E TABELAS (Para a página de gerenciamento)
const botaoFiltro = document.getElementById("abrir-filtro");
const painelFiltro = document.getElementById("painel-filtro");

if (botaoFiltro && painelFiltro) {
    botaoFiltro.addEventListener("click", () => {
        painelFiltro.classList.toggle("ativo");
    });
}

const accordions = document.querySelectorAll(".accordion");
accordions.forEach((botao) => {
    botao.addEventListener("click", () => {
        const conteudo = botao.nextElementSibling;
        if (conteudo) conteudo.classList.toggle("ativo");
    });
});

const checkboxes = document.querySelectorAll('#painel-filtro input[type="checkbox"]');
checkboxes.forEach(function (checkbox) {
    checkbox.addEventListener("change", filtrarTabela);
});

function filtrarTabela() {
    const categoriasSelecionadas = [];
    const statusSelecionados = [];

    checkboxes.forEach(function (checkbox) {
        if (checkbox.checked) {
            const valor = checkbox.parentElement.textContent.trim();
            if (["Áreas", "Refeições", "Repúblicas", "Segurança"].includes(valor)) {
                categoriasSelecionadas.push(valor);
            } else {
                statusSelecionados.push(valor);
            }
        }
    });

    const linhas = document.querySelectorAll("tbody tr");
    linhas.forEach(function (linha) {
        const catElement = linha.querySelector(".categoria");
        const statElement = linha.querySelector(".col-status");

        if (!catElement || !statElement) return;

        const categoriaLinha = catElement.textContent.trim();
        const statusLinha = statElement.textContent.trim();

        let mostrar = true;

        if (categoriasSelecionadas.length > 0 && !categoriasSelecionadas.includes(categoriaLinha)) {
            mostrar = false;
        }
        if (statusSelecionados.length > 0 && !statusSelecionados.includes(statusLinha)) {
            mostrar = false;
        }

        linha.style.display = mostrar ? "" : "none";
    });
}

// Botões de excluir e editar status da tabela
document.querySelectorAll(".fa-trash").forEach((icone) => {
    icone.addEventListener("click", () => {
        const linha = icone.closest("tr");
        if (linha) linha.remove();
    });
});

document.querySelectorAll(".btn-status").forEach((botao) => {
    botao.addEventListener("click", () => {
        const linha = botao.closest("tr");
        if (!linha) return;
        const status = linha.querySelector(".status");
        if (!status) return;

        if (status.classList.contains("pendente")) {
            status.classList.remove("pendente");
            status.classList.add("tratativa");
            status.textContent = "Em tratativa";
        } else if (status.classList.contains("tratativa")) {
            status.classList.remove("tratativa");
            status.classList.add("resolvido");
            status.textContent = "Resolvido";
        } else {
            status.classList.remove("resolvido");
            status.classList.add("pendente");
            status.textContent = "Pendente";
        }
    });
});