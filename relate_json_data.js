// Arquivos principais e secundários simulados no localStorage
const mainFileKey = 'Data_Interface'; // Chave para o arquivo principal no localStorage
const secondaryFilesKeys = ['resource', 'ship', 'structure', 'crew']; // Chaves para os arquivos secundários no localStorage

// Função principal para carregar e relacionar os dados
async function relateJsonData() {
    try {
        console.log('Iniciando o relacionamento de dados...');

        // Carrega o arquivo principal do localStorage
        const mainRawData = localStorage.getItem(mainFileKey);
        if (!mainRawData) {
            console.error(`Arquivo principal "${mainFileKey}" não encontrado no localStorage.`);
            return;
        }

        const mainData = JSON.parse(mainRawData);
        console.log(`Registros carregados do arquivo principal: ${mainData.length}`);

        // Cria um mapa com base no mintAddress do arquivo principal
        const mainDataMap = new Map(mainData.map(item => [item.mintAddress, { ...item }]));

        // Processa cada arquivo secundário
        for (const key of secondaryFilesKeys) {
            try {
                const response = await fetch(`${key}.json?t=${new Date().getTime()}`); // Adiciona parâmetro para evitar cache
                if (!response.ok) throw new Error(`Erro HTTP! status: ${response.status}`);

                const secondaryData = await response.json();
                console.log(`Registros carregados de ${key}.json: ${secondaryData.length}`);

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
                console.error(`Erro ao processar ${key}.json:`, error.message);
            }
        }

        // Converte o mapa atualizado para um array
        const relatedData = Array.from(mainDataMap.values());

        // Salva os dados relacionados no localStorage
        const outputFileKey = 'Related_Data';
        localStorage.setItem(outputFileKey, JSON.stringify(relatedData, null, 2));
        console.log(`Dados relacionados salvos no localStorage com a chave "${outputFileKey}".`);
    } catch (error) {
        console.error('Erro ao relacionar os dados:', error.message);
    }
}

// Função para monitorar alterações no arquivo principal
function monitorMainFileChanges() {
    console.log(`Monitorando alterações no arquivo principal "${mainFileKey}"...`);
    let previousData = localStorage.getItem(mainFileKey);

    setInterval(() => {
        const currentData = localStorage.getItem(mainFileKey);
        if (currentData !== previousData) {
            console.log(`"${mainFileKey}" atualizado. Executando o processamento de relacionamento...`);
            previousData = currentData;
            relateJsonData();
        }
    }, 5000); // Verifica alterações a cada 5 segundos
}

// Executa a função inicial ao carregar o script
relateJsonData();
monitorMainFileChanges();
