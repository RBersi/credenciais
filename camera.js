// Variável global para armazenar o stream da câmera
let cameraStream = null;

// Função para iniciar a câmera
async function iniciarCamera() {
    console.log("Iniciando câmera...");

    // Verifica se o navegador suporta a API de câmera
    if (!verificarSuporteCamera()) {
        exibirErro('Seu navegador não suporta a API de câmera.');
        return;
    }

    try {
        const videoElement = document.getElementById('camera-preview');
        const cameraPreviewContainer = document.getElementById('camera-preview-container');

        // Exibe o elemento de visualização da câmera
        cameraPreviewContainer.classList.remove('hidden');

        // Acessa a câmera
        cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        videoElement.srcObject = cameraStream;

        // Inicia a detecção de QR Code
        const codeReader = new ZXing.BrowserQRCodeReader();
        codeReader.decodeFromVideoDevice(undefined, 'camera-preview', (result, error) => {
            if (result) {
                console.log('QR Code detectado:', result.text);
                pararCamera(); // Para a câmera após ler o QR Code
                verificarQrCode(result.text); // Processa o QR Code
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

// Função para desativar a câmera
function pararCamera() {
    console.log("Parando a câmera...");

    if (cameraStream) {
        const tracks = cameraStream.getTracks();
        tracks.forEach(track => track.stop()); // Interrompe todos os tracks da câmera
        cameraStream = null;

        // Limpa o elemento <video>
        const videoElement = document.getElementById('camera-preview');
        videoElement.srcObject = null;

        // Oculta o elemento de visualização da câmera
        const cameraPreviewContainer = document.getElementById('camera-preview-container');
        cameraPreviewContainer.classList.add('hidden');
    }
}
