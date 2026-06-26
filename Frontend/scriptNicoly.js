// 1. CONFIGURAÇÃO DO SUPABASE
const SUPABASE_URL = 'https://qmpsvxtnqrzbgiskbrut.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_awciFXKFYcPV00RMDmKQFg_V4WWkZWM';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log("Supabase conectado com sucesso ao Painel de Gestão!");

// Dicionário para converter o número da categoria_id para o texto correto na tabela
const mapeamentoCategorias = {
    1: 'Áreas',
    2: 'Refeições',
    3: 'Repúblicas',
    4: 'Segurança'
};

// 2. ELEMENTOS DA INTERFACE
const btnEngrenagem = document.getElementById('btnEngrenagem');
const dropdownMenu = document.getElementById('dropdownMenu');
const btnDarkMode = document.getElementById('btnDarkMode');
const botaoFiltro = document.getElementById("abrir-filtro");
const painelFiltro = document.getElementById("painel-filtro");

// 3. MENU DROPDOWN E MODO ESCURO
if (btnEngrenagem && dropdownMenu) {
    btnEngrenagem.addEventListener('click', (event) => {
        event.stopPropagation();
        dropdownMenu.classList.toggle('show');
    });
    document.addEventListener('click', () => dropdownMenu.classList.remove('show'));
}

if (btnDarkMode) {
    btnDarkMode.addEventListener('click', (event) => {
        event.stopPropagation();
        const htmlTag = document.documentElement;
        if (htmlTag.getAttribute('data-theme') === 'dark') {
            htmlTag.removeAttribute('data-theme');
            btnDarkMode.textContent = '🌙 Modo Escuro';
        } else {
            htmlTag.setAttribute('data-theme', 'dark');
            btnDarkMode.textContent = '☀️ Modo Claro';
        }
    });
}

if (botaoFiltro && painelFiltro) {
    botaoFiltro.addEventListener("click", () => {
        painelFiltro.classList.toggle("ativo");
    });
}

// 4. FUNÇÃO PARA BUSCAR AS DEMANDAS NO SUPABASE E EXIBIR NA TABELA
async function carregarDemandas() {
    console.log("Puxando demandas atualizadas do banco de dados...");
    
    const { data: demandas, error } = await supabaseClient
        .from('demandas')
        .select('*')
        .order('id', { ascending: true });

    if (error) {
        console.error("Erro ao buscar demandas:", error);
        alert("Erro ao carregar demandas do banco: " + error.message);
        return;
    }

    const tbody = document.getElementById('tabela-demandas');
    if (!tbody) return;
    
    tbody.innerHTML = ""; 

    demandas.forEach((demanda) => {
        const tr = document.createElement('tr');
        
        const campoData = demanda.data_criacao; 
        let dataFormatada = "Sem data";
        
        if (campoData) {
            // Ajuste para evitar o "Invalid Date" substituindo o espaço por 'T' se necessário
            const dataTratada = campoData.replace(" ", "T");
            const dataObjeto = new Date(dataTratada);
            if (!isNaN(dataObjeto)) {
                dataFormatada = dataObjeto.toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
        }

        const textoReal = demanda.texto_demanda || "Nenhum texto informado.";

        let classeStatus = 'pendente';
        if (demanda.status === 'Em tratativa') classeStatus = 'tratativa';
        if (demanda.status === 'Resolvido') classeStatus = 'resolvido';

        const nomeCategoria = mapeamentoCategorias[demanda.categoria_id] || "Outros";

        // Ajuste de segurança para o atributo do HTML não quebrar com aspas
        const textoInjetar = textoReal.replace(/"/g, '&quot;').replace(/'/g, '&#39;');

        tr.innerHTML = `
            <td>${String(demanda.id).padStart(3, '0')}</td>
            <td class="categoria">${nomeCategoria}</td>
            <td>${demanda.nome_usuario || 'Anônimo'}</td>
            <td>${dataFormatada}</td>
            <td class="col-status">
                <span class="status ${classeStatus}">
                    ${demanda.status}
                </span>
            </td>
            <td class="acoes">
                <button class="btn-descricao" data-texto="${textoInjetar}">
                    <i class="fa-regular fa-pen-to-square"></i>
                </button>
                <button class="btn-status" data-id="${demanda.id}" data-status="${demanda.status}">
                    <i class="fa-solid fa-pencil"></i>
                </button>
                <button class="btn-excluir" data-id="${demanda.id}">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    configurarEventosBotoes();
}

// 5. EVENTOS DOS BOTÕES DE AÇÕES DENTRO DA TABELA
function configurarEventosBotoes() {
    // Botão Ver Descrição
    document.querySelectorAll(".btn-descricao").forEach((botao) => {
        botao.addEventListener("click", (evento) => {
            const elementoBotao = event.currentTarget;
            const texto = elementoBotao.getAttribute("data-texto");
            
            console.log("Texto capturado:", texto);

            // Seleciona o contêiner principal da descrição
            const painel = document.getElementById("descricao");
            
            if (painel) {
                // Força o contêiner a ficar visível e adiciona um estilo de caixinha amigável
                painel.style.display = "block";
                painel.style.marginTop = "20px";
                painel.style.padding = "15px";
                painel.style.backgroundColor = "#f9f9f9"; 
                painel.style.borderLeft = "5px solid #004070"; // Barrinha elegante do lado esquerdo
                painel.style.borderRadius = "4px";
                painel.style.boxShadow = "0 2px 5px rgba(0,0,0,0.1)";

                // Injeta o texto com uma cor contrastante para garantir que não fique invisível
                painel.innerHTML = `
                    <strong style="color: #004070; display: block; margin-bottom: 5px;">Descrição da Demanda:</strong>
                    <p id="texto-exibido" style="color: #333333; margin: 0; font-size: 16px; font-weight: 500;">${texto}</p>
                `;
            }
        });
    });

    // Botão Mudar Status
    document.querySelectorAll(".btn-status").forEach((botao) => {
        botao.addEventListener("click", async (evento) => {
            const elementoBotao = evento.currentTarget;
            const id = elementoBotao.getAttribute("data-id");
            const statusAtual = elementoBotao.getAttribute("data-status");
            let novoStatus = 'Pendente';

            if (statusAtual === 'Pendente') novoStatus = 'Em tratativa';
            else if (statusAtual === 'Em tratativa') novoStatus = 'Resolvido';

            const { error } = await supabaseClient
                .from('demandas')
                .update({ status: novoStatus })
                .eq('id', id);

            if (error) {
                alert("Erro ao atualizar status: " + error.message);
            } else {
                carregarDemandas();
            }
        });
    });

    // Botão Excluir
    document.querySelectorAll(".btn-excluir").forEach((botao) => {
        botao.addEventListener("click", async (evento) => {
            if (confirm("Tem certeza que deseja apagar esta demanda permanentemente?")) {
                const elementoBotao = evento.currentTarget;
                const id = elementoBotao.getAttribute("data-id");
                
                const { error } = await supabaseClient
                    .from('demandas')
                    .delete()
                    .eq('id', id);

                if (error) {
                    alert("Erro ao excluir: " + error.message);
                } else {
                    carregarDemandas();
                }
            }
        });
    });
}

// 6. LÓGICA DE FILTROS DOS CHECKBOXES
const accordions = document.querySelectorAll(".accordion");
accordions.forEach((botao) => {
    botao.addEventListener("click", () => {
        const conteudo = botao.nextElementSibling;
        if (conteudo) conteudo.classList.toggle("ativo");
    });
});

const checkboxes = document.querySelectorAll('#painel-filtro input[type="checkbox"]');
checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", filtrarTabelaEmTela);
});

function filtrarTabelaEmTela() {
    const categoriesSelecionadas = [];
    const statusSelecionados = [];

    checkboxes.forEach((checkbox) => {
        if (checkbox.checked) {
            const valor = checkbox.parentElement.textContent.trim();
            if (["Áreas", "Refeições", "Repúblicas", "Segurança"].includes(valor)) {
                categoriesSelecionadas.push(valor);
            } else {
                statusSelecionados.push(valor);
            }
        }
    });

    const linhas = document.querySelectorAll("#tabela-demandas tr");
    linhas.forEach((linha) => {
        const catElement = linha.querySelector(".categoria");
        const statElement = linha.querySelector(".status");

        if (!catElement || !statElement) return;

        const categoriaLinha = catElement.textContent.trim();
        const statusLinha = statElement.textContent.trim();

        let mostrar = true;

        if (categoriesSelecionadas.length > 0 && !categoriesSelecionadas.includes(categoriaLinha)) {
            mostrar = false;
        }
        if (statusSelecionados.length > 0 && !statusSelecionados.includes(statusLinha)) {
            mostrar = false;
        }

        linha.style.display = mostrar ? "" : "none";
    });
}

// Executa a busca automática
document.addEventListener("DOMContentLoaded", carregarDemandas);