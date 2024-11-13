const fs = require('fs').promises;
const fsSync = require('fs');
const { exec, execSync } = require('child_process');

// Lista dos arquivos JSON a serem lidos, removendo 'access.json' e 'collectible.json'
const jsonFiles = [
    'crew.json',
    'resource.json',
    'ship.json',
    'structure.json'
];

// Função principal para ler os arquivos JSON e capturar os mintaddress
async function captureMintAddresses() {
    let allMintAddresses = [];

    try {
        for (const file of jsonFiles) {
            try {
                // Verifica se o arquivo JSON existe antes de tentar ler
                if (fsSync.existsSync(file)) {
                    // Lê o conteúdo do arquivo JSON
                    const rawData = await fs.readFile(file, 'utf-8');
                    const data = JSON.parse(rawData);

                    // Extrai os mintaddress de cada registro no arquivo
                    const mintAddresses = data.map(record => record.mint).filter(Boolean);

                    // Adiciona os mintAddresses ao array principal
                    allMintAddresses = allMintAddresses.concat(mintAddresses);
                    console.log(`Mint addresses capturados de ${file}: ${mintAddresses.length} itens`);
                } else {
                    console.log(`Arquivo não encontrado: ${file}`);
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

        // Caminho do arquivo de saída
        const filePath = 'Itens_list.json';

        // Escreve os mint addresses no arquivo Itens_list.json
        await fs.writeFile(filePath, JSON.stringify(targetMintAddresses, null, 2), 'utf-8');
        console.log(`Mint addresses capturados e salvos em "${filePath}".`);

        // Interrompe e reinicia o arquivo index.js
        restartIndexWithDelay();

    } catch (error) {
        console.error('Erro ao capturar e salvar os mint addresses:', error);
    }
}

// Função para parar e reiniciar o arquivo index.js após 5 segundos
function restartIndexWithDelay() {
    console.log("Parando index.js...");
    
    // Tenta parar o processo index.js
    try {
        execSync('pkill -f "node index.js"'); // Este comando funciona em sistemas Unix (Linux e macOS)
        console.log("index.js parado com sucesso.");
    } catch (error) {
        console.error("Erro ao parar index.js ou processo não encontrado.");
    }

    // Aguarda 5 segundos e reinicia index.js
    setTimeout(() => {
        console.log("Reiniciando index.js...");
        exec('node index.js', (error, stdout, stderr) => {
            if (error) {
                console.error(`Erro ao reiniciar index.js: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`Erro de saída: ${stderr}`);
                return;
            }
            console.log(`Saída de index.js:\n${stdout}`);
        });
    }, 5000); // 5 segundos de delay
}

// Executa a função
captureMintAddresses();
