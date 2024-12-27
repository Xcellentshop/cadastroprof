function AdminOptionsConfig({ onClose }) {
    const [config, setConfig] = React.useState({ maxOptions: 2, options: [] });
    const [newOption, setNewOption] = React.useState('');
    const [newSubOption, setNewSubOption] = React.useState('');
    const [loading, setLoading] = React.useState(true);
    const [editingOption, setEditingOption] = React.useState(null);
    const [selectedOption, setSelectedOption] = React.useState(null);

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
            options: [...prev.options, { id: newId, name: newOption.trim(), subOptions: [] }]
        }));
        setNewOption('');
    };

    const handleAddSubOption = (optionId) => {
        if (!newSubOption.trim()) {
            alert('Digite um nome para a nova sub-opção');
            return;
        }

        const parentOption = config.options.find(o => o.id === optionId);
        if (!parentOption) return;

        if (parentOption.subOptions.some(so => so.name.toLowerCase() === newSubOption.trim().toLowerCase())) {
            alert('Já existe uma sub-opção com este nome');
            return;
        }

        const newSubId = optionId * 10 + (parentOption.subOptions.length + 1);
        setConfig(prev => ({
            ...prev,
            options: prev.options.map(o => 
                o.id === optionId 
                    ? {
                        ...o,
                        subOptions: [...o.subOptions, { id: newSubId, name: newSubOption.trim() }]
                    }
                    : o
            )
        }));
        setNewSubOption('');
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

    const handleRemoveSubOption = (optionId, subOptionId) => {
        setConfig(prev => ({
            ...prev,
            options: prev.options.map(o => 
                o.id === optionId
                    ? {
                        ...o,
                        subOptions: o.subOptions.filter(so => so.id !== subOptionId)
                    }
                    : o
            )
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

    const handleUpdateSubOption = (optionId, subOptionId, newName) => {
        if (!newName.trim()) {
            alert('O nome da sub-opção não pode ficar vazio');
            return;
        }

        const parentOption = config.options.find(o => o.id === optionId);
        if (!parentOption) return;

        if (parentOption.subOptions.some(so => so.id !== subOptionId && so.name.toLowerCase() === newName.trim().toLowerCase())) {
            alert('Já existe uma sub-opção com este nome');
            return;
        }

        setConfig(prev => ({
            ...prev,
            options: prev.options.map(o => 
                o.id === optionId
                    ? {
                        ...o,
                        subOptions: o.subOptions.map(so =>
                            so.id === subOptionId
                                ? { ...so, name: newName.trim() }
                                : so
                        )
                    }
                    : o
            )
        }));
    };

    const handleMaxOptionsChange = (value) => {
        const newValue = parseInt(value);
        if (isNaN(newValue)) return;
        setConfig(prev => ({ ...prev, maxOptions: newValue }));
    };

    if (loading) {
        return <div className="loading">Carregando...</div>;
    }

    return (
        <div className="admin-options-config">
            <h2>Configurar Opções</h2>
            
            <div className="config-section">
                <label>
                    Número máximo de opções por professor:
                    <input
                        type="number"
                        min="1"
                        value={config.maxOptions}
                        onChange={(e) => handleMaxOptionsChange(e.target.value)}
                    />
                </label>
            </div>

            <div className="config-section">
                <h3>Opções Disponíveis</h3>
                <div className="add-option">
                    <input
                        type="text"
                        value={newOption}
                        onChange={(e) => setNewOption(e.target.value)}
                        placeholder="Nova opção..."
                    />
                    <button onClick={handleAddOption}>Adicionar</button>
                </div>

                <div className="options-list">
                    {config.options.map(option => (
                        <div key={option.id} className="option-item">
                            {editingOption === option.id ? (
                                <input
                                    type="text"
                                    value={option.name}
                                    onChange={(e) => handleUpdateOption(option.id, e.target.value)}
                                    onBlur={() => setEditingOption(null)}
                                    autoFocus
                                />
                            ) : (
                                <div className="option-content">
                                    <span onClick={() => setEditingOption(option.id)}>{option.name}</span>
                                    <button onClick={() => handleRemoveOption(option.id)}>Remover</button>
                                    <button onClick={() => setSelectedOption(selectedOption === option.id ? null : option.id)}>
                                        {selectedOption === option.id ? 'Fechar' : 'Sub-opções'}
                                    </button>
                                </div>
                            )}

                            {selectedOption === option.id && (
                                <div className="sub-options">
                                    <div className="add-sub-option">
                                        <input
                                            type="text"
                                            value={newSubOption}
                                            onChange={(e) => setNewSubOption(e.target.value)}
                                            placeholder="Nova sub-opção..."
                                        />
                                        <button onClick={() => handleAddSubOption(option.id)}>Adicionar Sub-opção</button>
                                    </div>
                                    <div className="sub-options-list">
                                        {option.subOptions.map(subOption => (
                                            <div key={subOption.id} className="sub-option-item">
                                                <input
                                                    type="text"
                                                    value={subOption.name}
                                                    onChange={(e) => handleUpdateSubOption(option.id, subOption.id, e.target.value)}
                                                />
                                                <button onClick={() => handleRemoveSubOption(option.id, subOption.id)}>
                                                    Remover
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="config-actions">
                <button onClick={handleSave}>Salvar</button>
                <button onClick={onClose}>Cancelar</button>
            </div>
        </div>
    );
}
