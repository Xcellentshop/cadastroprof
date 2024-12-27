function AdminDashboard({ onLogout }) {
    const [teachers, setTeachers] = React.useState([]);
    const [systemConfig, setSystemConfig] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [showOptionsConfig, setShowOptionsConfig] = React.useState(false);

    React.useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Load system config first
            const config = await getSystemConfig();
            if (!config) {
                throw new Error('Não foi possível carregar as configurações do sistema');
            }
            setSystemConfig(config);

            // Load teachers
            const snapshot = await db.collection('teachers').get();
            const teachersData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setTeachers(teachersData);

        } catch (err) {
            console.error('Error loading data:', err);
            setError(err.message || 'Erro ao carregar dados');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTeacher = async (teacherId) => {
        if (window.confirm('Tem certeza que deseja excluir este professor?')) {
            try {
                await db.collection('teachers').doc(teacherId).delete();
                await loadData();
                alert('Professor excluído com sucesso!');
            } catch (error) {
                console.error('Error deleting teacher:', error);
                alert('Erro ao excluir professor');
            }
        }
    };

    const handleConfigUpdate = () => {
        setShowOptionsConfig(false);
        loadData();
    };

    if (loading) {
        return (
            <div className="admin-dashboard">
                <div className="loading">Carregando...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-dashboard">
                <div className="error">{error}</div>
                <button onClick={loadData} className="retry-button">
                    Tentar Novamente
                </button>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            <div className="dashboard-header">
                <h2>Painel Administrativo</h2>
                <div className="dashboard-actions">
                    <button onClick={() => setShowOptionsConfig(true)} className="action-button config-button">
                        Configurar Opções
                    </button>
                    <button onClick={onLogout} className="action-button logout-button">
                        Sair
                    </button>
                </div>
            </div>

            <div className="dashboard-content">
                <div className="teachers-section">
                    <h3>Lista de Professores</h3>
                    {teachers.length === 0 ? (
                        <div className="no-data">Nenhum professor cadastrado</div>
                    ) : (
                        <div className="teachers-grid">
                            {teachers.map(teacher => (
                                <div key={teacher.id} className="teacher-card">
                                    <div className="teacher-info">
                                        <h4>{teacher.fullName}</h4>
                                        <p>Telefone: {teacher.phone}</p>
                                        <p>Data de Nascimento: {teacher.birthDate}</p>
                                    </div>
                                    
                                    <div className="teacher-options">
                                        <h5>Opções Selecionadas:</h5>
                                        {teacher.selectedOptions?.map(optionId => {
                                            const option = systemConfig?.options?.find(o => o.id === optionId);
                                            if (!option) return null;

                                            const subOption = option.subOptions?.find(
                                                sub => teacher.selectedSubOptions?.[optionId] === sub.id
                                            );

                                            return (
                                                <div key={optionId} className="option-item">
                                                    <span>{option.name}</span>
                                                    {subOption && (
                                                        <span className="sub-option">
                                                            → {subOption.name}
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="teacher-actions">
                                        <button 
                                            onClick={() => handleDeleteTeacher(teacher.id)}
                                            className="delete-button"
                                        >
                                            Excluir
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {showOptionsConfig && (
                <div className="modal-overlay" onClick={() => setShowOptionsConfig(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <AdminOptionsConfig 
                            systemConfig={systemConfig}
                            onUpdate={handleConfigUpdate}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
