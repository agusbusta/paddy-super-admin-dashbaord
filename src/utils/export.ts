/**
 * Utilidades para exportar datos a CSV y Excel
 */
import * as XLSX from 'xlsx';

export interface ExportOptions {
  filename?: string;
  headers?: string[];
  delimiter?: string;
}

/**
 * Convierte un array de objetos a CSV
 */
export function convertToCSV(
  data: any[],
  headers?: string[],
  delimiter: string = ','
): string {
  if (!data || data.length === 0) {
    return '';
  }

  // Si no se proporcionan headers, usar las keys del primer objeto
  const csvHeaders = headers || Object.keys(data[0]);

  // Crear la fila de headers
  const headerRow = csvHeaders.map(header => escapeCSVValue(header)).join(delimiter);

  // Crear las filas de datos
  const dataRows = data.map(row => {
    return csvHeaders.map(header => {
      const value = row[header] ?? '';
      return escapeCSVValue(value);
    }).join(delimiter);
  });

  // Combinar headers y datos
  return [headerRow, ...dataRows].join('\n');
}

/**
 * Escapa valores para CSV (maneja comillas y comas)
 */
function escapeCSVValue(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);

  // Si contiene comillas, comas o saltos de línea, envolver en comillas y escapar comillas
  if (stringValue.includes('"') || stringValue.includes(',') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Descarga un archivo CSV
 */
export function downloadCSV(
  csvContent: string,
  filename: string = 'export.csv'
): void {
  // Crear blob con el contenido CSV
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  // Crear URL del blob
  const url = URL.createObjectURL(blob);

  // Crear elemento <a> temporal para descargar
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();

  // Limpiar
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exporta datos a CSV y descarga el archivo
 */
export function exportToCSV(
  data: any[],
  options: ExportOptions = {}
): void {
  const { filename = 'export', headers, delimiter = ',' } = options;

  if (!data || data.length === 0) {
    console.warn('No hay datos para exportar');
    return;
  }

  const csvContent = convertToCSV(data, headers, delimiter);
  downloadCSV(csvContent, filename);
}

/**
 * Mapea usuarios para exportación
 */
export function mapUsersForExport(users: any[]): any[] {
  return users.map(user => ({
    ID: user.id,
    Nombre: user.name,
    Apellido: user.last_name || '',
    Email: user.email,
    Teléfono: user.phone || '',
    Categoría: user.category || '',
    Género: user.gender || '',
    Altura: user.height ? `${user.height} cm` : '',
    Estado: user.is_active ? 'Activo' : 'Inactivo',
    'Perfil Completo': user.is_profile_complete ? 'Sí' : 'No',
    'Fecha de Registro': user.created_at ? new Date(user.created_at).toLocaleDateString('es-AR') : '',
  }));
}

/**
 * Mapea clubs para exportación
 */
export function mapClubsForExport(clubs: any[]): any[] {
  return clubs.map(club => ({
    ID: club.id,
    Nombre: club.name,
    Dirección: club.address,
    Teléfono: club.phone || '',
    Email: club.email || '',
    'Hora Apertura': club.opening_time || '',
    'Hora Cierre': club.closing_time || '',
    'Duración Turno': club.turn_duration_minutes ? `${club.turn_duration_minutes} min` : '',
    'Precio por Turno': club.price_per_turn ? `$${(club.price_per_turn / 100).toLocaleString('es-AR')}` : '$0',
    Estado: club.is_active !== false ? 'Activo' : 'Inactivo',
    'Fecha de Creación': club.created_at ? new Date(club.created_at).toLocaleDateString('es-AR') : '',
  }));
}

/**
 * Mapea administradores para exportación
 */
export function mapAdminsForExport(admins: any[]): any[] {
  return admins.map(admin => ({
    ID: admin.id,
    Nombre: admin.name,
    Email: admin.email,
    Teléfono: admin.phone || '',
    'Club Asignado': admin.club_name || admin.club_id || 'Sin asignar',
    Estado: admin.is_active ? 'Activo' : 'Inactivo',
    'Fecha de Creación': admin.created_at ? new Date(admin.created_at).toLocaleDateString('es-AR') : '',
  }));
}

/**
 * Mapea matches (partidos) para exportación
 */
export function mapMatchesForExport(matches: any[]): any[] {
  return matches.map(match => ({
    ID: match.id,
    'Fecha y Hora': match.start_time ? new Date(match.start_time).toLocaleString('es-AR') : '',
    Club: match.club_name || '',
    Cancha: match.court_name || '',
    Estado: match.status || '',
    Resultado: match.score || 'Sin resultado',
    'Jugadores': match.players?.map((p: any) => p.name).join(', ') || '',
    'Cantidad de Jugadores': match.players?.length || 0,
    'Creador': match.creator_name || match.creator_email || '',
    'Fecha de Creación': match.created_at ? new Date(match.created_at).toLocaleDateString('es-AR') : '',
  }));
}

/**
 * Exporta datos a Excel (XLSX) y descarga el archivo
 */
export function exportToExcel(
  data: any[],
  options: ExportOptions = {}
): void {
  const { filename = 'export' } = options;

  if (!data || data.length === 0) {
    console.warn('No hay datos para exportar');
    return;
  }

  // Crear un libro de trabajo
  const wb = XLSX.utils.book_new();

  // Convertir los datos a una hoja de trabajo
  const ws = XLSX.utils.json_to_sheet(data);

  // Ajustar el ancho de las columnas
  const maxWidth = 50;
  const colWidths = Object.keys(data[0]).map((key) => {
    const headerLength = key.length;
    const maxDataLength = Math.max(
      ...data.map((row) => String(row[key] || '').length)
    );
    return { wch: Math.min(Math.max(headerLength, maxDataLength) + 2, maxWidth) };
  });
  ws['!cols'] = colWidths;

  // Agregar la hoja al libro
  XLSX.utils.book_append_sheet(wb, ws, 'Datos');

  // Generar el archivo Excel
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

  // Crear blob y descargar
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  document.body.appendChild(link);
  link.click();

  // Limpiar
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
