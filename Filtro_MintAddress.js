// Lista dos arquivos JSON armazenados no localStorage, removendo 'access.json' e 'collectible.json'
const jsonFiles = [
    'crew',
    'resource',
    'ship',
    'structure'
];

// Função principal para ler os dados do localStorage e capturar os mintaddress
async function captureMintAddresses() {
    let allMintAddresses = [];

    try {
        for (const file of jsonFiles) {
            try {
                // Verifica se o arquivo JSON existe no localStorage antes de tentar ler
                const rawData = localStorage.getItem(file);
                if (rawData) {
                    // Lê o conteúdo do arquivo JSON
                    const data = JSON.parse(rawData);

                    // Extrai os mintaddress de cada registro no arquivo
                    const mintAddresses = data.map(record => record.mint).filter(Boolean);

                    // Adiciona os mintAddresses ao array principal
                    allMintAddresses = allMintAddresses.concat(mintAddresses);
                    console.log(`Mint addresses capturados de ${file}: ${mintAddresses.length} itens`);
                } else {
                    console.log(`Arquivo não encontrado no localStorage: ${file}`);
                }

            } catch (error) {
                console.error(`Erro ao ler ou processar o arquivo ${file}:`, error);
            }
        }

        // Remove duplicatas de mintAddresses
        allMintAddresses = [...new Set(allMintAddresses)];

        // Estrutura do arquivo Itens_list.json
        const targetMintAddresses = {
            TARGET_MINT_ADDRESSES: allMintAddresses
        };

        // Salva os mint addresses no localStorage com a chave 'Itens_list'
        localStorage.setItem('Itens_list', JSON.stringify(targetMintAddresses, null, 2));
        console.log(`Mint addresses capturados e salvos no localStorage sob a chave "Itens_list".`);

        // Simula interrupção e reinício do index.js
        restartIndexWithDelay();

    } catch (error) {
        console.error('Erro ao capturar e salvar os mint addresses:', error);
    }
}

// Função para simular parar e reiniciar um script (index.js) após 5 segundos
function restartIndexWithDelay() {
    console.log("Simulando parada de index.js...");

    // Simulação de parada
    setTimeout(() => {
        console.log("Simulação de reinício de index.js...");
        // Aqui você pode executar qualquer lógica para "reiniciar" o fluxo, se necessário
        console.log("index.js reiniciado com sucesso.");
    }, 5000); // 5 segundos de delay
}

// Executa a função
captureMintAddresses();
