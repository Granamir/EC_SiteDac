// Simulação do caminho para o JSON armazenado no localStorage
const jsonKey = 'reg_mint_Ent'; // Chave no localStorage onde os dados estão armazenados

// Função para gerar a tabela HTML diretamente no DOM
async function generateHTMLTable() {
    try {
        // Recupera os dados do localStorage
        const rawData = localStorage.getItem(jsonKey);
        if (!rawData) {
            console.error('Nenhum dado encontrado no localStorage. Certifique-se de que "reg_mint_Ent" existe.');
            return;
        }

        const records = JSON.parse(rawData);

        // Pega os últimos 50 registros e inverte a ordem
        const lastTenRecords = records.slice(-50).reverse();

        // Seleciona ou cria o elemento da tabela no DOM
        let tableContainer = document.getElementById('table-container');
        if (!tableContainer) {
            tableContainer = document.createElement('div');
            tableContainer.id = 'table-container';
            document.body.appendChild(tableContainer);
        }

        // Define a estrutura da tabela
        let htmlContent = `
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

        // Popula a tabela com os últimos 50 registros
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
        `;

        // Aplica o conteúdo HTML ao container
        tableContainer.innerHTML = htmlContent;

        console.log('Tabela HTML gerada com sucesso.');

    } catch (error) {
        console.error('Erro ao gerar a tabela HTML:', error);
    }
}

// Configura o estilo básico para a tabela no DOM
function setupStyles() {
    const style = document.createElement('style');
    style.textContent = `
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 8px; text-align: left; border: 1px solid #ddd; }
        th { background-color: #f2f2f2; }
    `;
    document.head.appendChild(style);
}

// Função principal para inicializar a página
function initPage() {
    setupStyles();
    generateHTMLTable();

    // Configura atualização automática a cada 5 segundos
    setInterval(() => {
        console.log('Atualizando tabela...');
        generateHTMLTable();
    }, 5000); // Atualiza a cada 5 segundos
}

// Inicializa a página ao carregar o script
initPage();
