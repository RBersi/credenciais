function gerarQRCodes() {
    try {
        const titulo = document.getElementById('tituloCadastro').value.trim();
        const nomes = document.getElementById('nomesCadastro').value.split('\n').map(nome => nome.trim()).filter(nome => nome.length > 0);
        const qrcodeContainer = document.getElementById('qrcodes');
        qrcodeContainer.innerHTML = '';

        if (!titulo || nomes.length === 0) {
            alert('Preencha o título e pelo menos um nome.');
            return;
        }

        nomes.forEach(nome => {
            const conteudo = `${nome} - ${titulo}`;
            const qrCode = qrcode(0, 'M');
            qrCode.addData(conteudo, 'Byte');
            qrCode.make();

            const imgTag = qrCode.createImgTag(4); // Escala ajustável
            const div = document.createElement('div');
            div.innerHTML = `<p>${nome}</p>${imgTag}`;
            qrcodeContainer.appendChild(div);
        });
    } catch (error) {
        console.error('Erro ao gerar QR Codes:', error);
        alert('Ocorreu um erro ao gerar os QR Codes. Verifique o console para mais detalhes.');
    }
}

function baixarQRCodes() {
    try {
        const titulo = document.getElementById('tituloCadastro').value.trim();
        const nomes = document.getElementById('nomesCadastro').value.split('\n').map(nome => nome.trim()).filter(nome => nome.length > 0);

        if (!titulo || nomes.length === 0) {
            alert('Preencha o título e pelo menos um nome.');
            return;
        }

        const zip = new JSZip();
        const folder = zip.folder(titulo);

        nomes.forEach(nome => {
            const conteudo = `${nome} - ${titulo}`;
            const qrCode = qrcode(0, 'M');
            qrCode.addData(conteudo, 'Byte');
            qrCode.make();

            const canvas = document.createElement('canvas');
            const size = 256; // Tamanho fixo para o QR Code
            canvas.width = size;
            canvas.height = size;

            const ctx = canvas.getContext('2d');
            const qrData = qrCode.createDataURL(4); // Gera o QR Code como imagem
            const img = new Image();
            img.src = qrData;
            img.onload = () => {
                ctx.drawImage(img, 0, 0, size, size);
                const imageData = canvas.toDataURL('image/png').split(',')[1];
                folder.file(`${nome}_${titulo}.png`, imageData, { base64: true });
            };
        });

        setTimeout(() => {
            zip.generateAsync({ type: 'blob' }).then(content => {
                baixarArquivoZip(content, `${titulo}.zip`);
            });
        }, 1000);
    } catch (error) {
        console.error('Erro ao baixar QR Codes:', error);
        alert('Ocorreu um erro ao baixar os QR Codes. Verifique o console para mais detalhes.');
    }
}
