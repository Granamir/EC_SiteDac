const fs = require('fs').promises;
const path = 'reg_mint_Ent.json';  // Caminho para o arquivo JSON de dados

// Função para gerar o HTML da tabela
async function generateHTMLTable() {
    try {
        // Lê o arquivo JSON com os registros
        const data = await fs.readFile(path, 'utf-8');
        const records = JSON.parse(data);

        // Pega os últimos 10 registros
        const lastTenRecords = records.slice(-50).reverse();

        // Define a estrutura HTML com a tabela
        let htmlContent = `
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="refresh" content="5"> <!-- Atualiza a cada 5 segundos -->
                <title>Últimos Registros</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { padding: 8px; text-align: left; border: 1px solid #ddd; }
                    th { background-color: #f2f2f2; }
                </style>
            </head>
            <body>
                <h2>Últimos 10 Registros</h2>
                <table>
                    <thead>
                        <tr>
                            <th>mintAddress</th>
                            <th>tipoNegociação</th>
                            <th>blockTime</th>
                            <th>mintAmount</th>
                            <th>TotalAtlasTransferred</th>
                            <th>UltimaVenda</th>
                            <th>UltimaCompra</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        // Popula a tabela com os últimos 10 registros
        for (const record of lastTenRecords) {
            htmlContent += `
                <tr>
                    <td>${record.mintAddress}</td>
                    <td>${record.tipoNegociacao}</td>
                    <td>${record.blockTime}</td>
                    <td>${record.mintAmount}</td>
                    <td>${record.TotalAtlasTransferred}</td>
                    <td>${record.UltimaVenda || '-'}</td>
                    <td>${record.UltimaCompra || '-'}</td>
                </tr>
            `;
        }

        htmlContent += `
                    </tbody>
                </table>
            </body>
            </html>
        `;

        // Escreve o conteúdo no arquivo HTML
        await fs.writeFile('index.html', htmlContent, 'utf-8');
        console.log('Arquivo index.html gerado com sucesso.');

    } catch (error) {
        console.error('Erro ao gerar o arquivo HTML:', error);
    }
}

// Executa a função para gerar o HTML
generateHTMLTable();
