const axios = require('axios');
const fs = require('fs').promises;
const { exec } = require('child_process');

// URL da API dos NFTs do Star Atlas (substitua pela URL correta)
const apiUrl = 'https://galaxy.staratlas.com/nfts'; // Exemplo fictício

// Função para buscar e salvar os dados da API
async function fetchNFTData() {
    try {
        const response = await axios.get(apiUrl);

        if (response.status === 200) {
            const nftData = response.data;

            // Salva os dados brutos em um arquivo para análise
            await fs.writeFile('nfts_raw.json', JSON.stringify(nftData, null, 2), 'utf-8');
            console.log('Dados da API salvos em "nfts_raw.json".');

            // Aguarda 10 segundos e executa o script Cap_Nfts_Data.js
            setTimeout(() => {
                console.log("Executando Cap_Nfts_Data.js após 10 segundos...");
                exec('node Cap_Nfts_Data.js', (error, stdout, stderr) => {
                    if (error) {
                        console.error(`Erro ao executar Cap_Nfts_Data.js: ${error.message}`);
                        return;
                    }
                    if (stderr) {
                        console.error(`Erro de saída: ${stderr}`);
                        return;
                    }
                    console.log(`Saída de Cap_Nfts_Data.js:\n${stdout}`);
                });
            }, 10000); // Delay de 10 segundos

            // Aguarda 15 segundos e executa o script Filtro_MintAddress.js
            setTimeout(() => {
                console.log("Executando Filtro_MintAddress.js após 15 segundos...");
                exec('node Filtro_MintAddress.js', (error, stdout, stderr) => {
                    if (error) {
                        console.error(`Erro ao executar Filtro_MintAddress.js: ${error.message}`);
                        return;
                    }
                    if (stderr) {
                        console.error(`Erro de saída: ${stderr}`);
                        return;
                    }
                    console.log(`Saída de Filtro_MintAddress.js:\n${stdout}`);
                });
            }, 15000); // Delay de 15 segundos

        } else {
            console.error(`Erro: Status de resposta ${response.status}`);
        }
    } catch (error) {
        console.error('Erro ao buscar dados da API:', error);
    }
}

// Executa a função
fetchNFTData();
