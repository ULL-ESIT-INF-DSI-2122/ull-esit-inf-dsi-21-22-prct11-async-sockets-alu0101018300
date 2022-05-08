/**
 * Tipo de datos para las notas
 */
export type NotesType = {
  title: string;
  color: string;
  body: string;
}

/**
 * Tipo de datos para la respuesta del servidor
 */
export type Response = {
  state: number;
  title?: string;
  user?: string;
  body?: string;
  color?: string;
  error?: string;
  type: 'add' | 'read' | 'edit' | 'remove' | 'list';
  notes?: NotesType[];
}

/**
 * Tipo de datos para las peticiones del cliente
 */
export type Request = {
  user: string;
  title?: string;
  body?: string;
  color?: string;
  type: 'add' | 'read' | 'edit' | 'remove' | 'list';
}