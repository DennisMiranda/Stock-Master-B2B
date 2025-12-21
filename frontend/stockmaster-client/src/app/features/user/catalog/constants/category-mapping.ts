/**
 * Mapeo de IDs de categorías de Firestore a nombres legibles
 * Actualiza este objeto según tus categorías reales en Firestore
 */
export const CATEGORY_NAMES: Record<string, string> = {
  'mMtEzbW48WqnJR8sjT5F': 'Electrónica',
  'gvd7z0e9Jmy3stMt3o4i': 'Periféricos',
  'ulvqKOWumki1UWku1aFB': 'Accesorios',
  // Agrega más categorías aquí según lo necesites
};

export const getCategoryName = (categoryId: string): string => {
  return CATEGORY_NAMES[categoryId] || categoryId;
};
