// Variáveis globais para armazenar dados
let listaAtual = {
    titulo: "",
    nomes: []
};

// Função para alternar entre telas
function changeScreen(screenId) {
    const screens = document.querySelectorAll(".screen");
    screens.forEach(screen => screen.classList.remove("active"));
    document.getElementById(screenId).classList.add("active");
}

// Função para inicializar o sistema
document.addEventListener("DOMContentLoaded", () => {
    console.log("Sistema iniciado.");
    // Inicialmente, exibe a tela de início
    changeScreen("inicio");
});

// Função para gerar QR Codes
function gerarQRCodes() {
    const titulo = document.getElementById("titulo-lista").value.trim();
    const nomesTexto = document.getElementById("nomes-lista").value.trim();

    if (!titulo || !nomesTexto) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    const nomes = nomesTexto.split("\n").map(nome => nome.trim()).filter(nome => nome !== "");

    if (nomes.length === 0) {
        alert("Insira pelo menos um nome válido.");
        return;
    }

    listaAtual.titulo = titulo;
    listaAtual.nomes = nomes;

    // Exibir QR Codes (apenas visualização por enquanto)
    alert(`QR Codes gerados para a lista "${titulo}" com os seguintes nomes:\n${nomes.join(", ")}`);
}

// Função para baixar QR Codes como um arquivo ZIP
function baixarQRCodes() {
    if (listaAtual.nomes.length === 0) {
        alert("Nenhuma lista foi gerada ainda.");
        return;
    }

    // Simulação de download de arquivo ZIP
    alert(`Baixando arquivo ZIP com os QR Codes da lista "${listaAtual.titulo}".`);
}

// Função para verificar lista
function verificarLista() {
    const titulo = document.getElementById("titulo-lista-inserir").value.trim();
    const nomesTexto = document.getElementById("nomes-lista-inserir").value.trim();

    if (!titulo || !nomesTexto) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    const nomes = nomesTexto.split("\n").map(nome => nome.trim()).filter(nome => nome !== "");

    if (nomes.length === 0) {
        alert("Insira pelo menos um nome válido.");
        return;
    }

    listaAtual.titulo = titulo;
    listaAtual.nomes = nomes;

    // Atualizar a tela de verificação
    document.getElementById("titulo-verificacao").textContent = titulo;
    const listaVerificacao = document.getElementById("nomes-verificacao");
    listaVerificacao.innerHTML = "";

    nomes.forEach(nome => {
        const li = document.createElement("li");
        li.innerHTML = `
            <label>
                <input type="checkbox" class="nome-checkbox" data-nome="${nome}">
                ${nome}
            </label>
        `;
        listaVerificacao.appendChild(li);
    });

    // Alternar para a tela de verificação
    changeScreen("verificar-lista");
}

// Função para ler QR Code via arquivo
function enviarQRCode() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = (event) => {
        const file = event.target.files[0];
        if (!file) {
            alert("Nenhum arquivo selecionado.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target.result;
            processarQRCode(result);
        };
        reader.readAsDataURL(file);
    };

    input.click();
}

// Função para processar o QR Code lido
function processarQRCode(qrData) {
    try {
        const mensagem = document.getElementById("mensagem-notificacao");

        if (!qrData.includes(listaAtual.titulo)) {
            mensagem.textContent = "QR Code não corresponde à lista atual.";
            return;
        }

        const nome = qrData.replace(listaAtual.titulo, "").trim();
        const checkbox = Array.from(document.querySelectorAll(".nome-checkbox"))
            .find(checkbox => checkbox.dataset.nome === nome);

        if (checkbox) {
            checkbox.checked = true;
            mensagem.textContent = `Nome "${nome}" encontrado e marcado.`;
        } else {
            mensagem.textContent = "Nome não encontrado na lista.";
        }
    } catch (error) {
        console.error("Erro ao processar QR Code:", error);
        alert("Erro ao processar o QR Code.");
    }
}

// Função para abrir a câmera
function abrirCamera() {
    const video = document.getElementById("video-camera");
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then(stream => {
            video.srcObject = stream;
            video.play();
        })
        .catch(error => {
            console.error("Erro ao acessar a câmera:", error);
            alert("Não foi possível acessar a câmera.");
        });
}

// Função para encerrar a câmera
function encerrarCamera() {
    const video = document.getElementById("video-camera");
    const stream = video.srcObject;

    if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        video.srcObject = null;
    }

    changeScreen("verificar-lista");
}

// Adicionar eventos aos botões
document.getElementById("gerar-qrcode").addEventListener("click", gerarQRCodes);
document.getElementById("baixar-qrcode").addEventListener("click", baixarQRCodes);
document.getElementById("verificar-lista").addEventListener("click", verificarLista);
document.getElementById("enviar-qrcode").addEventListener("click", enviarQRCode);
document.getElementById("camera").addEventListener("click", abrirCamera);
