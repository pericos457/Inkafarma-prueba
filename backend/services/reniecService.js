const axios = require('axios');

// URL de la API de RENIEC
const RENIEC_API_URL = 'https://api.apis.net.pe/v2/reniec/dni';
// Token
const API_TOKEN = 'apis-token-13391.sAraEvD9Pe7VxrLiUe84d8aoVpkZN1xa';

/**
 * Obtiene datos de RENIEC para un DNI específico.
 * @param {string} dni - El número de DNI a consultar.
 * @returns {Promise<object|null>} - Objeto con los datos de la persona (nombres, apellidoPaterno, apellidoMaterno) o null si hay error/no se encuentra.
 */
const getReniecDataByDni = async (dni) => {
    if (!dni) {
        console.error('DNI es requerido para consultar RENIEC');
        return null;
    }

    try {
        const response = await axios.get(`${RENIEC_API_URL}?numero=${dni}`, {
            headers: {
                'Authorization': `Bearer ${API_TOKEN}`,
                'Accept': 'application/json'
            }
        });

        if (response.data && response.status === 200) {
            return {
                nombres: response.data.nombres,
                apellidoPaterno: response.data.apellidoPaterno,
                apellidoMaterno: response.data.apellidoMaterno
            };
        } else {
            console.warn(`Respuesta no exitosa de API RENIEC para DNI ${dni}:`, response.status);
            return null;
        }
    } catch (error) {
        console.error(`Error al consultar API RENIEC para DNI ${dni}:`, error.response ? error.response.data : error.message);
        return null; 
    }
};

module.exports = {
    getReniecDataByDni
};