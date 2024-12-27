function TeacherDashboard({ teacher, onLogout }) {
    const [formData, setFormData] = React.useState(teacher);
    const [history, setHistory] = React.useState([]);
    const [systemConfig, setSystemConfig] = React.useState(null);

    React.useEffect(() => {
        fetchHistory();
        loadSystemConfig();
    }, [teacher.id]);

    const loadSystemConfig = async () => {
        try {
            const config = await getSystemConfig();
            setSystemConfig(config);
        } catch (error) {
            reportError(error);
        }
    };

    const fetchHistory = async () => {
        try {
            const historyRef = await db.collection('teachers')
                .doc(teacher.id)
                .collection('history')
                .orderBy('timestamp', 'desc')
                .get();

            const historyData = historyRef.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setHistory(historyData);
        } catch (error) {
            reportError(error);
        }
    };

    const handleInputChange = (e) => {
        try {
            const { name, value } = e.target;
            if (name === 'phone') {
                const cleaned = value.replace(/\D/g, '');
                if (cleaned.length <= 11) {
                    setFormData(prev => ({
                        ...prev,
                        [name]: cleaned
                    }));
                }
            } else {
                setFormData(prev => ({
                    ...prev,
                    [name]: value
                }));
            }
        } catch (error) {
            reportError(error);
        }
    };

    const handleOptionSelect = (optionId) => {
        try {
            setFormData(prev => {
                const currentOptions = [...prev.selectedOptions];
                const index = currentOptions.indexOf(optionId);

                if (index === -1) {
                    if (currentOptions.length < (systemConfig?.maxOptions || 2)) {
                        currentOptions.push(optionId);
                    } else {
                        alert(`Por favor, desmarque uma das opções para selecionar uma nova. Máximo permitido: ${systemConfig?.maxOptions || 2}`);
                    }
                } else {
                    currentOptions.splice(index, 1);
                }

                return {
                    ...prev,
                    selectedOptions: currentOptions
                };
            });
        } catch (error) {
            reportError(error);
        }
    };

    const handleUpdate = async (e) => {
        try {
            e.preventDefault();

            const changes = {};
            if (formData.fullName !== teacher.fullName) changes['Nome Completo'] = formData.fullName;
            if (unformatPhone(formData.phone) !== unformatPhone(teacher.phone)) changes['Telefone'] = formatPhone(formData.phone);
            if (JSON.stringify(formData.selectedOptions) !== JSON.stringify(teacher.selectedOptions)) {
                changes['Opções'] = formData.selectedOptions;
            }

            if (Object.keys(changes).length === 0) {
                alert('Nenhuma alteração detectada.');
                return;
            }

            const updatedData = {
                ...formData,
                phone: formatPhone(formData.phone)
            };

            await db.collection('teachers').doc(teacher.id).update(updatedData);

            // Add history entry
            await db.collection('teachers')
                .doc(teacher.id)
                .collection('history')
                .add({
                    changes,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });

            // Refresh history after update
            await fetchHistory();
            alert('Dados atualizados com sucesso!');
        } catch (error) {
            reportError(error);
            alert('Erro ao atualizar dados.');
        }
    };

    if (!systemConfig) {
        return <div>Carregando...</div>;
    }

    const getOptionName = (optionId) => {
        const option = systemConfig.options.find(opt => opt.id === optionId);
        return option ? option.name : '';
    };

    return (
        <div className="form-container" data-name="teacher-dashboard">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Meu Cadastro</h2>
                <div className="flex gap-2">
                    <button 
                        onClick={onLogout} 
                        className="action-button bg-blue-500 hover:bg-blue-600" 
                        data-name="logout-button"
                    >
                        Sair
                    </button>
                </div>
            </div>

            <form onSubmit={handleUpdate}>
                <div className="input-group">
                    <label className="input-label">Nome Completo</label>
                    <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="input-field"
                        required
                    />
                </div>

                <div className="input-group">
                    <label className="input-label">Telefone (DDD + Número)</label>
                    <input
                        type="tel"
                        name="phone"
                        value={formatPhone(formData.phone)}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="(45)99999-9999"
                        required
                    />
                </div>

                <div className="options-section mt-4">
                    <label className="input-label block mb-2">
                        Opções Selecionadas ({formData.selectedOptions.length} de {systemConfig.maxOptions})
                    </label>
                    <div className="options-grid" data-name="options-grid">
                        {systemConfig.options.map(option => (
                            <div
                                key={option.id}
                                className={`option-card ${
                                    formData.selectedOptions.includes(option.id) ? 'selected' : ''
                                } ${
                                    formData.selectedOptions.length >= systemConfig.maxOptions && 
                                    !formData.selectedOptions.includes(option.id) ? 'disabled' : ''
                                }`}
                                onClick={() => handleOptionSelect(option.id)}
                                data-name={`option-${option.id}`}
                            >
                                {option.name}
                            </div>
                        ))}
                    </div>
                </div>

                <button type="submit" className="submit-button mt-4">
                    Atualizar Dados
                </button>
            </form>

            <div className="history-log mt-6" data-name="history-log">
                <h3 className="font-bold mb-2">Histórico de Alterações</h3>
                {history.length === 0 ? (
                    <p>Nenhuma alteração registrada</p>
                ) : (
                    history.map((item, index) => (
                        <div key={index} className="history-item bg-gray-50 p-3 rounded mb-2">
                            <div className="history-date text-sm text-gray-600 mb-1">
                                {item.timestamp?.toDate().toLocaleString('pt-BR')}
                            </div>
                            <div>
                                {Object.entries(item.changes).map(([key, value]) => (
                                    <div key={key}>
                                        {key === 'Opções' 
                                            ? `Opções: ${value.map(id => getOptionName(id)).join(', ')}`
                                            : `${key}: ${value}`
                                        }
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
