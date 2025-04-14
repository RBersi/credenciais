// Variáveis globais
let listaAtual = {
    titulo: "",
    nomes: []
};

let qrScanner;

// Alterna telas
function changeScreen(screenId) {
    const currentScreen = document.querySelector(".screen.active");
    if (currentScreen?.id === screenId) return;

    if (currentScreen?.id === "camera" && screenId !== "camera") {
        encerrarCamera();
    }

    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    const newScreen = document.getElementById(screenId);
    if (newScreen) {
        newScreen.classList.add("active");
        if (screenId === "camera") abrirCamera();
    }
}

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
    changeScreen("inicio");
    addResponsiveListeners();
});

// Botões
function addResponsiveListeners() {
    const buttons = [
        { id: "gerar-qrcode", callback: gerarQRCodes },
        { id: "baixar-qrcode", callback: baixarQRCodes },
        { id: "btn-verificar-lista", callback: verificarLista },
        { id: "enviar-qrcode", callback: enviarQRCode },
        { id: "abrir-camera", callback: () => changeScreen("camera") }
    ];

    buttons.forEach(({ id, callback }) => {
        const button = document.getElementById(id);
        if (button) {
            button.addEventListener("pointerdown", callback);
        }
    });

    document.querySelectorAll('.nav-button').forEach(button => {
        button.addEventListener("pointerdown", encerrarCamera);
    });
}

// Geração de QR Codes
function gerarQRCodes() {
    const titulo = document.getElementById("titulo-lista").value.trim();
    const nomesTexto = document.getElementById("nomes-lista").value.trim();

    if (!titulo || !nomesTexto) return alert("Preencha todos os campos.");

    const nomes = nomesTexto.split("\n").map(n => n.trim()).filter(n => n);
    if (!nomes.length) return alert("Insira pelo menos um nome válido.");

    listaAtual = { titulo, nomes };

    const form = document.getElementById("form-criar-lista");
    const existingContainer = form.querySelector(".qrcode-container");
    if (existingContainer) existingContainer.remove();

    const container = document.createElement("div");
    container.className = "qrcode-container";
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

    form.appendChild(container);
}

// Download QR Codes
function baixarQRCodes() {
    if (!listaAtual.nomes.length) return alert("Nenhuma lista foi gerada.");

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

// Verificar lista
function verificarLista() {
    const titulo = document.getElementById("titulo-lista-inserir").value.trim();
    const nomesTexto = document.getElementById("nomes-lista-inserir").value.trim();

    if (!titulo || !nomesTexto) return alert("Preencha todos os campos.");

    const nomes = nomesTexto.split("\n").map(n => n.trim()).filter(n => n);
    if (!nomes.length) return alert("Insira pelo menos um nome válido.");

    listaAtual = { titulo, nomes };

    const tituloEl = document.getElementById("titulo-verificacao");
    const listaEl = document.getElementById("nomes-verificacao");

    if (!tituloEl || !listaEl) return console.error("Elementos da verificação não encontrados.");

    tituloEl.textContent = titulo;
    listaEl.innerHTML = "";

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
        listaEl.appendChild(li);
    });

    changeScreen("verificar-lista");
}

// Upload de QR por imagem
function enviarQRCode() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = (event) => {
        const file = event.target.files[0];
        if (!file) return alert("Nenhum arquivo selecionado.");

        const reader = new FileReader();
        reader.onload = () => {
            const img = new Image();
            img.onload = () => {
                QrScanner.scanImage(img)
                    .then(text => {
                        processarQRCode(text);
                    })
                    .catch(err => {
                        console.error("Erro ao ler QR Code:", err);
                        alert("Erro ao ler o QR Code. Tente outra imagem.");
                    });
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    };

    input.click();
}

// Processar QR
function processarQRCode(qrData) {
    try {
        const mensagem = document.getElementById("mensagem-notificacao");
        console.log("QR lido:", qrData);

        // Se a resposta não for uma string, tente acessá-la corretamente
        if (typeof qrData === 'object' && qrData.data) {
            qrData = qrData.data;
        }

        const [nomeLido, tituloLido] = qrData.split(" - ").map(s => s.trim());

        if (!nomeLido || !tituloLido) {
            mensagem.textContent = "Formato do QR Code inválido.";
            mensagem.className = "error";
            return;
        }

        if (tituloLido !== listaAtual.titulo) {
            mensagem.textContent = "QR Code não corresponde à lista atual.";
            mensagem.className = "error";
            return;
        }

        const checkbox = Array.from(document.querySelectorAll(".nome-checkbox"))
            .find(checkbox => checkbox.dataset.nome === nomeLido);

        if (checkbox) {
            checkbox.checked = true;
            mensagem.textContent = `Nome "${nomeLido}" encontrado e marcado.`;
            mensagem.className = "success";
        } else {
            mensagem.textContent = `Nome "${nomeLido}" não encontrado na lista.`;
            mensagem.className = "error";
        }
    } catch (error) {
        console.error("Erro ao processar QR Code:", error);
        alert("Erro ao processar o QR Code.");
    }
}


// Câmera
function abrirCamera() {
    const video = document.getElementById("video-camera");

    QrScanner.hasCamera()
        .then(hasCamera => {
            if (!hasCamera) return alert("Nenhuma câmera encontrada.");

            qrScanner = new QrScanner(video, result => {
                processarQRCode(result);
                encerrarCamera();
            }, {
                highlightScanRegion: true,
                highlightCodeOutline: true
            });

            qrScanner.start().then(() => {
                console.log("Câmera iniciada.");
            }).catch(err => {
                console.error("Erro ao iniciar câmera:", err);
                alert("Erro ao acessar a câmera.");
            });
        })
        .catch(err => {
            console.error("Erro ao verificar câmera:", err);
            alert("Não foi possível verificar a câmera.");
        });
}

function encerrarCamera() {
    if (qrScanner) {
        qrScanner.stop();
        qrScanner.destroy();
        qrScanner = null;
    }
    const video = document.getElementById("video-camera");
    if (video) video.srcObject = null;
}
