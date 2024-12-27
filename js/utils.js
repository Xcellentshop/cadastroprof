function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

function getOptionName(optionId, options = []) {
    const option = options.find(opt => opt.id === optionId);
    return option ? option.name : '';
}

function formatPhone(phone) {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 11) {
        const ddd = cleaned.substring(0, 2);
        const firstPart = cleaned.substring(2, 7);
        const secondPart = cleaned.substring(7);
        return `(${ddd})${firstPart}-${secondPart}`;
    }
    return phone;
}

function unformatPhone(phone) {
    if (!phone) return '';
    return phone.replace(/\D/g, '');
}

function triggerConfetti() {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
    });
}

async function getSystemConfig() {
    try {
        const configDoc = await db.collection('system').doc('config').get();
        if (configDoc.exists) {
            return configDoc.data();
        }
        // Default configuration
        return {
            maxOptions: 2,
            options: [
                { id: 1, name: 'EBD (Domingo de Manhã)' },
                { id: 2, name: 'EBQ (Quarta Feira)' },
                { id: 3, name: 'CULTO KIDS (Domingo a Noite)' },
                { id: 4, name: 'EBQ (Quinta Feira)' }
            ]
        };
    } catch (error) {
        reportError(error);
        throw new Error('Error loading system configuration');
    }
}

async function updateSystemConfig(config) {
    try {
        await db.collection('system').doc('config').set(config);
    } catch (error) {
        reportError(error);
        throw new Error('Error updating system configuration');
    }
}
