// Cap_Nfts_Data.js
const fs = require('fs').promises;
const fsSync = require('fs');  // Para operações de monitoramento de arquivo
const { exec } = require('child_process');

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
            return items;  // Caso o itemType não seja reconhecido, mantém a estrutura original
    }
}

// Função principal para capturar e salvar dados
async function captureAndSaveNFTData() {
    try {
        // Lê os dados do arquivo nfts_raw.json
        const rawData = await fs.readFile('nfts_raw.json', 'utf-8');
        const nftData = JSON.parse(rawData);

        // Processa e salva os dados por tipo de item
        for (const type of itemTypes) {
            // Filtra os dados para incluir apenas os itens do tipo atual, agora buscando dentro de "attributes"
            const filteredData = nftData.filter(nft => nft.attributes?.itemType === type);

            console.log(`Tipo ${type}: Encontrados ${filteredData.length} itens`);

            // Cria a estrutura JSON específica para o tipo de item atual
            const structuredData = createJSONStructure(type, filteredData);

            // Salva o arquivo com o nome baseado no tipo
            if (structuredData.length > 0) {
                const fileName = `${type}.json`;
                await fs.writeFile(fileName, JSON.stringify(structuredData, null, 2), 'utf-8');
                console.log(`Dados do tipo ${type} salvos em "${fileName}".`);
            } else {
                console.log(`Nenhum dado encontrado para o tipo ${type}.`);
            }
        }
    } catch (error) {
        console.error('Erro ao capturar e salvar dados:', error);
    }
}

// Função de monitoramento do arquivo
fsSync.watchFile('nfts_raw.json', (curr, prev) => {
    if (curr.mtime !== prev.mtime) {  // Verifica se a data de modificação mudou
        console.log('nfts_raw.json atualizado, executando o processamento...');
        captureAndSaveNFTData();
    }
});

// Executa a função inicial de processamento ao iniciar o script
captureAndSaveNFTData();
