// ABRIR FILTRO

const botaoFiltro = document.getElementById("abrir-filtro");
const painelFiltro = document.getElementById("painel-filtro");

botaoFiltro.addEventListener("click", () => {

    painelFiltro.classList.toggle("ativo");

});


// ACCORDION

const accordions = document.querySelectorAll(".accordion");

accordions.forEach((botao) => {

    botao.addEventListener("click", () => {

        const conteudo =
        botao.nextElementSibling;

        conteudo.classList.toggle("ativo");

    });

});


// DESCRIÇÃO

const botoesDescricao =
document.querySelectorAll(".btn-descricao");

const descricao =
document.getElementById("descricao");

botoesDescricao.forEach((botao) => {

    botao.addEventListener("click", () => {

        descricao.classList.toggle("ativo");

    });

});
// BOTÃO LIXEIRA

const botoesExcluir =
document.querySelectorAll(".fa-trash");

botoesExcluir.forEach((icone) => {

    icone.addEventListener("click", () => {

        const linha =
        icone.closest("tr");

        linha.remove();

    });

});
const botoesEditar =
document.querySelectorAll(".btn-status");

botoesEditar.forEach((botao) => {

    botao.addEventListener("click", () => {

        const linha =
        botao.closest("tr");

        const status =
            linha.querySelector(".status");

        // PENDENTE

        if(status.classList.contains("pendente")){

            status.classList.remove("pendente");

            status.classList.add("tratativa");

            status.textContent =
            "Em tratativa";

        }

        // EM TRATATIVA

        else if(status.classList.contains("tratativa")){

            status.classList.remove("tratativa");

            status.classList.add("resolvido");

            status.textContent =
            "Resolvido";

        }

        // RESOLVIDO

        else{

            status.classList.remove("resolvido");

            status.classList.add("pendente");

            status.textContent =
            "Pendente";

        }

    });

});


const checkboxes = document.querySelectorAll(
    '#painel-filtro input[type="checkbox"]'
);

checkboxes.forEach(function (checkbox) {

    checkbox.addEventListener("change", filtrarTabela);

});

function filtrarTabela() {

    const categoriasSelecionadas = [];
    const statusSelecionados = [];

    // pega os checkbox marcados
    checkboxes.forEach(function (checkbox) {

        if (checkbox.checked) {

            const valor = checkbox.parentElement.textContent.trim();

            // separa categoria e status
            if (
                valor === "Áreas" ||
                valor === "Refeições" ||
                valor === "Repúblicas" ||
                valor === "Segurança"
            ) {
                categoriasSelecionadas.push(valor);
            }

            else {
                statusSelecionados.push(valor);
            }

        }

    });

    // linhas da tabela
    const linhas = document.querySelectorAll("tbody tr");

    linhas.forEach(function (linha) {

        const categoriaLinha =
            linha.querySelector(".categoria").textContent.trim();

        const statusLinha =
            linha.querySelector(".col-status").textContent.trim();

        let mostrar = true;

        // filtro categoria
        if (
            categoriasSelecionadas.length > 0 &&
            !categoriasSelecionadas.includes(categoriaLinha)
        ) {
            mostrar = false;
        }

        // filtro status
        if (
            statusSelecionados.length > 0 &&
            !statusSelecionados.includes(statusLinha)
        ) {
            mostrar = false;
        }

        linha.style.display = mostrar ? "" : "none";

    });

}