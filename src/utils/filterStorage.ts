/**
 * Utilidad para guardar y recuperar filtros desde localStorage
 */

const STORAGE_PREFIX = 'paddio_admin_filters_';

export interface SavedFilter {
  name: string;
  filters: Record<string, any>;
  createdAt: string;
}

export const filterStorage = {
  /**
   * Guardar un filtro con nombre
   */
  saveFilter: (page: string, filterName: string, filters: Record<string, any>): void => {
    try {
      const key = `${STORAGE_PREFIX}${page}`;
      const saved = filterStorage.getSavedFilters(page);
      const newFilter: SavedFilter = {
        name: filterName,
        filters,
        createdAt: new Date().toISOString(),
      };
      
      // Evitar duplicados
      const filtered = saved.filter((f) => f.name !== filterName);
      filtered.push(newFilter);
      
      localStorage.setItem(key, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error saving filter:', error);
    }
  },

  /**
   * Obtener todos los filtros guardados para una página
   */
  getSavedFilters: (page: string): SavedFilter[] => {
    try {
      const key = `${STORAGE_PREFIX}${page}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting saved filters:', error);
      return [];
    }
  },

  /**
   * Aplicar un filtro guardado
   */
  loadFilter: (page: string, filterName: string): Record<string, any> | null => {
    try {
      const saved = filterStorage.getSavedFilters(page);
      const filter = saved.find((f) => f.name === filterName);
      return filter ? filter.filters : null;
    } catch (error) {
      console.error('Error loading filter:', error);
      return null;
    }
  },

  /**
   * Eliminar un filtro guardado
   */
  deleteFilter: (page: string, filterName: string): void => {
    try {
      const key = `${STORAGE_PREFIX}${page}`;
      const saved = filterStorage.getSavedFilters(page);
      const filtered = saved.filter((f) => f.name !== filterName);
      localStorage.setItem(key, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting filter:', error);
    }
  },

  /**
   * Limpiar todos los filtros guardados de una página
   */
  clearFilters: (page: string): void => {
    try {
      const key = `${STORAGE_PREFIX}${page}`;
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error clearing filters:', error);
    }
  },
};
