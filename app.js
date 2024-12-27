function App() {
    const [isAdmin, setIsAdmin] = React.useState(false);
    const [isAdminLoggedIn, setIsAdminLoggedIn] = React.useState(false);
    const [isTeacherLogin, setIsTeacherLogin] = React.useState(false);
    const [currentTeacher, setCurrentTeacher] = React.useState(null);
    const [showNotification, setShowNotification] = React.useState(false);

    const handleAdminLogin = () => {
        try {
            setIsAdminLoggedIn(true);
        } catch (error) {
            reportError(error);
        }
    };

    const handleTeacherLogin = (teacher) => {
        try {
            setCurrentTeacher(teacher);
        } catch (error) {
            reportError(error);
        }
    };

    const handleLogout = () => {
        try {
            setIsAdmin(false);
            setIsAdminLoggedIn(false);
            setCurrentTeacher(null);
            auth.signOut();
        } catch (error) {
            reportError(error);
        }
    };

    const handleBack = () => {
        setIsTeacherLogin(false);
        setIsAdmin(false);
    };

    const handleRegistrationSuccess = () => {
        try {
            setShowNotification(true);
            setTimeout(() => setShowNotification(false), 3000);
        } catch (error) {
            reportError(error);
        }
    };

    return (
        <div className="container" data-name="app-container">
            <Header />
            
            {!isAdmin && !currentTeacher && !isTeacherLogin && (
                <div>
                    <RegistrationForm onSuccess={handleRegistrationSuccess} />
                    <div className="text-center mt-8">
                        <button
                            onClick={() => setIsTeacherLogin(true)}
                            className="action-button bg-blue-500 hover:bg-blue-600 mr-4"
                            data-name="access-registration"
                        >
                            Acessar Meu Cadastro
                        </button>
                        <button
                            onClick={() => setIsAdmin(true)}
                            className="action-button bg-green-500 hover:bg-green-600"
                            data-name="toggle-admin"
                        >
                            Área Administrativa
                        </button>
                    </div>
                </div>
            )}
            
            {isTeacherLogin && !currentTeacher && (
                <TeacherLogin 
                    onLogin={handleTeacherLogin}
                    onBack={handleBack}
                />
            )}

            {currentTeacher && (
                <TeacherDashboard 
                    teacher={currentTeacher}
                    onLogout={handleLogout}
                />
            )}
            
            {isAdmin && !isAdminLoggedIn && (
                <AdminLogin 
                    onLogin={handleAdminLogin}
                    onBack={handleBack}
                />
            )}
            
            {isAdmin && isAdminLoggedIn && (
                <AdminDashboard onLogout={handleLogout} />
            )}

            {showNotification && (
                <Notification message="Cadastro realizado com sucesso!" />
            )}
        </div>
    );
}

ReactDOM.render(<App />, document.getElementById('root'));
