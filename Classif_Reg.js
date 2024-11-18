// Função para carregar e processar os dados do localStorage
async function processMintData() {
    try {
        // Carrega o conteúdo armazenado em "reg_mint_ent" no localStorage
        const rawData = localStorage.getItem('reg_mint_ent');
        if (!rawData) {
            console.error('Nenhum dado encontrado em "reg_mint_ent". Certifique-se de que os dados estão armazenados no localStorage.');
            return;
        }
        
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

        // Salva os dados consolidados no localStorage
        localStorage.setItem('Media_Price_Mint', JSON.stringify(finalData, null, 2));
        console.log('Dados consolidados salvos em "Media_Price_Mint" no localStorage.');

        // Simula o script de agendamento
        simulateBackgroundTask();

    } catch (error) {
        console.error('Erro ao processar os dados:', error);
    }
}

// Função para simular o script de agendamento
function simulateBackgroundTask() {
    console.log('Simulando execução do script "Save_Agendamento.js" em segundo plano...');
    // Simulação de alguma lógica de agendamento
    setTimeout(() => {
        console.log('Simulação de tarefa de agendamento concluída.');
    }, 2000);
}

// Executa o script
processMintData();
