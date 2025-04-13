let cameraStream = null;
let nomesConfirmados = [];

// Função para iniciar a câmera
async function iniciarCamera() {
    console.log("Iniciando câmera...");

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Seu navegador não suporta a API de câmera.');
        return;
    }

    try {
        const videoElement = document.getElementById('camera-preview');
        const cameraPreviewContainer = document.getElementById('camera-preview-container');

        // Exibe a câmera
        cameraPreviewContainer.classList.remove('hidden');
        cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        videoElement.srcObject = cameraStream;

        // Inicia a detecção de QR Code
        const codeReader = new ZXing.BrowserQRCodeReader();
        codeReader.decodeFromVideoDevice(undefined, 'camera-preview', (result, error) => {
            if (result) {
                console.log('QR Code detectado:', result.text);
                pararCamera();
                verificarQrCode(result.text);
            }
            if (error && !(error instanceof ZXing.NotFoundException)) {
                console.error('Erro ao ler QR Code:', error);
            }
        });
    } catch (error) {
        console.error('Erro ao acessar a câmera:', error);
        alert('Não foi possível acessar a câmera. Verifique as permissões ou tente novamente.');
    }
}

// Função para desativar a câmera
function pararCamera() {
    console.log("Parando a câmera...");

    if (cameraStream) {
        const tracks = cameraStream.getTracks();
        tracks.forEach(track => track.stop());
        cameraStream = null;

        const videoElement = document.getElementById('camera-preview');
        videoElement.srcObject = null;

        const cameraPreviewContainer = document.getElementById('camera-preview-container');
        cameraPreviewContainer.classList.add('hidden');
    }
}

// Função para ler QR Code via arquivo
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

// Função para verificar o QR Code
function verificarQrCode(data) {
    console.log("Verificando QR Code:", data);

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

// Função para carregar a lista de verificação
function carregarListaVerificacao() {
    const titulo = document.getElementById('tituloLista').value.trim();
    const nomes = document.getElementById('nomesLista').value.split('\n').map(nome => nome.trim()).filter(nome => nome.length > 0);
    const listaVerificacaoDiv = document.getElementById('lista-verificacao');
    listaVerificacaoDiv.innerHTML = `<strong>Título: ${titulo}</strong><br><br>`;

    nomes.forEach(nome => {
        const isChecked = nomesConfirmados.includes(nome);
        const label = document.createElement('label');
        label.innerHTML = `
            <input type="checkbox" ${isChecked ? 'checked' : ''} disabled>
            ${isChecked ? `<strong>${nome}</strong>` : nome}
        `;
        listaVerificacaoDiv.appendChild(label);
    });
}
