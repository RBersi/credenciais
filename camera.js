async function iniciarCamera() {
    console.log("Iniciando câmera...");
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
        cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        videoElement.srcObject = cameraStream;

        // Inicia a detecção de QR Code
        const codeReader = new ZXing.BrowserQRCodeReader();
        codeReader.decodeFromVideoDevice(undefined, 'camera-preview', (result, error) => {
            if (result) {
                console.log('QR Code detectado:', result.text);
                pararCamera(); // Para a câmera após detectar o QR Code
                mostrarTela(3); // Retorna à Tela 3
                verificarQrCode(result.text);
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
    if (cameraStream) {
        const tracks = cameraStream.getTracks();
        tracks.forEach(track => track.stop());
        cameraStream = null;

        // Limpa o vídeo
        const videoElement = document.getElementById('camera-preview');
        videoElement.srcObject = null;

        // Volta para a Tela 3
        mostrarTela(3);
    }
}

function lerQrCodeArquivo() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async function(event) {
        const file = event.target.files[0];
        if (!file) {
            alert('Selecione uma imagem.');
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
    const nomes = document.getElementById('nomesLista').value.split('\n').map(nome => nome.trim()).filter(nome => nome.length > 0);
    const titulo = document.getElementById('tituloLista').value.trim();

    if (!titulo || nomes.length === 0) {
        alert('Preencha o título e a lista de nomes.');
        return;
    }

    const [nomeQr, tituloQr] = data.split(' - ');
    if (titulo !== tituloQr) {
        alert('Título da lista incorreto.');
        return;
    }

    const index = nomes.indexOf(nomeQr);
    if (index !== -1) {
        if (nomesConfirmados.includes(nomeQr)) {
            alert(`Nome já confirmado: ${nomeQr}`);
        } else {
            nomesConfirmados.push(nomeQr);
            carregarListaVerificacao();
            alert(`Nome confirmado: ${nomeQr}`);
        }
    } else {
        alert('Nome não encontrado na lista.');
    }
}
