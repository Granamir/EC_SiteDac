// Função para verificar e salvar os registros onde UltimaCompra e UltimaVenda > 0
async function updateDataInterface() {
    try {
        // Carrega o conteúdo de "Media_Price_Mint" do localStorage
        const rawData = localStorage.getItem('Media_Price_Mint');
        if (!rawData) {
            console.error('Nenhum dado encontrado em "Media_Price_Mint". Certifique-se de que os dados estão armazenados no localStorage.');
            return;
        }

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

        // Carrega o conteúdo existente de "Data_Interface" do localStorage, se existir
        let existingData = [];
        const existingRawData = localStorage.getItem('Data_Interface');
        if (existingRawData) {
            existingData = JSON.parse(existingRawData);
        } else {
            console.log('"Data_Interface" não encontrado no localStorage. Um novo será criado.');
        }

        // Cria um Map para acesso rápido aos registros existentes por mintAddress
        const existingMap = new Map(existingData.map(item => [item.mintAddress, item]));

        // Atualiza registros no Map ou adiciona novos
        filteredData.forEach(entry => {
            existingMap.set(entry.mintAddress, entry); // Substitui registros existentes e adiciona novos
        });

        // Converte o Map atualizado de volta para array
        const updatedData = Array.from(existingMap.values());

        // Salva os dados atualizados em "Data_Interface" no localStorage
        localStorage.setItem('Data_Interface', JSON.stringify(updatedData, null, 2));
        console.log(`Dados atualizados em "Data_Interface" com ${updatedData.length} registros válidos.`);

    } catch (error) {
        console.error('Erro ao atualizar "Data_Interface":', error);
    }
}

// Configura a execução da função a cada 5 segundos
function startInterval() {
    console.log('Iniciando atualização periódica...');
    setInterval(updateDataInterface, 5000); // Atualiza a cada 5 segundos
}

// Inicializa o script
startInterval();
