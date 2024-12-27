function AdminOptionsConfig({ onClose }) {
    const [config, setConfig] = React.useState({ maxOptions: 2, options: [] });
    const [newOption, setNewOption] = React.useState('');
    const [loading, setLoading] = React.useState(true);

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
            await updateSystemConfig(config);
            alert('Configurações atualizadas com sucesso!');
            onClose();
        } catch (error) {
            reportError(error);
            alert('Erro ao salvar configurações');
        }
    };

    const handleAddOption = () => {
        if (!newOption.trim()) return;
        
        const newId = Math.max(0, ...config.options.map(o => o.id)) + 1;
        setConfig(prev => ({
            ...prev,
            options: [...prev.options, { id: newId, name: newOption.trim() }]
        }));
        setNewOption('');
    };

    const handleRemoveOption = (id) => {
        setConfig(prev => ({
            ...prev,
            options: prev.options.filter(o => o.id !== id)
        }));
    };

    const handleUpdateOption = (id, newName) => {
        setConfig(prev => ({
            ...prev,
            options: prev.options.map(o => 
                o.id === id ? { ...o, name: newName } : o
            )
        }));
    };

    if (loading) {
        return <div>Carregando configurações...</div>;
    }

    return (
        <div className="admin-config-panel" data-name="admin-options-config">
            <h3 className="text-xl font-bold mb-4">Configurar Opções</h3>
            
            <div className="input-group" data-name="max-options-group">
                <label className="input-label">Número Máximo de Opções por Professor</label>
                <input
                    type="number"
                    min="1"
                    value={config.maxOptions}
                    onChange={(e) => setConfig(prev => ({ ...prev, maxOptions: parseInt(e.target.value) }))}
                    className="input-field"
                />
            </div>

            <div className="options-list" data-name="options-list">
                <h4 className="font-bold mb-2">Opções Disponíveis</h4>
                {config.options.map(option => (
                    <div key={option.id} className="option-item flex items-center gap-2 mb-2">
                        <input
                            type="text"
                            value={option.name}
                            onChange={(e) => handleUpdateOption(option.id, e.target.value)}
                            className="input-field flex-grow"
                        />
                        <button
                            onClick={() => handleRemoveOption(option.id)}
                            className="action-button bg-red-500"
                            data-name={`remove-option-${option.id}`}
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
                        placeholder="Nova opção"
                        className="input-field flex-grow"
                    />
                    <button
                        onClick={handleAddOption}
                        className="action-button"
                        data-name="add-option-button"
                    >
                        Adicionar
                    </button>
                </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
                <button onClick={onClose} className="action-button bg-gray-500" data-name="cancel-button">
                    Cancelar
                </button>
                <button onClick={handleSave} className="action-button" data-name="save-button">
                    Salvar Configurações
                </button>
            </div>
        </div>
    );
}
