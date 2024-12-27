function TeacherDashboard({ teacher, onLogout }) {
    const [formData, setFormData] = React.useState(teacher);
    const [history, setHistory] = React.useState([]);

    const options = [
        { id: 1, name: 'EBD (Domingo de Manhã)' },
        { id: 2, name: 'EBQ (Quarta Feira)' },
        { id: 3, name: 'CULTO KIDS (Domingo a Noite)' },
        { id: 4, name: 'EBQ (Quinta Feira)' }
    ];

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

    React.useEffect(() => {
        fetchHistory();
    }, [teacher.id]);

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
                    if (currentOptions.length < 2) {
                        currentOptions.push(optionId);
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
            
            if (formData.phone.length !== 11) {
                alert('Por favor, insira um número de telefone válido com DDD (11 dígitos)');
                return;
            }

            if (formData.selectedOptions.length !== 2) {
                alert('Por favor, selecione exatamente duas opções.');
                return;
            }

            const changes = {};
            if (formData.fullName !== teacher.fullName) changes.fullName = formData.fullName;
            if (unformatPhone(formData.phone) !== unformatPhone(teacher.phone)) changes.phone = formatPhone(formData.phone);
            if (JSON.stringify(formData.selectedOptions) !== JSON.stringify(teacher.selectedOptions)) {
                changes.selectedOptions = formData.selectedOptions;
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

    return (
        <div className="form-container" data-name="teacher-dashboard">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Meu Cadastro</h2>
                <button onClick={onLogout} className="action-button" data-name="logout-button">
                    Sair
                </button>
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
                        placeholder="(XX)XXXXX-XXXX"
                        required
                    />
                </div>

                <div className="options-grid" data-name="options-grid">
                    {options.map(option => (
                        <div
                            key={option.id}
                            className={`option-card ${
                                formData.selectedOptions.includes(option.id) ? 'selected' : ''
                            } ${
                                formData.selectedOptions.length === 2 && !formData.selectedOptions.includes(option.id) ? 'disabled' : ''
                            }`}
                            onClick={() => handleOptionSelect(option.id)}
                            data-name={`option-${option.id}`}
                        >
                            {option.name}
                        </div>
                    ))}
                </div>

                <button type="submit" className="submit-button">
                    Atualizar Dados
                </button>
            </form>

            <div className="history-log" data-name="history-log">
                <h3 className="font-bold mb-2">Histórico de Alterações</h3>
                {history.length === 0 ? (
                    <p>Nenhuma alteração registrada</p>
                ) : (
                    history.map((item, index) => (
                        <div key={index} className="history-item">
                            <div className="history-date">
                                {item.timestamp?.toDate().toLocaleString('pt-BR')}
                            </div>
                            <div>
                                {Object.entries(item.changes).map(([key, value]) => (
                                    <div key={key}>
                                        {key === 'selectedOptions' 
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
