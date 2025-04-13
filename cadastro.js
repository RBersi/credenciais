// Função para gerar QR Codes
function gerarQRCodes() {
    console.log("Gerando QR Codes...");

    const titulo = document.getElementById('tituloCadastro').value.trim();
    const nomes = document.getElementById('nomesCadastro').value.split('\n').map(nome => nome.trim()).filter(nome => nome.length > 0);

    if (!titulo || nomes.length === 0) {
        alert('Preencha o título e a lista de nomes.');
        return;
    }

    const qrcodesContainer = document.getElementById('qrcodes');
    qrcodesContainer.innerHTML = ''; // Limpa os QR Codes anteriores

    nomes.forEach(nome => {
        const qrCodeData = `${nome} - ${titulo}`;
        const qrCodeElement = document.createElement('div');
        qrCodeElement.classList.add('qrcode-item');

        // Gera o QR Code usando a biblioteca qrcode-generator
        const qr = qrcode(0, 'M');
        qr.addData(qrCodeData);
        qr.make();

        qrCodeElement.innerHTML = `
            <h3>${nome}</h3>
            <div>${qr.createImgTag(4)}</div>
        `;
        qrcodesContainer.appendChild(qrCodeElement);
    });

    console.log("QR Codes gerados com sucesso.");
}
