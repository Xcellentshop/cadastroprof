function RegistrationForm({ onSuccess }) {
    const [formData, setFormData] = React.useState({
        fullName: '',
        phone: '',
        birthDate: '',
        selectedOptions: []
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

                if (index === -1) {
                    if (currentOptions.length < systemConfig.maxOptions) {
                        currentOptions.push(optionId);
                    } else {
                        alert(`Por favor, desmarque uma das opções para selecionar uma nova. Máximo permitido: ${systemConfig.maxOptions}`);
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
                selectedOptions: []
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

                <div className="options-grid" data-name="options-grid">
                    {systemConfig.options.map(option => (
                        <div
                            key={option.id}
                            className={`option-card ${
                                formData.selectedOptions.includes(option.id) ? 'selected' : ''
                            } ${
                                formData.selectedOptions.length === systemConfig.maxOptions && !formData.selectedOptions.includes(option.id) ? 'disabled' : ''
                            }`}
                            onClick={() => handleOptionSelect(option.id)}
                            data-name={`option-${option.id}`}
                        >
                            {option.name}
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
