function RegistrationForm({ onSuccess }) {
    const [formData, setFormData] = React.useState({
        fullName: '',
        phone: '',
        birthDate: '',
        selectedOptions: [],
        selectedSubOptions: {} 
    });
    const [systemConfig, setSystemConfig] = React.useState({ maxOptions: 2, options: [] });
    const [loading, setLoading] = React.useState(true);

    const options = [
        { id: 1, name: 'EBD (Domingo de Manhã)' },
        { id: 2, name: 'EBQ (Quarta Feira)' },
        { id: 3, name: 'CULTO KIDS (Domingo a Noite)' },
        { id: 4, name: 'EBQ (Quinta Feira)' }
    ];

    React.useEffect(() => {
        loadSystemConfig();
    }, []);

    const loadSystemConfig = async () => {
        try {
            const config = await getSystemConfig();
            setSystemConfig(config);
            setLoading(false);
        } catch (error) {
            reportError(error);
            setLoading(false);
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
        } catch (error) {
            reportError(error);
        }
    };

    const handleSubOptionSelect = (optionId, subOptionId) => {
        setFormData(prev => ({
            ...prev,
            selectedSubOptions: {
                ...prev.selectedSubOptions,
                [optionId]: subOptionId 
            }
        }));
    };

    const handleSubmit = async (e) => {
        try {
            e.preventDefault();
            
            if (!formData.fullName || !formData.phone || !formData.birthDate || formData.selectedOptions.length === 0) {
                alert(`Por favor, preencha todos os campos e selecione entre 1 e ${systemConfig.maxOptions} opções.`);
                return;
            }

            if (formData.phone.length !== 11) {
                alert('Por favor, insira um número de telefone válido com DDD (11 dígitos)');
                return;
            }

            const invalidSelection = formData.selectedOptions.some(optionId => {
                const option = systemConfig.options.find(o => o.id === optionId);
                if (option?.subOptions?.length > 0) {
                    return !formData.selectedSubOptions[optionId];
                }
                return false;
            });

            if (invalidSelection) {
                alert('Por favor, selecione uma sub-opção para cada opção selecionada');
                return;
            }

            await db.collection('teachers').add({
                ...formData,
                phone: formatPhone(formData.phone),
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            onSuccess();
            setFormData({
                fullName: '',
                phone: '',
                birthDate: '',
                selectedOptions: [],
                selectedSubOptions: {}
            });
        } catch (error) {
            reportError(error);
            alert('Erro ao cadastrar. Por favor, tente novamente.');
        }
    };

    if (loading) {
        return <div>Carregando...</div>;
    }

    return (
        <div className="form-container" data-name="registration-form">
            <form onSubmit={handleSubmit}>
                <div className="input-group" data-name="fullname-group">
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

                <div className="input-group" data-name="phone-group">
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

                <div className="input-group" data-name="birthdate-group">
                    <label className="input-label">Data de Nascimento</label>
                    <input
                        type="date"
                        name="birthDate"
                        value={formData.birthDate}
                        onChange={handleInputChange}
                        className="input-field"
                        required
                    />
                </div>

                <div className="options-container" data-name="options-container">
                    {systemConfig.options.map(option => (
                        <div key={option.id} className="option-item">
                            <div className="option-header">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formData.selectedOptions.includes(option.id)}
                                        onChange={() => handleOptionSelect(option.id)}
                                        disabled={formData.selectedOptions.length >= systemConfig.maxOptions && !formData.selectedOptions.includes(option.id)}
                                    />
                                    {option.name}
                                </label>
                            </div>
                            
                            {formData.selectedOptions.includes(option.id) && option.subOptions?.length > 0 && (
                                <div className="sub-options-container">
                                    {option.subOptions.map(subOption => (
                                        <label key={subOption.id} className="radio-label sub-option">
                                            <input
                                                type="radio"
                                                name={`subOption-${option.id}`}
                                                checked={formData.selectedSubOptions[option.id] === subOption.id}
                                                onChange={() => handleSubOptionSelect(option.id, subOption.id)}
                                            />
                                            {subOption.name}
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <button type="submit" className="submit-button" data-name="submit-button">
                    Cadastrar
                </button>
            </form>
        </div>
    );
}
