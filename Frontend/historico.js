// 1. CONFIGURAÇÃO DO SUPABASE
const SUPABASE_URL = 'https://qmpsvxtnqrzbgiskbrut.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_awciFXKFYcPV00RMDmKQFg_V4WWkZWM';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log("Supabase conectado com sucesso na Lixeira!");

const mapeamentoCategorias = {
    1: 'Áreas',
    2: 'Refeições',
    3: 'Repúblicas',
    4: 'Segurança'
};

// 2. MENU DROPDOWN E MODO ESCURO
const btnEngrenagem = document.getElementById('btnEngrenagem');
const dropdownMenu = document.getElementById('dropdownMenu');
const btnDarkMode = document.getElementById('btnDarkMode');

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

// 3. BUSCAR OS DADOS NA TABELA HISTORICO_DEMANDAS
async function carregarHistorico() {
    const { data: historico, error } = await supabaseClient
        .from('historico_demandas')
        .select('*')
        .order('data_exclusao', { ascending: false });

    const tbody = document.getElementById('tabela-historico');
    if (!tbody) return;

    if (error) {
        console.error("Erro ao buscar histórico:", error);
        tbody.innerHTML = `<tr><td colspan="6" style="color: red;">Erro ao carregar os dados: ${error.message}</td></tr>`;
        return;
    }

    if (historico.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6">A lixeira está vazia. Nenhuma demanda excluída foi encontrada.</td></tr>`;
        return;
    }

    tbody.innerHTML = ""; 

    historico.forEach((item) => {
        const tr = document.createElement('tr');
        
        let dataFormatada = "Sem data";
        if (item.data_exclusao) {
            const dataTratada = item.data_exclusao.replace(" ", "T");
            const dataObjeto = new Date(dataTratada);
            if (!isNaN(dataObjeto)) {
                dataFormatada = dataObjeto.toLocaleString('pt-BR', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                });
            }
        }

        const nomeCategoria = mapeamentoCategorias[item.categoria_id] || "Outros";
        
        const descricaoCurta = item.descricao ? item.descricao.substring(0, 45) + "..." : "Sem texto";

        let classeStatus = 'pendente';
        if (item.status === 'Em tratativa') classeStatus = 'tratativa';
        if (item.status === 'Resolvido') classeStatus = 'resolvido';

        tr.innerHTML = `
            <td style="font-weight: bold;">#${String(item.demanda_id).padStart(3, '0')}</td>
            <td>${nomeCategoria}</td>
            <td>${item.nome_colaborador || 'Anônimo'}</td>
            <td>${dataFormatada}</td>
            <td><span class="status ${classeStatus}">${item.status}</span></td>
            <td title="${item.descricao}" style="cursor: help; text-align: left; padding-left: 10px;">${descricaoCurta}</td>
        `;
        
        tbody.appendChild(tr);
    });
}

document.addEventListener("DOMContentLoaded", carregarHistorico);