// js/agenda.js

const MODAL_ID = 'modal-agendamento';
const FORM_ID = 'form-agendamento';
const SELECT_PACIENTE_ID = 'paciente-select';
const EVENTS_CONTAINER_CLASS = "events-list";
const SESSOES_KEY = "eventos";
const PACIENTES_KEY = "pacientes";

let sessaoIndexParaExcluir = null;
let sessaoNomeParaExcluir = null;


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


function lerSessoes() {
    return JSON.parse(localStorage.getItem(SESSOES_KEY)) || [];
}
function salvarSessoes(arr) {
    localStorage.setItem(SESSOES_KEY, JSON.stringify(arr));
}
function lerPacientes() {
    return JSON.parse(localStorage.getItem(PACIENTES_KEY)) || [];
}

function preencherSelectPacientes() {
    const pacientes = lerPacientes();
    const select = document.getElementById(SELECT_PACIENTE_ID);

    select.innerHTML = '<option value="">Selecione um Paciente</option>';

    if (pacientes.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'Nenhum paciente cadastrado.';
        option.disabled = true;
        select.appendChild(option);
        return;
    }

    pacientes.forEach(p => {
        const option = document.createElement('option');
        option.value = p.nome;
        option.textContent = p.nome;
        select.appendChild(option);
    });
}

function abrirModalAgendamento() {
    const modal = document.getElementById(MODAL_ID);
    if (modal) {
        modal.style.display = 'block';
        preencherSelectPacientes();
    }
}

function fecharModalAgendamento() {
    const modal = document.getElementById(MODAL_ID);
    const form = document.getElementById(FORM_ID);

    if (modal) {
        modal.style.display = 'none';
    }
    if (form) {
        form.reset();
    }
}


function abrirModalExclusao(index, nome) {
    const modal = document.getElementById('modal-confirm-exclusao');
    const nomePacienteSpan = document.getElementById('paciente-sessao-excluir');

    if (modal) {
        sessaoIndexParaExcluir = index;
        sessaoNomeParaExcluir = nome;
        nomePacienteSpan.textContent = nome;
        modal.style.display = 'block';
    }
}

function fecharModalExclusao() {
    const modal = document.getElementById('modal-confirm-exclusao');
    if (modal) {
        modal.style.display = 'none';
    }
    sessaoIndexParaExcluir = null;
    sessaoNomeParaExcluir = null;
}



function agendarEvento(paciente, tipo, data, horario) {
    if (!paciente || !tipo || !data || !horario) {

        showToast("Por favor, preencha todos os campos do agendamento.", 'error');
        return;
    }

    const novoEvento = {
        paciente,
        tipo,
        data,
        horario,
        criadoEm: new Date().toISOString()
    };

    const eventos = lerSessoes();
    eventos.push(novoEvento);
    salvarSessoes(eventos);


    showToast(`Consulta agendada para ${paciente} em ${data} às ${horario}!`, 'success');

    fecharModalAgendamento();
    renderizarSessoes();
}


function excluirSessao(index) {
    const sessoes = lerSessoes();
    const nomePaciente = sessoes[index] ? sessoes[index].paciente : "esta sessão";


    abrirModalExclusao(index, nomePaciente);
}


function confirmarExclusao() {
    if (sessaoIndexParaExcluir === null) return;

    const sessoes = lerSessoes();


    sessoes.splice(sessaoIndexParaExcluir, 1);


    salvarSessoes(sessoes);


    showToast(`Sessão com ${sessaoNomeParaExcluir} excluída com sucesso.`, 'success');


    fecharModalExclusao();
    renderizarSessoes();
}


function escapeHtml(str) {
    if (typeof str !== "string") return "";
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
}

function atualizarResumo(sessoes) {
    const listaSessoes = sessoes || lerSessoes();

    const total = listaSessoes.length;
    const horas = (total * 1.0).toFixed(1);
    const maxSessoes = 20;
    const ocupacao = Math.min(Math.round((total / maxSessoes) * 100), 100);

    const consultasSpan = document.getElementById("consultas-semanais");
    const horasSpan = document.getElementById("horas-trabalho");
    const ocupacaoSpan = document.getElementById("taxa-ocupacao");

    if (consultasSpan) consultasSpan.textContent = total;
    if (horasSpan) horasSpan.textContent = `${horas}h`;
    if (ocupacaoSpan) ocupacaoSpan.textContent = `${ocupacao}%`;
}


function renderizarSessoes() {
    const sessoes = lerSessoes();
    let eventsContainer = document.querySelector(`.${EVENTS_CONTAINER_CLASS}`);

    if (eventsContainer) {
        eventsContainer.innerHTML = "";
    } else {
        eventsContainer = document.createElement("div");
        eventsContainer.className = EVENTS_CONTAINER_CLASS;
        document.querySelector(".agenda-box")?.appendChild(eventsContainer);
    }

    if (sessoes.length === 0) {
        eventsContainer.innerHTML = `<p class="sem-agendamento">Nenhuma sessão agendada.</p>`;
        atualizarResumo(sessoes);
        return;
    }

    sessoes.forEach((s, idx) => {

        const dataFormatada = s.data.split('-').reverse().join('/');
        const box = document.createElement("div");
        box.classList.add("paciente-box");
        box.innerHTML = `
            <img src="./img/perfil-icon.png" alt="">
            <div class="info-paciente">
                <h1 class="nome-paciente">${escapeHtml(s.paciente)}</h1>
                <p class="tipo-consulta">${escapeHtml(s.tipo)} - ${dataFormatada}</p>
            </div>
            <div class="info-horario">
                <p class="hora-texto">${escapeHtml(s.horario)}</p>
            </div>
            <button type="button" class="btn-excluir-js" data-index="${idx}" data-nome-paciente="${escapeHtml(s.paciente)}">🗑️ Excluir</button>
        `;

        eventsContainer.appendChild(box);
    });

    eventsContainer.querySelectorAll('.btn-excluir-js').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = e.target.getAttribute('data-index');
            const nome = e.target.getAttribute('data-nome-paciente');
            abrirModalExclusao(parseInt(index), nome);
        });
    });

    atualizarResumo(sessoes);
}

function atualizarDataAtual() {
    const dataElement = document.getElementById("data-atual");
    if (dataElement) {
        const hoje = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const diaSemana = hoje.toLocaleDateString('pt-BR', { weekday: 'long' });
        const dataCompleta = hoje.toLocaleDateString('pt-BR', options);
        dataElement.textContent = `${diaSemana}, ${dataCompleta}`;
    }
}


document.addEventListener("DOMContentLoaded", () => {
    const btnAbrirModal = document.getElementById("btn-criar-evento");
    const formAgendamento = document.getElementById(FORM_ID);
    const btnConfirmarExclusao = document.getElementById('btn-confirmar-exclusao');
    const btnCancelarExclusao = document.getElementById('btn-cancelar-exclusao');


    if (btnAbrirModal) {
        btnAbrirModal.addEventListener("click", (e) => {
            e.preventDefault();
            abrirModalAgendamento();
        });
    }

    if (formAgendamento) {
        formAgendamento.addEventListener('submit', function (e) {
            e.preventDefault();

            const paciente = document.getElementById('paciente-select').value.trim();
            const tipo = document.getElementById('tipo-consulta').value.trim();
            const data = document.getElementById('data-consulta').value.trim();
            const horario = document.getElementById('horario-consulta').value.trim();

            agendarEvento(paciente, tipo, data, horario);
        });
    }

    if (btnConfirmarExclusao) {
        btnConfirmarExclusao.addEventListener('click', confirmarExclusao);
    }

    if (btnCancelarExclusao) {
        btnCancelarExclusao.addEventListener('click', fecharModalExclusao);
    }

    renderizarSessoes();
    atualizarDataAtual();
});