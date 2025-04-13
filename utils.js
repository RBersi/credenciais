// utils.js - Funções utilitárias para o projeto

/**
 * Função para baixar um arquivo ZIP contendo QR Codes.
 * @param {string} zipBlob - O blob contendo o arquivo ZIP gerado.
 * @param {string} fileName - Nome do arquivo a ser baixado.
 */
function baixarArquivoZip(zipBlob, fileName) {
    try {
        // Usa a biblioteca FileSaver.js para salvar o arquivo
        saveAs(zipBlob, fileName);
    } catch (error) {
        console.error('Erro ao baixar o arquivo ZIP:', error);
        alert('Ocorreu um erro ao baixar o arquivo ZIP. Verifique o console para mais detalhes.');
    }
}

/**
 * Função para exibir uma mensagem de erro no console e na interface do usuário.
 * @param {string} mensagem - A mensagem de erro a ser exibida.
 */
function exibirErro(mensagem) {
    console.error(mensagem);
    alert(`Erro: ${mensagem}`);
}

/**
 * Função para verificar se o navegador suporta a API de câmera.
 * @returns {boolean} - Retorna true se a API de câmera for suportada, false caso contrário.
 */
function verificarSuporteCamera() {
    return !!navigator.mediaDevices && !!navigator.mediaDevices.getUserMedia;
}

/**
 * Função para pausar a execução por um determinado período de tempo.
 * @param {number} ms - Tempo em milissegundos para pausar.
 * @returns {Promise} - Promessa que resolve após o tempo especificado.
 */
function pausa(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Exportar funções para uso global (opcional)
window.baixarArquivoZip = baixarArquivoZip;
window.exibirErro = exibirErro;
window.verificarSuporteCamera = verificarSuporteCamera;
window.pausa = pausa;

console.log("utils.js carregado com sucesso!");
