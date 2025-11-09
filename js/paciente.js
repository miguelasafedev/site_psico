
function showToast(message, type = 'success', duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;


    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;


    container.appendChild(toast);


    setTimeout(() => {
        toast.classList.add('show');
    }, 10);


    setTimeout(() => {

        toast.classList.remove('show');


        setTimeout(() => {
            if (container.contains(toast)) {
                container.removeChild(toast);
            }
        }, 500);

    }, duration);
}

let pacienteIndexParaExcluir = null;
let pacienteNomeParaExcluir = null;


function abrirModalCadastro() {
    const modal = document.getElementById('modal-cadastro-paciente');
    if (modal) {
        modal.style.display = 'block';
    }
}

function fecharModalCadastro(limparForm = true) {
    const modal = document.getElementById('modal-cadastro-paciente');
    const form = document.getElementById('form-cadastro-paciente');

    if (modal) {
        modal.style.display = 'none';
    }

    if (limparForm && form) {
        form.reset();
    }
}


function abrirModalExclusao(index, nome) {
    const modal = document.getElementById('modal-confirm-exclusao');
    const nomePacienteSpan = document.getElementById('nome-paciente-excluir');

    if (modal) {
        pacienteIndexParaExcluir = index;
        pacienteNomeParaExcluir = nome;
        nomePacienteSpan.textContent = nome;
        modal.style.display = 'block';
    }
}

function fecharModalExclusao() {
    const modal = document.getElementById('modal-confirm-exclusao');
    if (modal) {
        modal.style.display = 'none';
    }

    pacienteIndexParaExcluir = null;
    pacienteNomeParaExcluir = null;
}


function carregarPacientes(filtro = "") {
    const pacientes = JSON.parse(localStorage.getItem("pacientes")) || [];
    const container = document.querySelector(".grid-pacientes");
    container.innerHTML = "";

    const filtroLower = filtro.toLowerCase();

    const filtrados = pacientes.filter(p =>
        p.nome.toLowerCase().includes(filtroLower) ||
        (p.genero && p.genero.toLowerCase().includes(filtroLower)) ||
        p.email.toLowerCase().includes(filtroLower) ||
        p.telefone.includes(filtro)
    );

    if (filtrados.length === 0) {
        container.innerHTML = `<p class="sem-resultados">Nenhum paciente encontrado.</p>`;
        return;
    }

    filtrados.forEach((p, index) => {
        const card = document.createElement("div");
        card.classList.add("paciente-card");

        const generoDisplay = p.genero && p.genero !== 'NaoInformado' ? p.genero : 'N/A';
        const observacaoStatus = p.observacao ? 'Ver Detalhes' : 'N/A';

        card.innerHTML = `
            <div class="avatar">
                <img src="./img/perfil_paciente.png" alt="Avatar de ${p.nome}">
            </div>
            <div class="dados">
                <h3>${p.nome}</h3>
                <p>${p.idade} anos | ${generoDisplay}</p>
                <p><span class="icon">📞</span> ${p.telefone}</p>
                <p><span class="icon">📧</span> ${p.email}</p>
                <p title="${p.observacao || 'Nenhuma observação.'}"><span class="icon">📝</span> Observação: ${observacaoStatus}</p>
                <button class="btn-excluir" onclick="abrirModalExclusao(${index}, '${p.nome}')">🗑️ Excluir</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function cadastrarPaciente(nome, idade, genero, telefone, email, observacao) {
    if (!nome || !idade || !genero || !telefone || !email) {
        showToast("Por favor, preencha todos os campos obrigatórios.", 'error');
        return;
    }

    const novoPaciente = { nome, idade, genero, telefone, email, observacao };
    const pacientes = JSON.parse(localStorage.getItem("pacientes")) || [];
    pacientes.push(novoPaciente);
    localStorage.setItem("pacientes", JSON.stringify(pacientes));


    showToast("Paciente cadastrado com sucesso!", 'success');

    fecharModalCadastro();
    carregarPacientes();
}


function confirmarExclusao() {
    if (pacienteIndexParaExcluir === null) return;

    const pacientes = JSON.parse(localStorage.getItem("pacientes")) || [];


    pacientes.splice(pacienteIndexParaExcluir, 1);


    localStorage.setItem("pacientes", JSON.stringify(pacientes));

    showToast(`Paciente ${pacienteNomeParaExcluir} excluído com sucesso.`, 'success');


    fecharModalExclusao();
    carregarPacientes();
}


document.addEventListener("DOMContentLoaded", () => {

    const btnAbrirModal = document.querySelector(".evento-btn");
    const inputPesquisa = document.querySelector("#barra-pesquisa");
    const formCadastro = document.getElementById('form-cadastro-paciente');


    const btnConfirmarExclusao = document.getElementById('btn-confirmar-exclusao');
    const btnCancelarExclusao = document.getElementById('btn-cancelar-exclusao');

    if (btnAbrirModal) {
        btnAbrirModal.addEventListener("click", (e) => {
            e.preventDefault();
            abrirModalCadastro();
        });
    }

    if (formCadastro) {
        formCadastro.addEventListener('submit', function (e) {
            e.preventDefault();

            const nome = document.getElementById('nome-paciente').value.trim();
            const idade = document.getElementById('idade-paciente').value.trim();
            const genero = document.getElementById('genero-paciente').value.trim();
            const telefone = document.getElementById('telefone-paciente').value.trim();
            const email = document.getElementById('email-paciente').value.trim();
            const observacao = document.getElementById('observacao-paciente').value.trim();

            cadastrarPaciente(nome, idade, genero, telefone, email, observacao);
        });
    }

    const btnCancelar = document.getElementById('btn-cancelar-cadastro');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', (e) => {
            e.preventDefault();
            fecharModalCadastro();
        });
    }

    if (btnConfirmarExclusao) {
        btnConfirmarExclusao.addEventListener('click', confirmarExclusao);
    }

    if (btnCancelarExclusao) {
        btnCancelarExclusao.addEventListener('click', fecharModalExclusao);
    }

    if (inputPesquisa) {
        inputPesquisa.addEventListener("input", (e) => {
            const valor = e.target.value.trim();
            carregarPacientes(valor);
        });
    }

    carregarPacientes();
});