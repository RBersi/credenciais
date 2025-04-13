// Variável global compartilhada
window.cameraStream = null;

async function iniciarCamera() {
    console.log("Iniciando câmera...");

    // Verifica se o navegador suporta a API de câmera
    if (!verificarSuporteCamera()) {
        exibirErro('Seu navegador não suporta a API de câmera.');
        return;
    }

    try {
        const videoElement = document.getElementById('camera-preview');
        const telaCamera = document.getElementById('tela-camera');

        // Alterna para a tela de câmera
        console.log("Ocultando todas as telas...");
        document.querySelectorAll('.container > div').forEach(div => div.classList.add('hidden'));
        console.log("Exibindo tela de câmera...");
        telaCamera.classList.remove('hidden');

        // Acessa a câmera
        console.log("Acessando a câmera...");
        window.cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        videoElement.srcObject = window.cameraStream;

        // Inicia a detecção de QR Code
        console.log("Iniciando detecção de QR Code...");
        const codeReader = new ZXing.BrowserQRCodeReader();
        codeReader.decodeFromVideoDevice(undefined, 'camera-preview', (result, error) => {
            if (result) {
                console.log('QR Code detectado:', result.text);

                // Para a câmera antes de processar o QR Code
                pararCamera().then(() => {
                    verificarQrCode(result.text); // Processa o QR Code após a câmera ser desativada
                });
            }
            if (error && !(error instanceof ZXing.NotFoundException)) {
                console.error('Erro ao ler QR Code:', error);
            }
        });
    } catch (error) {
        console.error('Erro ao acessar a câmera:', error);
        exibirErro('Não foi possível acessar a câmera. Verifique as permissões ou tente novamente.');
    }
}

function pararCamera() {
    console.log("Parando a câmera...");

    return new Promise((resolve, reject) => {
        if (window.cameraStream) {
            try {
                // Interrompe todos os tracks da câmera
                const tracks = window.cameraStream.getTracks();
                tracks.forEach(track => {
                    console.log(`Interrompendo track: ${track.kind}`);
                    track.stop(); // Interrompe o track
                });

                // Limpa a referência ao stream
                window.cameraStream = null;

                // Limpa o vídeo
                const videoElement = document.getElementById('camera-preview');
                if (videoElement) {
                    videoElement.srcObject = null; // Remove o stream do elemento <video>
                }

                console.log("Câmera desativada com sucesso.");
                resolve();
            } catch (error) {
                console.error("Erro ao desativar a câmera:", error);
                reject(error);
            }
        } else {
            console.warn("A câmera já está desativada.");
            resolve();
        }
    }).then(() => {
        // Volta para a Tela 3 após desativar a câmera
        console.log("Voltando para a Tela 3...");
        mostrarTela(3);
    });
}

function lerQrCodeArquivo() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async function(event) {
        const file = event.target.files[0];
        if (!file) {
            console.warn('Nenhum arquivo selecionado.');
            return;
        }

        const reader = new FileReader();
        reader.onload = async function(event) {
            const image = new Image();
            image.src = event.target.result;
            image.onload = async function() {
                try {
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.width = image.width;
                    canvas.height = image.height;
                    context.drawImage(image, 0, 0, canvas.width, canvas.height);

                    // Usar ZXing para decodificar o QR Code
                    const codeReader = new ZXing.BrowserQRCodeReader();
                    const result = await codeReader.decodeFromImage(undefined, image.src);
                    console.log('QR Code detectado:', result.text);

                    verificarQrCode(result.text);
                } catch (error) {
                    console.warn('QR Code não encontrado na imagem:', error);
                    alert('QR Code não encontrado na imagem.');
                }
            };
        };
        reader.readAsDataURL(file);
    };
    input.click();
}

function verificarQrCode(data) {
    console.log("Verificando QR Code:", data);

    const nomes = document.getElementById('nomesLista').value.split('\n').map(nome => nome.trim()).filter(nome => nome.length > 0);
    const titulo = document.getElementById('tituloLista').value.trim();

    if (!titulo || nomes.length === 0) {
        console.warn('Preencha o título e a lista de nomes.');
        return;
    }

    const [nomeQr, tituloQr] = data.split(' - ');
    if (titulo !== tituloQr) {
        console.warn('Título da lista incorreto.');
        return;
    }

    const index = nomes.indexOf(nomeQr);
    if (index !== -1) {
        if (nomesConfirmados.includes(nomeQr)) {
            console.log(`Nome já confirmado: ${nomeQr}`);
        } else {
            nomesConfirmados.push(nomeQr);
            carregarListaVerificacao();
            console.log(`Nome confirmado: ${nomeQr}`);
        }
    } else {
        console.warn('Nome não encontrado na lista.');
    }
}
