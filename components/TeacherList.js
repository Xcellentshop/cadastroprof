function TeacherList({ teachers, systemConfig }) {
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

    const getOptionName = (optionId) => {
        const option = systemConfig.options.find(opt => opt.id === optionId);
        return option ? option.name : '';
    };

    if (editingTeacher) {
        return (
            <TeacherEdit 
                teacher={editingTeacher}
                systemConfig={systemConfig}
                onSave={handleSave}
                onCancel={handleCancel}
            />
        );
    }

    return (
        <div className="teacher-list" data-name="teacher-list">
            <h3 className="text-xl font-bold mb-4">Lista de Professores</h3>
            <table className="teacher-table w-full">
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
                                <ul className="list-disc list-inside">
                                    {teacher.selectedOptions.map(optionId => (
                                        <li key={optionId}>
                                            {getOptionName(optionId)}
                                        </li>
                                    ))}
                                </ul>
                            </td>
                            <td>
                                <button 
                                    onClick={() => handleEdit(teacher)}
                                    className="edit-button bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
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
