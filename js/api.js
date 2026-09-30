/* COQ — Cliente API para ejercicios */
(function () {
  'use strict';

  const API_BASE_URL = 'http://localhost:8000';

  async function generarEjercicioDesdeBackend({
    grupos,
    tenseIds,
    tenseId = null,
    limite = 10,
    familyId = null,
    verbId = null,
    pronominal = null
  } = {}) {
    const normalizedGroups = Array.isArray(grupos) ? grupos : [grupos];
    const normalizedTenses = Array.isArray(tenseIds)
      ? tenseIds
      : (tenseIds ? [tenseIds] : (tenseId ? [tenseId] : []));

    if (!normalizedGroups.length) {
      throw new Error('Debes indicar al menos un grupo verbal.');
    }

    if (!normalizedTenses.length) {
      throw new Error('Debes indicar al menos un tiempo verbal.');
    }

    const params = new URLSearchParams();
    params.set('groups', normalizedGroups.join(','));
    params.set('tense_ids', normalizedTenses.join(','));
    params.set('limit', String(limite));

    if (familyId) {
      params.set('family_id', familyId);
    }

    if (verbId) {
      params.set('verb_id', verbId);
    }

    if (typeof pronominal === 'boolean') {
      params.set('pronominal', String(pronominal));
    }

    let response;

    try {
      response = await fetch(
        `${API_BASE_URL}/api/exercises/generate?${params.toString()}`,
        {
          method: 'GET',
          headers: { Accept: 'application/json' }
        }
      );
    } catch (error) {
      console.error('[COQ API] Backend no disponible:', error);
      throw new Error(
        'No se puede conectar con el servidor de ejercicios. ' +
        'Comprueba que el backend de COQ esté iniciado.'
      );
    }

    let data;

    try {
      data = await response.json();
    } catch (error) {
      console.error('[COQ API] Respuesta JSON inválida:', error);
      throw new Error(
        'El servidor devolvió una respuesta que no se puede interpretar.'
      );
    }

    if (!response.ok) {
      const message =
        data?.detail ||
        `El servidor rechazó la solicitud (${response.status}).`;
      console.error('[COQ API]', response.status, message);
      throw new Error(message);
    }

    if (!Array.isArray(data?.questions)) {
      console.error('[COQ API] Contrato inesperado:', data);
      throw new Error(
        'El servidor no devolvió un conjunto de preguntas válido.'
      );
    }

    return data;
  }

  window.COQ_API = Object.freeze({
    generarEjercicioDesdeBackend
  });
})();
