function AdminLogin({ onLogin }) {
    const [credentials, setCredentials] = React.useState({ email: '', password: '' });

    const handleLogin = async (e) => {
        try {
            e.preventDefault();
            await auth.signInWithEmailAndPassword(credentials.email, credentials.password);
            onLogin();
        } catch (error) {
            reportError(error);
            alert('Erro ao fazer login. Verifique suas credenciais.');
        }
    };

    return (
        <div className="form-container" data-name="admin-login">
            <form onSubmit={handleLogin}>
                <div className="input-group" data-name="email-group">
                    <label className="input-label">Email</label>
                    <input
                        type="email"
                        value={credentials.email}
                        onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                        className="input-field"
                        required
                    />
                </div>

                <div className="input-group" data-name="password-group">
                    <label className="input-label">Senha</label>
                    <input
                        type="password"
                        value={credentials.password}
                        onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                        className="input-field"
                        required
                    />
                </div>

                <button type="submit" className="submit-button" data-name="login-button">
                    Entrar
                </button>
            </form>
        </div>
    );
}
