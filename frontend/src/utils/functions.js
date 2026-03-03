export const getDiscount = (price, cuttedPrice) => {
    if (typeof price !== 'number' || typeof cuttedPrice !== 'number' || cuttedPrice <= 0) {
        return 0;
    }
    return Math.round(((cuttedPrice - price) / cuttedPrice) * 100);
}

export const getDeliveryDate = () => {
    try {
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + 7);
        return deliveryDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            timeZone: 'UTC'
        });
    } catch (error) {
        console.error('Error calculating delivery date:', error);
        return 'Delivery date unavailable';
    }
}

export const formatDate = (dt) => {
    if (!dt) return 'Date unavailable';
    try {
        const date = new Date(dt);
        if (isNaN(date.getTime())) {
            throw new Error('Invalid date');
        }
        return date.toLocaleString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid date';
    }
}

export const getRandomProducts = (prodsArray, n) => {
    if (!Array.isArray(prodsArray)) {
        console.warn('getRandomProducts: Input is not an array');
        return [];
    }
    if (typeof n !== 'number' || n < 0) {
        console.warn('getRandomProducts: Invalid number of products requested');
        return [];
    }
    const validN = Math.min(n, prodsArray.length);
    return [...prodsArray]
        .filter(product => product && typeof product === 'object')
        .sort(() => 0.5 - Math.random())
        .slice(0, validN);
}