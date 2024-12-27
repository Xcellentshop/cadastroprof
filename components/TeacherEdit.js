function TeacherEdit({ teacher, systemConfig, onSave, onCancel }) {
    const [formData, setFormData] = React.useState({
        fullName: teacher.fullName,
        phone: teacher.phone.replace(/\D/g, ''),
        birthDate: teacher.birthDate,
        selectedOptions: teacher.selectedOptions || []
    });

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
                        return prev;
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

            await db.collection('teachers').doc(teacher.id).update({
                ...formData,
                phone: formatPhone(formData.phone),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            onSave();
        } catch (error) {
            reportError(error);
            alert('Erro ao atualizar. Por favor, tente novamente.');
        }
    };

    return (
        <div className="edit-form-container p-6 bg-white rounded-lg shadow" data-name="teacher-edit-form">
            <h3 className="text-xl font-bold mb-4">Editar Professor</h3>
            <form onSubmit={handleSubmit}>
                <div className="input-group mb-4" data-name="fullname-group">
                    <label className="input-label block mb-2">Nome Completo</label>
                    <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="input-field w-full p-2 border rounded"
                        required
                    />
                </div>

                <div className="input-group mb-4" data-name="phone-group">
                    <label className="input-label block mb-2">Telefone (DDD + Número)</label>
                    <input
                        type="tel"
                        name="phone"
                        value={formatPhone(formData.phone)}
                        onChange={handleInputChange}
                        className="input-field w-full p-2 border rounded"
                        placeholder="(45)99999-9999"
                        required
                    />
                </div>

                <div className="input-group mb-4" data-name="birthdate-group">
                    <label className="input-label block mb-2">Data de Nascimento</label>
                    <input
                        type="date"
                        name="birthDate"
                        value={formData.birthDate}
                        onChange={handleInputChange}
                        className="input-field w-full p-2 border rounded"
                        required
                    />
                </div>

                <div className="options-section mb-6">
                    <label className="input-label block mb-2">
                        Opções Selecionadas ({formData.selectedOptions.length} de {systemConfig.maxOptions})
                    </label>
                    <div className="options-grid grid grid-cols-2 gap-4" data-name="options-grid">
                        {systemConfig.options.map(option => (
                            <div
                                key={option.id}
                                className={`option-card p-3 border rounded cursor-pointer transition-colors ${
                                    formData.selectedOptions.includes(option.id) 
                                        ? 'bg-blue-100 border-blue-500' 
                                        : 'bg-white hover:bg-gray-50'
                                } ${
                                    formData.selectedOptions.length >= systemConfig.maxOptions && 
                                    !formData.selectedOptions.includes(option.id) 
                                        ? 'opacity-50 cursor-not-allowed' 
                                        : ''
                                }`}
                                onClick={() => handleOptionSelect(option.id)}
                                data-name={`option-${option.id}`}
                            >
                                {option.name}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="button-group flex justify-end gap-4">
                    <button 
                        type="button" 
                        onClick={onCancel} 
                        className="cancel-button px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600" 
                        data-name="cancel-button"
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit" 
                        className="submit-button px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" 
                        data-name="save-button"
                    >
                        Salvar Alterações
                    </button>
                </div>
            </form>
        </div>
    );
}
