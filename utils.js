// utils.js

// Função para verificar se o navegador suporta a API de câmera
function verificarSuporteCamera() {
    return 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;
}

// Função para exibir mensagens de erro na interface
function exibirErro(mensagem) {
    alert(mensagem); // Pode ser substituído por uma mensagem na tela
}

// Função para limpar campos de formulário
function limparCampos(elementos) {
    elementos.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.value = '';
        }
    });
}
