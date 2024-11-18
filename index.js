// Importando biblioteca Solana Web3 no navegador (certifique-se de carregar o script em seu HTML)
const solanaWeb3 = window.solanaWeb3; // Supondo que a biblioteca seja carregada separadamente via CDN

// Substituir leitura de arquivos por fetch e manipulação de JSON
async function readFile(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`Erro ao carregar arquivo ${filePath}: ${response.statusText}`);
        return await response.text();
    } catch (error) {
        console.error(`Erro ao ler o arquivo ${filePath}:`, error);
        return null;
    }
}

// Substituir escrita de arquivos com salvamento local (ex.: JSON para download)
function saveFileAsDownload(filename, data) {
    const blob = new Blob([data], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Conexão Solana
const solanaWeb3 = window.solanaWeb3; // Certifique-se de que a biblioteca foi importada

const connection = new solanaWeb3.Connection(
    'https://twilight-cool-fog.solana-mainnet.quiknode.pro/682757799bd5143d24a1369e9546e9bf88554f93',
    {
        commitment: 'finalized',
        maxSupportedTransactionVersion: 0,
    }
);

const TARGET_PROGRAM_ID = 'traderDnaR5w6Tcoi3NFm53i48FTDNbGjBSZwWXDRrg';
const consolidatedResults = [];
let TARGET_MINT_ADDRESSES = [];
let relatedDataMap = {};

async function loadTargetMintAddressesFromFile() {
    try {
        const response = await fetch('Itens_list.json');
        if (!response.ok) throw new Error(`Erro ao carregar Itens_list.json: ${response.statusText}`);
        const jsonData = await response.json();
        TARGET_MINT_ADDRESSES = jsonData.TARGET_MINT_ADDRESSES || [];
        console.log('TARGET_MINT_ADDRESSES carregado:', TARGET_MINT_ADDRESSES);
    } catch (error) {
        console.error('Erro ao carregar Itens_list.json:', error);
    }
}

async function loadRelatedData() {
    const files = ['crew.json', 'resource.json', 'ship.json', 'structure.json'];
    try {
        const allData = await Promise.all(
            files.map(async (file) => {
                const response = await fetch(`${file}?t=${new Date().getTime()}`);
                if (!response.ok) throw new Error(`Erro ao carregar ${file}: ${response.statusText}`);
                return await response.json();
            })
        );

        relatedDataMap = allData.flat().reduce((map, item) => {
            const normalizedMint = (item.mint || '').trim().toLowerCase();
            map[normalizedMint] = item.name || 'Nome Não Encontrado';
            return map;
        }, {});

        console.log('Mapa relatedDataMap criado com sucesso.');
    } catch (error) {
        console.error('Erro ao carregar os arquivos JSON:', error);
    }
}

function saveFileAsDownload(filename, data) {
    const blob = new Blob([data], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Adapte outras funções similares para usar fetch e salvar como download

// Função para carregar os dados combinados dos arquivos JSON
async function loadRelatedData() {
    const files = ['crew.json', 'resource.json', 'ship.json', 'structure.json'];
    try {
        console.log('Carregando arquivos JSON:', files);

        const allData = await Promise.all(
            files.map(async (file) => {
                const data = await fs.readFile(file, 'utf-8');
                return JSON.parse(data);
            })
        );

        // Combina todos os dados em um único mapa
        relatedDataMap = allData.flat().reduce((map, item) => {
            const normalizedMint = (item.mint || '').trim().toLowerCase(); // Corrigido para usar "mint"
            map[normalizedMint] = item.name || 'Nome Não Encontrado';
            return map;
        }, {});

        console.log('Mapa relatedDataMap criado com sucesso.');
        console.log('Exemplo de dados no mapa:', Object.entries(relatedDataMap).slice(0, 5)); // Exibe os 5 primeiros itens do mapa
    } catch (error) {
        console.error('Erro ao carregar os arquivos JSON:', error);
    }
}

// Funções de delay, busca de transações e processamento de lotes
async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Função para buscar transações
async function getTransactionsByMintAddress(mintAddress) {
    console.log(`\nBuscando transações para o endereço de mint: ${mintAddress}`);
    try {
        const signatures = await connection.getSignaturesForAddress(new solanaWeb3.PublicKey(mintAddress), { limit: 3 });

        for (let signatureInfo of signatures) {
            try {
                const transaction = await connection.getParsedTransaction(signatureInfo.signature, { maxSupportedTransactionVersion: 0 });

                if (transaction) {
                    const programIds = transaction.transaction.message.instructions.map(instr => instr.programId.toString());
                    if (programIds.includes(TARGET_PROGRAM_ID)) {
                        let atlasTransfers = [];
                        let mainAccount = null;
                        let mintAmount = 0;
                        let totalAtlasTransferred = 0;
                        const involvedAccounts = new Set();
                        let tradeType = "";

                        if (transaction.meta && transaction.meta.preTokenBalances && transaction.meta.postTokenBalances) {
                            transaction.meta.preTokenBalances.forEach((preBalance) => {
                                if (preBalance.mint === mintAddress) {
                                    const postBalance = transaction.meta.postTokenBalances.find(post => post.owner === preBalance.owner && post.mint === mintAddress);
                                    if (postBalance) {
                                        const mintPreBalance = parseFloat(preBalance.uiTokenAmount.uiAmountString);
                                        const mintPostBalance = parseFloat(postBalance.uiTokenAmount.uiAmountString);
                                        const mintChange = mintPostBalance - mintPreBalance;

                                        mainAccount = preBalance.owner;
                                        mintAmount = Math.abs(mintChange);
                                    }
                                }
                            });

                            transaction.meta.preTokenBalances.forEach((preBalance) => {
                                if (preBalance.mint === ATLAS_MINT_ADDRESS) {
                                    const postBalance = transaction.meta.postTokenBalances.find(post => post.owner === preBalance.owner && post.mint === ATLAS_MINT_ADDRESS);
                                    if (postBalance) {
                                        const atlasPreBalance = parseFloat(preBalance.uiTokenAmount.uiAmountString);
                                        const atlasPostBalance = parseFloat(postBalance.uiTokenAmount.uiAmountString);
                                        const atlasChange = atlasPostBalance - atlasPreBalance;

                                        if (atlasChange !== 0 && preBalance.owner !== mainAccount) {
                                            involvedAccounts.add(preBalance.owner);
                                            atlasTransfers.push({
                                                sourceAccount: atlasChange < 0 ? preBalance.owner : mainAccount,
                                                destinationAccount: atlasChange < 0 ? mainAccount : preBalance.owner,
                                                atlasChange: Math.abs(atlasChange).toFixed(8).replace('.', ',')
                                            });
                                            totalAtlasTransferred += Math.abs(atlasChange) / 2;
                                        }
                                    }
                                }
                            });

                            if (atlasTransfers.length >= 2) {
                                const firstTransfer = atlasTransfers[0];
                                const secondTransfer = atlasTransfers[1];

                                if (firstTransfer.destinationAccount === secondTransfer.sourceAccount) {
                                    tradeType = "Venda";
                                } else if (firstTransfer.sourceAccount === secondTransfer.destinationAccount) {
                                    tradeType = "Compra";
                                }
                            }

                            if (involvedAccounts.size >= 3 && tradeType) {
                                const valorMedio = mintAmount > 0 ? ((totalAtlasTransferred / mintAmount)).toFixed(8).replace('.', ',') : '0,00000000';

                                const formattedBlockTime = transaction.blockTime
                                    ? new Date(transaction.blockTime * 1000).toLocaleDateString('pt-BR')
                                    : null;

                                const tradeSpecificField = tradeType === "Compra" ? { UltimaCompra: valorMedio } : { UltimaVenda: valorMedio };

                                consolidatedResults.push({
                                    mintAddress: mintAddress,
                                    tipoNegociacao: tradeType,
                                    signature: signatureInfo.signature,
                                    slot: transaction.slot,
                                    blockTime: formattedBlockTime,
                                    mintAmount: Math.round(mintAmount).toLocaleString('pt-BR'),
                                    TotalAtlasTransferred: totalAtlasTransferred.toFixed(8).replace('.', ','),
                                    ...tradeSpecificField,
                                    atlasTransfers: atlasTransfers
                                });
                            }
                        }
                    }
                }
            } catch (innerError) {
                console.error(`Erro ao buscar a transação ${signatureInfo.signature}:`, innerError.message);
            }
        }
    } catch (error) {
        console.error(`Erro ao buscar transações para o endereço ${mintAddress}:`, error);
    }
}

async function fetchAndDisplayTransactions() {
    try {
        const response = await fetch(`reg_mint_Ent.json?t=${new Date().getTime()}`); // Adicionado o parâmetro
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        console.log('Dados carregados das transações:', data);

        const transactionsTableBody = document.getElementById('transactionsTable').querySelector('tbody');
        transactionsTableBody.innerHTML = ''; // Limpa a tabela antes de atualizar

        const recentData = data.slice(-25).reverse();
        recentData.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><img src="img/${item.tipoNegociacao === 'Venda' ? 'Venda.png' : 'Compra.png'}"></td>
                <td>${item.name || '-'}</td>
                <td>${item.tipoNegociacao || '-'}</td>
                <td>${item.mintAmount || '-'}</td>
                <td>${item.tipoNegociacao === 'Venda' ? item.UltimaVenda || '-' : item.UltimaCompra || '-'}</td>
            `;
            transactionsTableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Erro ao carregar e processar dados das transações:', error);
    }
}

// Processa lotes de transações
async function fetchTransactionsInBatches() {
    while (true) {
        for (let i = 0; i < TARGET_MINT_ADDRESSES.length; i += 3) {
            const batch = TARGET_MINT_ADDRESSES.slice(i, i + 3);
            console.log(`Processando o lote de endereços: ${batch}`);

            await Promise.all(batch.map(mintAddress => getTransactionsByMintAddress(mintAddress)));

            console.log('Aguardando 1 segundos antes de processar o próximo lote...');
            await delay(1000);

            batchCounter += batch.length;

            if (batchCounter >= 20) {
                console.log('Salvando resultados parciais...');
                await saveConsolidatedResults();
                batchCounter = 0; // Reinicia o contador
            }
        }

        console.log("Reiniciando a busca a partir do primeiro lote...");
    }
}

// Função para salvar resultados no arquivo consolidado
async function saveConsolidatedResults() {
    try {
        const consolidatedFileName = 'reg_mint_Ent.json';
        const newData = consolidatedResults.map(record => {
            const normalizedMint = record.mintAddress.trim().toLowerCase();
            record.name = relatedDataMap[normalizedMint] || 'Nome Não Encontrado';
            return record;
        });

        saveFileAsDownload(consolidatedFileName, JSON.stringify(newData, null, 2));
        consolidatedResults.length = 0; // Limpa os resultados consolidados após salvar
        console.log(`Resultados salvos para download: "${consolidatedFileName}"`);
    } catch (error) {
        console.error('Erro ao salvar os dados consolidados:', error);
    }
}
// Fluxo principal
(async () => {
    try {
        await loadTargetMintAddressesFromFile();
        await loadRelatedData();
        await fetchTransactionsInBatches();
    } catch (error) {
        console.error('Erro no fluxo principal:', error);
    }
})();
