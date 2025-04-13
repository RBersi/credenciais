let cameraStream = null;
let nomesConfirmados = [];

// Função para alternar entre telas
function mostrarTela(tela) {
    console.log(`Mostrando tela ${tela}...`);

    // Oculta todas as telas
    document.querySelectorAll('.container > div').forEach(div => div.classList.add('hidden'));

    // Mostra a tela selecionada
    const telaSelecionada = document.getElementById(`tela${tela}`);
    if (telaSelecionada) {
        telaSelecionada.classList.remove('hidden');
    } else {
        console.error(`Tela ${tela} não encontrada.`);
    }

    // Limpa campos desnecessários ao alternar telas
    if (tela === 0) {
        limparCamposTela1();
        limparCamposTela2();
        limparCamposTela3();
    } else if (tela === 1) {
        limparCamposTela2();
        limparCamposTela3();
    } else if (tela === 2) {
        limparCamposTela1();
        limparCamposTela3();
    } else if (tela === 3) {
        limparCamposTela1();
        carregarListaVerificacao();
    }
}

// Garantir que a Tela 0 seja exibida ao carregar a página
document.addEventListener('DOMContentLoaded', function () {
    console.log("DOMContentLoaded acionado!");

    // Força a ocultação de todas as telas explicitamente
    document.querySelectorAll('.container > div').forEach(div => div.classList.add('hidden'));

    // Exibe a Tela 0
    mostrarTela(0);
});

function limparCamposTela1() {
    document.getElementById('tituloCadastro').value = '';
    document.getElementById('nomesCadastro').value = '';
    document.getElementById('qrcodes').innerHTML = '';
}

function limparCamposTela2() {
    document.getElementById('tituloLista').value = '';
    document.getElementById('nomesLista').value = '';
    document.getElementById('lista-verificacao').innerHTML = '';
    nomesConfirmados = [];
}

function limparCamposTela3() {
    pararCamera();
}

function carregarListaVerificacao() {
    const titulo = document.getElementById('tituloLista').value.trim();
    const nomes = document.getElementById('nomesLista').value.split('\n').map(nome => nome.trim()).filter(nome => nome.length > 0);
    const listaVerificacaoDiv = document.getElementById('lista-verificacao');
    listaVerificacaoDiv.innerHTML = `<strong>Título: ${titulo}</strong><br><br>`;

    nomes.forEach(nome => {
        const isChecked = nomesConfirmados.includes(nome);
        const label = document.createElement('label');
        label.innerHTML = `
            <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="toggleConfirmacao('${nome}')">
            ${isChecked ? `<strong>${nome}</strong>` : nome}
        `;
        listaVerificacaoDiv.appendChild(label);
    });
}

function toggleConfirmacao(nome) {
    const index = nomesConfirmados.indexOf(nome);
    if (index === -1) {
        nomesConfirmados.push(nome);
    } else {
        nomesConfirmados.splice(index, 1);
    }
    carregarListaVerificacao();
}
