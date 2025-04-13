// qrcode-generator.js

// Função para gerar um QR Code com base nos dados fornecidos
function gerarQRCode(dados) {
    const tipo = 0; // Tipo de correção de erro: L (baixo)
    const nivelCorrecaoErro = 'M'; // Nível de correção de erro: médio
    const qr = qrcode(tipo, nivelCorrecaoErro);
    qr.addData(dados);
    qr.make();
    return qr.createImgTag(4); // Retorna uma tag <img> com o QR Code
}
