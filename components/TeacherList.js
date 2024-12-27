function TeacherList({ teachers }) {
    const [editingTeacher, setEditingTeacher] = React.useState(null);

    const handleEdit = (teacher) => {
        setEditingTeacher(teacher);
    };

    const handleSave = () => {
        setEditingTeacher(null);
    };

    const handleCancel = () => {
        setEditingTeacher(null);
    };

    if (editingTeacher) {
        return <TeacherEdit 
            teacher={editingTeacher}
            onSave={handleSave}
            onCancel={handleCancel}
        />;
    }

    return (
        <div className="teacher-list" data-name="teacher-list">
            <table className="teacher-table">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Telefone</th>
                        <th>Data de Nascimento</th>
                        <th>Opções Selecionadas</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {teachers.map(teacher => (
                        <tr key={teacher.id}>
                            <td>{teacher.fullName}</td>
                            <td>{teacher.phone}</td>
                            <td>{formatDate(teacher.birthDate)}</td>
                            <td>
                                {teacher.selectedOptions.map(optionId => 
                                    getOptionName(optionId)
                                ).join(', ')}
                            </td>
                            <td>
                                <button 
                                    onClick={() => handleEdit(teacher)}
                                    className="edit-button"
                                    data-name={`edit-teacher-${teacher.id}`}
                                >
                                    Editar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
