// Variáveis globais para armazenar dados
let listaAtual = {
    titulo: "",
    nomes: []
};

// Função para alternar entre telas
function changeScreen(screenId) {
    console.log(`Alternando para a tela: '${screenId}'`);

    // Verifica se a tela solicitada já está ativa
    const currentScreen = document.querySelector(".screen.active");
    if (currentScreen && currentScreen.id === screenId) {
        console.log(`A tela '${screenId}' já está ativa.`);
        return; // Sai da função sem fazer alterações
    }

    // Encerra a câmera se estiver ativa
    if (screenId !== "camera") {
        encerrarCamera();
    }

    // Remove a classe 'active' de todas as telas
    const screens = document.querySelectorAll(".screen");
    screens.forEach(screen => screen.classList.remove("active"));

    // Ativa a nova tela
    const newScreen = document.getElementById(screenId);
    if (newScreen) {
        newScreen.classList.add("active");
        console.log(`Tela '${screenId}' ativada.`);
    } else {
        console.error(`Tela com ID '${screenId}' não encontrada.`);
    }
}

// Função para inicializar o sistema
document.addEventListener("DOMContentLoaded", () => {
    console.log("Sistema iniciado.");
    // Inicialmente, exibe a tela de início
    changeScreen("inicio");

    // Adiciona listeners responsivos para todos os botões
    addResponsiveListeners();
});

// Função para adicionar listeners responsivos (toque + clique)
function addResponsiveListeners() {
    const buttons = [
        { id: "gerar-qrcode", callback: gerarQRCodes },
        { id: "baixar-qrcode", callback: baixarQRCodes },
        { id: "btn-verificar-lista", callback: verificarLista },
        { id: "enviar-qrcode", callback: enviarQRCode },
        { id: "camera", callback: abrirCamera }
    ];

    buttons.forEach(({ id, callback }) => {
        const button = document.getElementById(id);
        if (button) {
            button.addEventListener("click", callback); // Para desktop
            button.addEventListener("touchstart", (event) => {
                event.preventDefault(); // Evita comportamento padrão de scroll
                callback();
            }); // Para mobile
        } else {
            console.error(`Botão com ID '${id}' não encontrado.`);
        }
    });

    // Garantir que a câmera seja encerrada ao sair da tela
    document.querySelectorAll('.nav-button').forEach(button => {
        button.addEventListener('click', encerrarCamera);
        button.addEventListener('touchstart', encerrarCamera);
    });
}

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

    // Limpar a área de exibição de QR Codes
    const container = document.createElement("div");
    container.innerHTML = "<h3>QR Codes Gerados:</h3>";

    nomes.forEach(nome => {
        const qrDiv = document.createElement("div");
        qrDiv.style.margin = "1rem";
        container.appendChild(qrDiv);

        // Criar QR Code usando a biblioteca
        new QRCode(qrDiv, {
            text: `${nome} - ${titulo}`,
            width: 128,
            height: 128
        });

        // Adicionar o atributo 'title' ao canvas gerado
        qrDiv.querySelector("canvas").setAttribute("title", `${nome} - ${titulo}`);
    });

    // Exibir os QR Codes na tela
    const form = document.getElementById("form-criar-lista");
    form.appendChild(container);
}

// Função para baixar QR Codes como um arquivo ZIP
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

// Função para verificar lista
function verificarLista() {
    console.log("Função verificarLista chamada");

    const titulo = document.getElementById("titulo-lista-inserir").value.trim();
    const nomesTexto = document.getElementById("nomes-lista-inserir").value.trim();

    if (!titulo || !nomesTexto) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    // Divide os nomes, remove espaços e quebras de linha desnecessários
    const nomes = nomesTexto.split("\n")
        .map(nome => nome.trim()) // Remove espaços extras
        .filter(nome => nome !== ""); // Remove nomes vazios

    if (nomes.length === 0) {
        alert("Insira pelo menos um nome válido.");
        return;
    }

    listaAtual.titulo = titulo;
    listaAtual.nomes = nomes;

    // Atualizar a tela de verificação
    const tituloVerificacao = document.getElementById("titulo-verificacao");
    const listaVerificacao = document.getElementById("nomes-verificacao");

    if (!tituloVerificacao || !listaVerificacao) {
        console.error("Elementos da tela de verificação não encontrados.");
        return;
    }

    console.log("Atualizando tela de verificação...");
    tituloVerificacao.textContent = titulo;
    listaVerificacao.innerHTML = "";

    nomes.forEach(nome => {
        const li = document.createElement("li");

        // Cria o checkbox e o rótulo usando textContent
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "nome-checkbox";
        checkbox.dataset.nome = nome;

        const label = document.createElement("label");
        label.textContent = nome; // Insere apenas o texto do nome
        label.prepend(checkbox); // Adiciona o checkbox ao início do rótulo

        li.appendChild(label);
        listaVerificacao.appendChild(li);
    });

    console.log("Alternando para a tela de verificação...");
    changeScreen("verificar-lista");

    // Log para verificar o conteúdo final
    console.log("Título da lista:", tituloVerificacao.textContent);
    console.log("Nomes da lista:", Array.from(listaVerificacao.children).map(li => li.textContent.trim()));
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

// Função para abrir a câmera
function abrirCamera() {
    const video = document.getElementById("video-camera");

    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then(stream => {
            console.log("Câmera acessada com sucesso.");
            video.srcObject = stream;
            video.play();

            // Processar o vídeo continuamente
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
                        encerrarCamera(); // Encerra a câmera após ler o QR Code
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

// Função para encerrar a câmera
function encerrarCamera() {
    const video = document.getElementById("video-camera");
    const stream = video.srcObject;

    if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => {
            track.stop(); // Para cada faixa de mídia, pare a transmissão
            console.log("Faixa de mídia encerrada.");
        });

        video.srcObject = null; // Limpa o objeto de mídia do elemento <video>
        console.log("Câmera encerrada.");
    }

    // Verifica se a tela ativa já é 'verificar-lista' antes de alternar
    const currentScreen = document.querySelector(".screen.active");
    if (currentScreen && currentScreen.id !== "verificar-lista") {
        changeScreen("verificar-lista"); // Volta para a tela de verificação
    }
}

    changeScreen("verificar-lista"); // Volta para a tela de verificação
}
