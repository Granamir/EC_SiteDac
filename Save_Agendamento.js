const fs = require('fs').promises;
const fsSync = require('fs');

// Função para verificar e salvar os registros onde UltimaCompra e UltimaVenda > 0
async function updateDataInterface() {
    try {
        // Carrega o conteúdo de Media_Price_Mint.json
        const rawData = await fs.readFile('Media_Price_Mint.json', 'utf-8');
        const data = JSON.parse(rawData);

        console.log(`Total de registros carregados: ${data.length}`);

        // Filtra os registros com UltimaCompra e UltimaVenda > 0
        const filteredData = data.filter(entry => {
            // Normaliza valores para garantir que vírgulas sejam substituídas por pontos
            const UltimaCompra = parseFloat(entry.UltimaCompra.toString().replace(',', '.'));
            const UltimaVenda = parseFloat(entry.UltimaVenda.toString().replace(',', '.'));
            const validEntry = UltimaCompra > 0 && UltimaVenda > 0;
            
            // Mensagem de depuração para cada entrada
            console.log(`Registro: ${entry.mintAddress}, UltimaCompra: ${UltimaCompra}, UltimaVenda: ${UltimaVenda}, Válido: ${validEntry}`);
            
            return validEntry;
        });

        // Carrega o conteúdo existente de Data_Interface.json, se existir
        let existingData = [];
        try {
            const existingRawData = await fs.readFile('Data_Interface.json', 'utf-8');
            existingData = JSON.parse(existingRawData);
        } catch (error) {
            console.log('Arquivo "Data_Interface.json" não encontrado. Um novo será criado.');
        }

        // Cria um Map para acesso rápido aos registros existentes por mintAddress
        const existingMap = new Map(existingData.map(item => [item.mintAddress, item]));

        // Atualiza registros no Map ou adiciona novos
        filteredData.forEach(entry => {
            existingMap.set(entry.mintAddress, entry);  // Substitui registros existentes e adiciona novos
        });

        // Converte o Map atualizado de volta para array
        const updatedData = Array.from(existingMap.values());

        // Salva os dados atualizados em Data_Interface.json
        await fs.writeFile('Data_Interface.json', JSON.stringify(updatedData, null, 2), 'utf-8');
        console.log(`Dados atualizados em "Data_Interface.json" com ${updatedData.length} registros válidos.`);

        // Atualiza o atributo mtime do arquivo
        fsSync.utimesSync('Data_Interface.json', new Date(), new Date());
        console.log('Atributo mtime do arquivo "Data_Interface.json" atualizado.');

    } catch (error) {
        console.error('Erro ao atualizar "Data_Interface.json":', error);
    }
}

// Executa a função a cada 5 segundos
setInterval(updateDataInterface, 5000);
