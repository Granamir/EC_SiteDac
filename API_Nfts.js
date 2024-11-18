// URL da API dos NFTs do Star Atlas (substitua pela URL correta)
const apiUrl = 'https://galaxy.staratlas.com/nfts'; // Exemplo fictício

// Função para buscar e salvar os dados da API
async function fetchNFTData() {
    try {
        const response = await fetch(apiUrl);

        if (response.ok) {
            const nftData = await response.json();

            // Salva os dados no localStorage
            localStorage.setItem('nfts_raw', JSON.stringify(nftData, null, 2));
            console.log('Dados da API salvos em "nfts_raw" no localStorage.');

            // Simula execução de Cap_Nfts_Data.js após 10 segundos
            setTimeout(() => {
                console.log("Simulando execução de Cap_Nfts_Data.js após 10 segundos...");
                // Simular processamento ou próximo passo
                processCapNftsData();
            }, 10000); // Delay de 10 segundos

            // Simula execução de Filtro_MintAddress.js após 15 segundos
            setTimeout(() => {
                console.log("Simulando execução de Filtro_MintAddress.js após 15 segundos...");
                // Simular processamento ou próximo passo
                processFiltroMintAddress();
            }, 15000); // Delay de 15 segundos

        } else {
            console.error(`Erro: Status de resposta ${response.status}`);
        }
    } catch (error) {
        console.error('Erro ao buscar dados da API:', error);
    }
}

// Função simulada para Cap_Nfts_Data.js
function processCapNftsData() {
    const rawData = localStorage.getItem('nfts_raw');
    if (rawData) {
        console.log("Processando dados em Cap_Nfts_Data.js...", JSON.parse(rawData));
    } else {
        console.error("Nenhum dado encontrado no localStorage para Cap_Nfts_Data.js.");
    }
}

// Função simulada para Filtro_MintAddress.js
function processFiltroMintAddress() {
    const rawData = localStorage.getItem('nfts_raw');
    if (rawData) {
        console.log("Processando dados em Filtro_MintAddress.js...", JSON.parse(rawData));
    } else {
        console.error("Nenhum dado encontrado no localStorage para Filtro_MintAddress.js.");
    }
}

// Executa a função
fetchNFTData();
