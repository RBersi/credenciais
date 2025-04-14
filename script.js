// Variáveis globais para armazenar dados
let listaAtual = {
    titulo: "",
    nomes: []
};

// Função para alternar entre telas
function changeScreen(screenId) {
    console.log(`Alternando para a tela: '${screenId}'`);

    const currentScreen = document.querySelector(".screen.active");
    if (currentScreen && currentScreen.id === screenId) {
        console.log(`A tela '${screenId}' já está ativa.`);
        return;
    }

    if (currentScreen && currentScreen.id === "camera" && screenId !== "camera") {
        encerrarCamera();
    }

    const screens = document.querySelectorAll(".screen");
    screens.forEach(screen => screen.classList.remove("active"));

    const newScreen = document.getElementById(screenId);
    if (newScreen) {
        newScreen.classList.add("active");
        console.log(`Tela '${screenId}' ativada.`);
        if (screenId === "camera") abrirCamera(); // Abrir câmera após ativar a tela
    } else {
        console.error(`Tela com ID '${screenId}' não encontrada.`);
    }
}

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
    console.log("Sistema iniciado.");
    changeScreen("inicio");
    addResponsiveListeners();
});

// Listeners
function addResponsiveListeners() {
    const buttons = [
        { id: "gerar-qrcode", callback: gerarQRCodes },
        { id: "baixar-qrcode", callback: baixarQRCodes },
        { id: "btn-verificar-lista", callback: verificarLista },
        { id: "enviar-qrcode", callback: enviarQRCode },
        { id: "abrir-camera", callback: () => changeScreen("camera") } // Botão atualizado
    ];

    buttons.forEach(({ id, callback }) => {
        const button = document.getElementById(id);
        if (button) {
            button.addEventListener("click", callback);
            button.addEventListener("touchstart", event => {
                event.preventDefault();
                callback();
            });
        } else {
            console.error(`Botão com ID '${id}' não encontrado.`);
        }
    });

    document.querySelectorAll('.nav-button').forEach(button => {
        button.addEventListener('click', encerrarCamera);
        button.addEventListener('touchstart', encerrarCamera);
    });
}

// Geração de QR Codes
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

    const container = document.createElement("div");
    container.innerHTML = "<h3>QR Codes Gerados:</h3>";

    nomes.forEach(nome => {
        const qrDiv = document.createElement("div");
        qrDiv.style.margin = "1rem";
        container.appendChild(qrDiv);

        new QRCode(qrDiv, {
            text: `${nome} - ${titulo}`,
            width: 128,
            height: 128
        });

        qrDiv.querySelector("canvas").setAttribute("title", `${nome} - ${titulo}`);
    });

    const form = document.getElementById("form-criar-lista");
    form.appendChild(container);
}

// Download QR Codes
function baixarQRCodes() {
    if (listaAtual.nomes.length === 0) {
        alert("Nenhuma lista foi gerada ainda.");
        return;
    }

    const zip = new JSZip();
    const folder = zip.folder(listaAtual.titulo);

    listaAtual.nomes.forEach(nome => {
        const canvas = document.querySelector(`canvas[title="${nome} - ${listaAtual.titulo}"]`);
        if (canvas) {
            const dataURL = canvas.toDataURL("image/png");
            folder.file(`${nome}-${listaAtual.titulo}.png`, dataURL.split(",")[1], { base64: true });
        }
    });

    zip.generateAsync({ type: "blob" }).then(content => {
        saveAs(content, `${listaAtual.titulo}.zip`);
    });
}

// Verificação da lista
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

    const tituloVerificacao = document.getElementById("titulo-verificacao");
    const listaVerificacao = document.getElementById("nomes-verificacao");

    if (!tituloVerificacao || !listaVerificacao) {
        console.error("Elementos da tela de verificação não encontrados.");
        return;
    }

    tituloVerificacao.textContent = titulo;
    listaVerificacao.innerHTML = "";

    nomes.forEach(nome => {
        const li = document.createElement("li");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "nome-checkbox";
        checkbox.dataset.nome = nome;

        const label = document.createElement("label");
        label.textContent = nome;
        label.prepend(checkbox);

        li.appendChild(label);
        listaVerificacao.appendChild(li);
    });

    changeScreen("verificar-lista");
}

// Upload de imagem com QR Code
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

// Processa dados do QR Code
function processarQRCode(qrData) {
    try {
        const mensagem = document.getElementById("mensagem-notificacao");

        if (!qrData.includes(listaAtual.titulo)) {
            mensagem.textContent = "QR Code não corresponde à lista atual.";
            mensagem.className = "error";
            return;
        }

        const nome = qrData.replace(listaAtual.titulo, "").trim();
        const checkbox = Array.from(document.querySelectorAll(".nome-checkbox"))
            .find(checkbox => checkbox.dataset.nome === nome);

        if (checkbox) {
            checkbox.checked = true;
            mensagem.textContent = `Nome "${nome}" encontrado e marcado.`;
            mensagem.className = "success";
        } else {
            mensagem.textContent = "Nome não encontrado na lista.";
            mensagem.className = "error";
        }
    } catch (error) {
        console.error("Erro ao processar QR Code:", error);
        alert("Erro ao processar o QR Code.");
    }
}

// Ativa a câmera
function abrirCamera() {
    const video = document.getElementById("video-camera");

    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then(stream => {
            console.log("Câmera acessada com sucesso.");
            video.srcObject = stream;
            video.play();

            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");

            function processFrame() {
                if (video.readyState === video.HAVE_ENOUGH_DATA) {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);

                    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                    const qrCode = jsQR(imageData.data, imageData.width, imageData.height);

                    if (qrCode) {
                        processarQRCode(qrCode.data);
                        encerrarCamera(); // Fecha após ler QR
                    }
                }
                requestAnimationFrame(processFrame);
            }

            processFrame();
        })
        .catch(error => {
            console.error("Erro ao acessar a câmera:", error);
            alert("Não foi possível acessar a câmera. Verifique as permissões e tente novamente.");
        });
}

// Fecha a câmera
function encerrarCamera() {
    const video = document.getElementById("video-camera");
    const stream = video.srcObject;

    if (stream) {
        stream.getTracks().forEach(track => {
            track.stop();
            console.log("Faixa de mídia encerrada.");
        });

        video.srcObject = null;
        console.log("Câmera encerrada.");
    }
}
