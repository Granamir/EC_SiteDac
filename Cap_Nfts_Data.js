// Tipos de "itemType" predefinidos, removendo "collectible" e "access"
const itemTypes = ["crew", "ship", "resource", "structure"];

// Funções para estruturar o JSON conforme o tipo de itemType
function createJSONStructure(type, items) {
    switch (type) {
        case 'crew':
            return items.map(nft => ({
                symbol: nft.symbol,
                mint: nft.mint,
                name: nft.name,
                itemType: nft.attributes?.itemType,
                category: nft.attributes?.category,
                rarity: nft.attributes?.rarity,
                spec: nft.spec,
                class: nft.attributes?.class,
                thumbnailUrl: nft.thumbnailUrl,
                image: nft.image,
                description: nft.description
            }));
        case 'ship':
            return items.map(nft => ({
                symbol: nft.symbol,
                mint: nft.mint,
                name: nft.name,
                itemType: nft.attributes?.itemType,
                category: nft.attributes?.category,
                rarity: nft.attributes?.rarity,
                spec: nft.spec,
                class: nft.attributes?.class,
                make: nft.make,
                model: nft.model,
                thumbnailUrl: nft.thumbnailUrl,
                image: nft.image,
                gallery: nft.media?.gallery || [],
                description: nft.description
            }));
        case 'resource':
            return items.map(nft => ({
                symbol: nft.symbol,
                mint: nft.mint,
                name: nft.name,
                itemType: nft.attributes?.itemType,
                category: nft.attributes?.category,
                rarity: nft.attributes?.rarity,
                class: nft.attributes?.class,
                image: nft.image,
                description: nft.description
            }));
        case 'structure':
            return items.map(nft => ({
                symbol: nft.symbol,
                mint: nft.mint,
                name: nft.name,
                itemType: nft.attributes?.itemType,
                category: nft.attributes?.category,
                rarity: nft.attributes?.rarity,
                class: nft.attributes?.class,
                spec: nft.spec,
                thumbnailUrl: nft.thumbnailUrl,
                image: nft.image,
                description: nft.description
            }));
        default:
            return items; // Caso o itemType não seja reconhecido, mantém a estrutura original
    }
}

// Função principal para capturar e salvar dados
async function captureAndSaveNFTData() {
    try {
        // Lê os dados do localStorage
        const rawData = localStorage.getItem('nfts_raw');
        if (!rawData) {
            console.error('Nenhum dado encontrado no localStorage.');
            return;
        }

        const nftData = JSON.parse(rawData);

        // Processa e salva os dados por tipo de item
        for (const type of itemTypes) {
            // Filtra os dados para incluir apenas os itens do tipo atual
            const filteredData = nftData.filter(nft => nft.attributes?.itemType === type);

            console.log(`Tipo ${type}: Encontrados ${filteredData.length} itens`);

            // Cria a estrutura JSON específica para o tipo de item atual
            const structuredData = createJSONStructure(type, filteredData);

            // Salva o arquivo com o nome baseado no tipo (simulado com localStorage)
            if (structuredData.length > 0) {
                const fileName = `${type}.json`;
                localStorage.setItem(fileName, JSON.stringify(structuredData, null, 2));
                console.log(`Dados do tipo ${type} salvos em "${fileName}" no localStorage.`);
            } else {
                console.log(`Nenhum dado encontrado para o tipo ${type}.`);
            }
        }
    } catch (error) {
        console.error('Erro ao capturar e salvar dados:', error);
    }
}

// Função de monitoramento (simulada para navegador)
function simulateFileWatch() {
    console.log('Monitorando atualizações no localStorage para nfts_raw...');
    let previousData = localStorage.getItem('nfts_raw');
    
    setInterval(() => {
        const currentData = localStorage.getItem('nfts_raw');
        if (currentData !== previousData) {
            console.log('nfts_raw atualizado, executando o processamento...');
            captureAndSaveNFTData();
            previousData = currentData;
        }
    }, 1000); // Verifica a cada 1 segundo
}

// Executa a função inicial de processamento ao iniciar o script
captureAndSaveNFTData();

// Inicia o monitoramento simulado
simulateFileWatch();
