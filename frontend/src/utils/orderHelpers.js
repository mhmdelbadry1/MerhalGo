/**
 * Order Data Helpers
 * Standardizes access to order data across different order types (Local, International, Shein)
 */

/**
 * Get the "From" and "To" locations for an order
 * @param {object} order 
 * @returns {{from: string, to: string}}
 */
export const getOrderLocations = (order) => {
  if (!order || !order.form_data) return { from: '-', to: '-' };

  const { form_data, order_type } = order;

  if (order_type === 'local') {
    return {
      from: form_data.pickupGovernorate || form_data.pickupLocation || form_data.pickupAddress || '-',
      to: form_data.deliveryGovernorate || form_data.deliveryLocation || form_data.deliveryAddress || '-'
    };
  }

  if (order_type === 'international') {
    return {
      from: form_data.pickupCountry || order.data?.from || '-',
      to: form_data.deliveryCountry || order.data?.to || '-'
    };
  }

  if (order_type === 'shein') {
    return {
      from: form_data.marketplace || 'Shein',
      to: form_data.recvCountry || '-'
    };
  }

  return { from: '-', to: '-' };
};

/**
 * Get the standardized Service Type label
 * @param {object} order 
 * @returns {string}
 */
export const getOrderServiceType = (order) => {
  if (!order) return '-';
  
  if (order.form_data?.serviceType) {
    return order.form_data.serviceType;
  }

  if (order.order_type === 'local') {
    return 'شحن محلي';
  }

  return order.order_type; // Fallback
};

/**
 * Get unified cargo details (weight, pieces)
 * @param {object} order 
 * @returns {{weight: string, pieces: string, description: string}}
 */
export const getOrderCargoDetails = (order) => {
    if (!order || !order.form_data) return { weight: null, pieces: null, description: null };
    
    const { form_data } = order;

    // Weight
    let weight = form_data.weight || form_data.totalWeight || null;
    
    // Pieces
    let pieces = form_data.furniturePieces || form_data.piecesCount || (order.form_data.products ? order.form_data.products.length : null);

    // Description
    let description = form_data.description || form_data.goodsDescription || form_data.cargoType || null;

    return { weight, pieces, description };
};
