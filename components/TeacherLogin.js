function TeacherLogin({ onLogin }) {
    const [birthDate, setBirthDate] = React.useState('');

    const handleLogin = async (e) => {
        try {
            e.preventDefault();
            
            const teachersRef = db.collection('teachers');
            const snapshot = await teachersRef.where('birthDate', '==', birthDate).get();

            if (snapshot.empty) {
                alert('Nenhum cadastro encontrado com esta data de nascimento.');
                return;
            }

            const teacherDoc = snapshot.docs[0];
            onLogin({ id: teacherDoc.id, ...teacherDoc.data() });
        } catch (error) {
            reportError(error);
            alert('Erro ao fazer login. Tente novamente.');
        }
    };

    return (
        <div className="form-container" data-name="teacher-login">
            <form onSubmit={handleLogin}>
                <div className="input-group" data-name="birthdate-group">
                    <label className="input-label">Data de Nascimento</label>
                    <input
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="input-field"
                        required
                    />
                </div>

                <button type="submit" className="submit-button" data-name="login-button">
                    Acessar Cadastro
                </button>
            </form>
        </div>
    );
}
