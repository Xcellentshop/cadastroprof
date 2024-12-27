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
            
            // Load system config
            const config = await getSystemConfig();
            setSystemConfig(config);

            // Load teachers
            const snapshot = await db.collection('teachers').get();
            const teachersData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setTeachers(teachersData);
            
            setLoading(false);
        } catch (err) {
            console.error('Error loading data:', err);
            setError('Erro ao carregar dados. Por favor, recarregue a página.');
            setLoading(false);
        }
    };

    const handleEditTeacher = async (updatedTeacher) => {
        try {
            await db.collection('teachers').doc(updatedTeacher.id).update(updatedTeacher);
            await loadData();
            alert('Professor atualizado com sucesso!');
        } catch (error) {
            console.error('Error updating teacher:', error);
            alert('Erro ao atualizar professor. Por favor, tente novamente.');
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
                alert('Erro ao excluir professor. Por favor, tente novamente.');
            }
        }
    };

    const generatePDF = async () => {
        try {
            const doc = new jsPDF();
            
            // Add title
            doc.setFontSize(18);
            doc.text('Relatório de Professores', 20, 20);
            
            let yPos = 40;
            const pageHeight = doc.internal.pageSize.height;
            
            teachers.forEach((teacher, index) => {
                // Check if we need a new page
                if (yPos > pageHeight - 40) {
                    doc.addPage();
                    yPos = 20;
                }
                
                // Add teacher info
                doc.setFontSize(12);
                doc.text(`Professor ${index + 1}:`, 20, yPos);
                yPos += 10;
                
                doc.setFontSize(10);
                doc.text(`Nome: ${teacher.fullName}`, 30, yPos);
                yPos += 7;
                doc.text(`Telefone: ${teacher.phone}`, 30, yPos);
                yPos += 7;
                doc.text(`Data de Nascimento: ${teacher.birthDate}`, 30, yPos);
                yPos += 7;
                
                // Add options and sub-options
                if (teacher.selectedOptions?.length > 0) {
                    doc.text('Opções Selecionadas:', 30, yPos);
                    yPos += 7;
                    
                    teacher.selectedOptions.forEach(optionId => {
                        const option = systemConfig.options.find(o => o.id === optionId);
                        if (option) {
                            const subOption = option.subOptions?.find(
                                sub => teacher.selectedSubOptions?.[optionId] === sub.id
                            );
                            
                            let optionText = `- ${option.name}`;
                            if (subOption) {
                                optionText += ` → ${subOption.name}`;
                            }
                            
                            doc.text(optionText, 40, yPos);
                            yPos += 7;
                        }
                    });
                }
                
                yPos += 10; // Add space between teachers
            });
            
            // Save the PDF
            doc.save('relatorio-professores.pdf');
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Erro ao gerar PDF. Por favor, tente novamente.');
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
                    <button onClick={generatePDF} className="generate-pdf-button">
                        Gerar Relatório PDF
                    </button>
                    <button 
                        onClick={() => setShowOptionsConfig(true)} 
                        className="action-button config-button"
                    >
                        Configurar Opções
                    </button>
                    <button 
                        onClick={onLogout} 
                        className="action-button logout-button"
                    >
                        Sair
                    </button>
                </div>
            </div>

            <div className="dashboard-content">
                <div className="teachers-section">
                    <h3>Lista de Professores</h3>
                    {teachers.length === 0 ? (
                        <div className="no-data">Nenhum professor cadastrado.</div>
                    ) : (
                        <TeacherList 
                            teachers={teachers}
                            systemConfig={systemConfig}
                            onEdit={handleEditTeacher}
                            onDelete={handleDeleteTeacher}
                        />
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
