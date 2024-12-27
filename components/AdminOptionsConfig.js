function AdminOptionsConfig({ onClose }) {
    const [config, setConfig] = React.useState({ maxOptions: 2, options: [] });
    const [newOption, setNewOption] = React.useState('');
    const [loading, setLoading] = React.useState(true);
    const [editingOption, setEditingOption] = React.useState(null);

    React.useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            setLoading(true);
            const systemConfig = await getSystemConfig();
            setConfig(systemConfig);
        } catch (error) {
            reportError(error);
            alert('Erro ao carregar configurações');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (config.maxOptions < 1) {
                alert('O número máximo de opções deve ser maior que 0');
                return;
            }

            if (config.options.length === 0) {
                alert('Adicione pelo menos uma opção');
                return;
            }

            if (config.options.some(option => !option.name.trim())) {
                alert('Todas as opções devem ter um nome');
                return;
            }

            await updateSystemConfig(config);
            alert('Configurações atualizadas com sucesso!');
            onClose();
        } catch (error) {
            reportError(error);
            alert('Erro ao salvar configurações');
        }
    };

    const handleAddOption = () => {
        if (!newOption.trim()) {
            alert('Digite um nome para a nova opção');
            return;
        }
        
        if (config.options.some(o => o.name.toLowerCase() === newOption.trim().toLowerCase())) {
            alert('Já existe uma opção com este nome');
            return;
        }

        const newId = Math.max(0, ...config.options.map(o => o.id)) + 1;
        setConfig(prev => ({
            ...prev,
            options: [...prev.options, { id: newId, name: newOption.trim() }]
        }));
        setNewOption('');
    };

    const handleRemoveOption = (id) => {
        if (config.options.length <= 1) {
            alert('Deve haver pelo menos uma opção disponível');
            return;
        }

        setConfig(prev => ({
            ...prev,
            options: prev.options.filter(o => o.id !== id)
        }));
    };

    const handleUpdateOption = (id, newName) => {
        if (!newName.trim()) {
            alert('O nome da opção não pode ficar vazio');
            return;
        }

        if (config.options.some(o => o.id !== id && o.name.toLowerCase() === newName.trim().toLowerCase())) {
            alert('Já existe uma opção com este nome');
            return;
        }

        setConfig(prev => ({
            ...prev,
            options: prev.options.map(o => 
                o.id === id ? { ...o, name: newName.trim() } : o
            )
        }));
    };

    const handleMaxOptionsChange = (value) => {
        const newValue = parseInt(value);
        if (isNaN(newValue) || newValue < 1) {
            alert('O número máximo de opções deve ser maior que 0');
            return;
        }
        setConfig(prev => ({ ...prev, maxOptions: newValue }));
    };

    if (loading) {
        return <div>Carregando configurações...</div>;
    }

    return (
        <div className="admin-config-panel" data-name="admin-options-config">
            <h3 className="text-xl font-bold mb-4">Configurar Opções</h3>
            
            <div className="input-group" data-name="max-options-group">
                <label className="input-label">Número Máximo de Opções por Professor</label>
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        min="1"
                        value={config.maxOptions}
                        onChange={(e) => handleMaxOptionsChange(e.target.value)}
                        className="input-field w-24"
                    />
                    <span className="text-sm text-gray-600">
                        (Professores poderão escolher até {config.maxOptions} opção{config.maxOptions > 1 ? 'ões' : ''})
                    </span>
                </div>
            </div>

            <div className="options-list mt-6" data-name="options-list">
                <h4 className="font-bold mb-2">Opções Disponíveis ({config.options.length})</h4>
                {config.options.map(option => (
                    <div key={option.id} className="option-item flex items-center gap-2 mb-2 bg-white p-2 rounded shadow-sm">
                        <input
                            type="text"
                            value={option.name}
                            onChange={(e) => handleUpdateOption(option.id, e.target.value)}
                            className="input-field flex-grow"
                            placeholder="Nome da opção"
                        />
                        <button
                            onClick={() => handleRemoveOption(option.id)}
                            className="action-button bg-red-500 hover:bg-red-600"
                            data-name={`remove-option-${option.id}`}
                            title="Remover opção"
                        >
                            Remover
                        </button>
                    </div>
                ))}
            </div>

            <div className="add-option-group mt-4" data-name="add-option-group">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newOption}
                        onChange={(e) => setNewOption(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddOption()}
                        placeholder="Digite o nome da nova opção"
                        className="input-field flex-grow"
                    />
                    <button
                        onClick={handleAddOption}
                        className="action-button bg-green-500 hover:bg-green-600"
                        data-name="add-option-button"
                    >
                        Adicionar
                    </button>
                </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
                <button 
                    onClick={onClose} 
                    className="action-button bg-gray-500 hover:bg-gray-600" 
                    data-name="cancel-button"
                >
                    Cancelar
                </button>
                <button 
                    onClick={handleSave} 
                    className="action-button bg-blue-500 hover:bg-blue-600" 
                    data-name="save-button"
                >
                    Salvar Configurações
                </button>
            </div>
        </div>
    );
}
