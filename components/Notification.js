function Notification({ message }) {
    React.useEffect(() => {
        try {
            triggerConfetti();
        } catch (error) {
            reportError(error);
        }
    }, []);

    return (
        <div className="notification" data-name="success-notification">
            {message}
        </div>
    );
}
