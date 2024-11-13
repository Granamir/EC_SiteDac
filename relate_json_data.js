const fs = require('fs').promises;
const fsSync = require('fs');

// Arquivos principais e secundários
const mainFile = 'Data_Interface.json';
const secondaryFiles = ['resource.json', 'ship.json', 'structure.json', 'crew.json'];

// Função principal para carregar e relacionar os dados
async function relateJsonData() {
    try {
        // Carrega o arquivo principal
        const mainRawData = await fs.readFile(mainFile, 'utf-8');
        const mainData = JSON.parse(mainRawData);

        console.log(`Registros carregados do arquivo principal: ${mainData.length}`);

        // Cria um mapa com base no mintAddress do arquivo principal
        const mainDataMap = new Map(mainData.map(item => [item.mintAddress, { ...item }]));

        // Processa cada arquivo secundário
        for (const file of secondaryFiles) {
            try {
                const secondaryRawData = await fs.readFile(file, 'utf-8');
                const secondaryData = JSON.parse(secondaryRawData);

                console.log(`Registros carregados de ${file}: ${secondaryData.length}`);

                // Relaciona os dados do arquivo secundário com os registros do arquivo principal
                secondaryData.forEach(entry => {
                    const mintAddress = entry.mint || entry[' mint']; // Considera ambas as possibilidades de chave
                    if (mainDataMap.has(mintAddress)) {
                        const relatedData = mainDataMap.get(mintAddress);

                        // Adiciona os campos do arquivo secundário ao registro principal
                        Object.keys(entry).forEach(key => {
                            if (!relatedData[key]) {
                                relatedData[key] = entry[key];
                            }
                        });

                        // Atualiza o mapa com os dados relacionados
                        mainDataMap.set(mintAddress, relatedData);
                    }
                });
            } catch (error) {
                console.error(`Erro ao processar ${file}:`, error.message);
            }
        }

        // Converte o mapa atualizado para um array
        const relatedData = Array.from(mainDataMap.values());

        // Salva o arquivo de saída com os dados relacionados
        const outputFileName = 'Related_Data.json';
        await fs.writeFile(outputFileName, JSON.stringify(relatedData, null, 2), 'utf-8');
        console.log(`Dados relacionados salvos em "${outputFileName}".`);
    } catch (error) {
        console.error('Erro ao relacionar os dados:', error.message);
    }
}

// Monitoramento de alterações no arquivo principal
fsSync.watchFile(mainFile, (curr, prev) => {
    if (curr.mtime !== prev.mtime) {
        console.log(`"${mainFile}" atualizado. Executando o processamento de relacionamento...`);
        relateJsonData();
    }
});

// Executa a função inicial ao carregar o script
relateJsonData();
