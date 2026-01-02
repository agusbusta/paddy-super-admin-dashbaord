import { api } from './api';

export interface Provincia {
  id: number;
  nombre: string;
}

export interface Localidad {
  id: number;
  nombre: string;
  provincia: {
    id: number;
    nombre: string;
  };
}

interface GeorefResponse<T> {
  cantidad: number;
  inicio: number;
  parametros: Record<string, any>;
  [key: string]: T[] | number | Record<string, any>;
}

export const georefService = {
  /**
   * Obtener todas las provincias de Argentina
   */
  getProvincias: async (): Promise<Provincia[]> => {
    try {
      // La API Georef es pública, no necesita autenticación
      const response = await fetch(
        'https://apis.datos.gob.ar/georef/api/v2.0/provincias?orden=nombre'
      );
      
      if (!response.ok) {
        throw new Error(`Error al obtener provincias: ${response.status}`);
      }
      
      const data: GeorefResponse<Provincia> = await response.json();
      return (data.provincias as Provincia[]) || [];
    } catch (error: any) {
      console.error('❌ Error fetching provincias:', error);
      throw error;
    }
  },

  /**
   * Obtener localidades (ciudades) de una provincia específica
   */
  getLocalidadesPorProvincia: async (provinciaId: number): Promise<Localidad[]> => {
    try {
      const response = await fetch(
        `https://apis.datos.gob.ar/georef/api/v2.0/localidades?provincia=${provinciaId}&orden=nombre&max=5000`
      );
      
      if (!response.ok) {
        throw new Error(`Error al obtener localidades: ${response.status}`);
      }
      
      const data: GeorefResponse<Localidad> = await response.json();
      return (data.localidades as Localidad[]) || [];
    } catch (error: any) {
      console.error('❌ Error fetching localidades:', error);
      throw error;
    }
  },
};
