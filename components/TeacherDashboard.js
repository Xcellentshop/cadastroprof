function TeacherDashboard({ teacherId }) {
    const [teacherData, setTeacherData] = React.useState(null);
    const [systemConfig, setSystemConfig] = React.useState(null);
    const [editMode, setEditMode] = React.useState(false);
    const [formData, setFormData] = React.useState({
        fullName: '',
        phone: '',
        birthDate: '',
        selectedOptions: [],
        selectedSubOptions: {}
    });
    const [history, setHistory] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
        loadInitialData();
    }, [teacherId]);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Load system config first
            const config = await getSystemConfig();
            if (!config) {
                throw new Error('Não foi possível carregar as configurações do sistema');
            }
            setSystemConfig(config);

            // Then load teacher data
            const teacherRef = db.collection('teachers').doc(teacherId);
            const doc = await teacherRef.get();
            
            if (!doc.exists) {
                throw new Error('Professor não encontrado');
            }

            const data = doc.data();
            setTeacherData(data);
            setFormData({
                fullName: data.fullName || '',
                phone: data.phone || '',
                birthDate: data.birthDate || '',
                selectedOptions: data.selectedOptions || [],
                selectedSubOptions: data.selectedSubOptions || {}
            });

            // Load history
            const historySnapshot = await db.collection('history')
                .where('teacherId', '==', teacherId)
                .orderBy('timestamp', 'desc')
                .limit(10)
                .get();

            const historyData = historySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setHistory(historyData);

        } catch (err) {
            console.error('Error loading data:', err);
            setError(err.message || 'Erro ao carregar dados');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleOptionSelect = (optionId) => {
        if (!systemConfig) return;

        setFormData(prev => {
            const currentOptions = [...prev.selectedOptions];
            const index = currentOptions.indexOf(optionId);
            let newSelectedOptions;
            let newSelectedSubOptions = { ...prev.selectedSubOptions };

            if (index === -1) {
                if (currentOptions.length < systemConfig.maxOptions) {
                    newSelectedOptions = [...currentOptions, optionId];
                } else {
                    alert(`Por favor, desmarque uma das opções para selecionar uma nova. Máximo permitido: ${systemConfig.maxOptions}`);
                    return prev;
                }
            } else {
                newSelectedOptions = currentOptions.filter(id => id !== optionId);
                delete newSelectedSubOptions[optionId];
            }

            return {
                ...prev,
                selectedOptions: newSelectedOptions,
                selectedSubOptions: newSelectedSubOptions
            };
        });
    };

    const handleSubOptionSelect = (optionId, subOptionId) => {
        if (!systemConfig) return;

        setFormData(prev => ({
            ...prev,
            selectedSubOptions: {
                ...prev.selectedSubOptions,
                [optionId]: subOptionId
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            if (!systemConfig) {
                throw new Error('Configurações do sistema não carregadas');
            }

            // Validate sub-options
            const invalidSelection = formData.selectedOptions.some(optionId => {
                const option = systemConfig.options.find(o => o.id === optionId);
                return option?.subOptions?.length > 0 && !formData.selectedSubOptions[optionId];
            });

            if (invalidSelection) {
                alert('Por favor, selecione uma sub-opção para cada opção selecionada');
                return;
            }

            const teacherRef = db.collection('teachers').doc(teacherId);
            await teacherRef.update({
                ...formData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Add to history
            await db.collection('history').add({
                teacherId,
                action: 'update',
                changes: {
                    before: {
                        fullName: teacherData.fullName,
                        phone: teacherData.phone,
                        birthDate: teacherData.birthDate,
                        selectedOptions: teacherData.selectedOptions,
                        selectedSubOptions: teacherData.selectedSubOptions
                    },
                    after: formData
                },
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });

            setTeacherData(formData);
            setEditMode(false);
            loadInitialData();
            alert('Dados atualizados com sucesso!');
        } catch (error) {
            console.error('Error updating teacher:', error);
            alert('Erro ao atualizar dados. Por favor, tente novamente.');
        }
    };

    if (loading) {
        return <div className="loading">Carregando...</div>;
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-message">{error}</div>
                <button onClick={loadInitialData} className="retry-button">
                    Tentar Novamente
                </button>
            </div>
        );
    }

    if (!teacherData || !systemConfig) {
        return <div className="error-message">Dados não encontrados</div>;
    }

    const renderOptionsList = () => {
        return systemConfig.options.map(option => {
            const hasSubOptions = Array.isArray(option.subOptions) && option.subOptions.length > 0;
            const isSelected = formData.selectedOptions.includes(option.id);
            const selectedSubOption = hasSubOptions ? formData.selectedSubOptions[option.id] : null;

            return (
                <div key={option.id} className="option-item">
                    <div className="option-header">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleOptionSelect(option.id)}
                                disabled={!isSelected && formData.selectedOptions.length >= systemConfig.maxOptions}
                            />
                            {option.name}
                        </label>
                    </div>
                    
                    {isSelected && hasSubOptions && (
                        <div className="sub-options-container">
                            {option.subOptions.map(subOption => (
                                <label key={subOption.id} className="radio-label sub-option">
                                    <input
                                        type="radio"
                                        name={`subOption-${option.id}`}
                                        checked={selectedSubOption === subOption.id}
                                        onChange={() => handleSubOptionSelect(option.id, subOption.id)}
                                    />
                                    {subOption.name}
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            );
        });
    };

    return (
        <div className="teacher-dashboard">
            <h2>Meu Cadastro</h2>
            {editMode ? (
                <form onSubmit={handleSubmit} className="edit-form">
                    <div className="form-group">
                        <label>Nome Completo</label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Telefone</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Data de Nascimento</label>
                        <input
                            type="date"
                            name="birthDate"
                            value={formData.birthDate}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="options-container">
                        <h3>Opções Disponíveis</h3>
                        {renderOptionsList()}
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="save-button">Salvar</button>
                        <button type="button" onClick={() => setEditMode(false)} className="cancel-button">Cancelar</button>
                    </div>
                </form>
            ) : (
                <div className="teacher-info">
                    <div className="info-group">
                        <label>Nome Completo:</label>
                        <p>{teacherData.fullName}</p>
                    </div>
                    <div className="info-group">
                        <label>Telefone:</label>
                        <p>{teacherData.phone}</p>
                    </div>
                    <div className="info-group">
                        <label>Data de Nascimento:</label>
                        <p>{teacherData.birthDate}</p>
                    </div>

                    <div className="teacher-options">
                        <h3>Opções Selecionadas:</h3>
                        <div className="options-list">
                            {teacherData.selectedOptions?.map(optionId => {
                                const option = systemConfig.options.find(o => o.id === optionId);
                                if (!option) return null;

                                const subOption = option.subOptions?.find(
                                    sub => teacherData.selectedSubOptions?.[optionId] === sub.id
                                );
                                
                                return (
                                    <div key={option.id} className="option-item">
                                        <div className="option-name">{option.name}</div>
                                        {subOption && (
                                            <div className="sub-option-name">
                                                → {subOption.name}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <button onClick={() => setEditMode(true)} className="edit-button">
                        Editar Dados
                    </button>
                </div>
            )}

            <div className="history-section">
                <h3>Histórico de Alterações</h3>
                {history.length === 0 ? (
                    <p>Nenhuma alteração registrada.</p>
                ) : (
                    <div className="history-list">
                        {history.map(entry => (
                            <div key={entry.id} className="history-item">
                                <p>Data: {new Date(entry.timestamp?.toDate()).toLocaleString()}</p>
                                <p>Ação: {entry.action}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
