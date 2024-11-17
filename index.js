const solanaWeb3 = require('@solana/web3.js');
const fs = require('fs').promises;
const fsSync = require('fs');
const { exec } = require('child_process');

// Conexão Solana
const connection = new solanaWeb3.Connection('https://twilight-cool-fog.solana-mainnet.quiknode.pro/682757799bd5143d24a1369e9546e9bf88554f93', {
    commitment: 'finalized',
    maxSupportedTransactionVersion: 0
});

// Variáveis constantes e globais
const ATLAS_MINT_ADDRESS = 'ATLASXmbPQxBUYbxPsV97usA3fPQYEqzQBUHgiFCUsXx';
const TARGET_PROGRAM_ID = 'traderDnaR5w6Tcoi3NFm53i48FTDNbGjBSZwWXDRrg';
const consolidatedResults = [];
let TARGET_MINT_ADDRESSES = [];
let relatedDataMap = {}; // Mapa para armazenar "mint" -> "name"
let batchCounter = 0;

// Função para carregar endereços de Itens_list.json
async function loadTargetMintAddressesFromFile() {
    try {
        const data = await fs.readFile('Itens_list.json', 'utf-8');
        const jsonData = JSON.parse(data);
        if (jsonData.TARGET_MINT_ADDRESSES) {
            TARGET_MINT_ADDRESSES = jsonData.TARGET_MINT_ADDRESSES;
            console.log('TARGET_MINT_ADDRESSES carregado:', TARGET_MINT_ADDRESSES);
        } else {
            console.log('TARGET_MINT_ADDRESSES não encontrado no arquivo Itens_list.json.');
        }
    } catch (error) {
        console.error('Erro ao ler o arquivo Itens_list.json:', error);
    }
}

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
    const consolidatedFileName = 'reg_mint_Ent.json';
    try {
        let existingData = [];
        if (fsSync.existsSync(consolidatedFileName)) {
            const data = await fs.readFile(consolidatedFileName, 'utf-8');
            existingData = data.trim() ? JSON.parse(data) : [];
        }

        const newData = consolidatedResults.filter(
            newRecord => !existingData.some(existingRecord => existingRecord.signature === newRecord.signature)
        );

        // Adiciona o campo "name" para cada novo registro
        newData.forEach(record => {
            const normalizedMint = record.mintAddress.trim().toLowerCase(); // Normaliza o campo
            record.name = relatedDataMap[normalizedMint] || 'Nome Não Encontrado';

            console.log(`Adicionado name: ${record.name} para mintAddress: ${record.mintAddress}`);
        });

        existingData = existingData.concat(newData);

        await fs.writeFile(consolidatedFileName, JSON.stringify(existingData, null, 2), 'utf-8');
        console.log(`Resultados parciais salvos em "${consolidatedFileName}".`);

        consolidatedResults.length = 0; // Limpa os resultados consolidados após salvar
    } catch (error) {
        console.error(`Erro ao salvar os dados no arquivo consolidado: ${error.message}`);
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
