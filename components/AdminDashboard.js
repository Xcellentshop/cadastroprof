function AdminDashboard({ onLogout }) {
    const [teachers, setTeachers] = React.useState([]);

    React.useEffect(() => {
        try {
            const unsubscribe = db.collection('teachers')
                .orderBy('createdAt', 'desc')
                .onSnapshot(snapshot => {
                    const teacherData = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    setTeachers(teacherData);
                });

            return () => unsubscribe();
        } catch (error) {
            reportError(error);
        }
    }, []);

    const generatePDF = () => {
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            doc.text('Relatório de Professores - Gotas Vivas', 20, 20);
            
            let yPos = 40;
            teachers.forEach((teacher, index) => {
                doc.text(`${index + 1}. ${teacher.fullName}`, 20, yPos);
                doc.text(`Telefone: ${teacher.phone}`, 30, yPos + 7);
                doc.text(`Data de Nascimento: ${formatDate(teacher.birthDate)}`, 30, yPos + 14);
                doc.text('Opções Selecionadas:', 30, yPos + 21);
                teacher.selectedOptions.forEach((optionId, idx) => {
                    doc.text(`- ${getOptionName(optionId)}`, 40, yPos + 28 + (idx * 7));
                });
                yPos += 50;

                if (yPos > 250) {
                    doc.addPage();
                    yPos = 20;
                }
            });

            doc.save('relatorio-professores.pdf');
        } catch (error) {
            reportError(error);
            alert('Erro ao gerar PDF');
        }
    };

    return (
        <div className="admin-container" data-name="admin-dashboard">
            <div className="admin-header" data-name="admin-header">
                <h2>Painel Administrativo</h2>
                <div className="admin-actions" data-name="admin-actions">
                    <button onClick={generatePDF} className="action-button" data-name="pdf-button">
                        Gerar PDF
                    </button>
                    <button onClick={onLogout} className="action-button" data-name="logout-button">
                        Sair
                    </button>
                </div>
            </div>
            
            <TeacherList teachers={teachers} />
            <StatsChart teachers={teachers} />
        </div>
    );
}
