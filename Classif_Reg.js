const fs = require('fs').promises;
const { exec } = require('child_process');

// Função para carregar e processar os dados do arquivo "reg_mint_ent.json"
async function processMintData() {
    try {
        // Carrega o conteúdo do arquivo "reg_mint_ent.json"
        const rawData = await fs.readFile('reg_mint_ent.json', 'utf-8');
        const transactions = JSON.parse(rawData);

        // Objeto para consolidar os dados por "mintAddress"
        const consolidatedData = {};

        transactions.forEach(transaction => {
            const { mintAddress, blockTime, mintAmount, TotalAtlasTransferred, UltimaCompra, UltimaVenda } = transaction;
            
            // Conversão dos valores para formato numérico padrão
            const amount = parseFloat(mintAmount.replace(/\./g, '').replace(',', '.')) || 0;
            const totalTransferred = parseFloat(TotalAtlasTransferred.replace(',', '.')) || 0;
            const ultimaCompraConverted = UltimaCompra ? parseFloat(UltimaCompra.replace(',', '.')) : 0;
            const ultimaVendaConverted = UltimaVenda ? parseFloat(UltimaVenda.replace(',', '.')) : 0;

            if (!consolidatedData[mintAddress]) {
                consolidatedData[mintAddress] = {
                    mintAddress: mintAddress,
                    blockTime: blockTime,
                    mintAmount: amount,
                    TotalAtlasTransferred: totalTransferred,
                    UltimaCompra: ultimaCompraConverted,
                    UltimaVenda: ultimaVendaConverted
                };
            } else {
                // Acumula os valores de "mintAmount" e "TotalAtlasTransferred"
                consolidatedData[mintAddress].mintAmount += amount;
                consolidatedData[mintAddress].TotalAtlasTransferred += totalTransferred;
                
                // Atualiza "UltimaCompra" e "UltimaVenda" apenas se houver valores não nulos
                if (ultimaCompraConverted !== 0) {
                    consolidatedData[mintAddress].UltimaCompra = ultimaCompraConverted;
                }
                if (ultimaVendaConverted !== 0) {
                    consolidatedData[mintAddress].UltimaVenda = ultimaVendaConverted;
                }
                
                // Atualiza "blockTime" com o valor mais recente
                consolidatedData[mintAddress].blockTime = blockTime;
            }
        });

        // Calcula "PreçoMedio" para cada "mintAddress"
        const finalData = Object.values(consolidatedData).map(entry => {
            const mintAmount = entry.mintAmount;
            const totalAtlasTransferred = entry.TotalAtlasTransferred;

            // Calcula PreçoMedio como média de UltimaCompra e UltimaVenda
            const precoMedio = ((entry.UltimaCompra + entry.UltimaVenda) / 2).toFixed(8).replace('.', ',');

            return {
                mintAddress: entry.mintAddress,
                blockTime: entry.blockTime,
                mintAmount: Math.trunc(mintAmount).toLocaleString('pt-BR'),
                TotalAtlasTransferred: totalAtlasTransferred.toFixed(8).replace('.', ','),
                UltimaCompra: entry.UltimaCompra.toFixed(8).replace('.', ','),
                UltimaVenda: entry.UltimaVenda.toFixed(8).replace('.', ','),
                PreçoMedio: precoMedio
            };
        });

        // Salva o conteúdo consolidado em "Media_Price_Mint.json"
        await fs.writeFile('Media_Price_Mint.json', JSON.stringify(finalData, null, 2), 'utf-8');
        console.log('Arquivo "Media_Price_Mint.json" criado com sucesso.');

        // Inicia o script de agendamento em segundo plano
        exec('node ./Save_Agendamento.js', { detached: true, stdio: 'ignore' }, (error) => {
            if (error) {
                console.error(`Erro ao iniciar o script de agendamento: ${error.message}`);
            } else {
                console.log('Script de agendamento "Save_Agendamento.js" iniciado em segundo plano.');
            }
        }).unref();  // Desassocia o processo para que ele rode em segundo plano

    } catch (error) {
        console.error('Erro ao processar os dados:', error);
    }
}

// Executa o script
processMintData();
