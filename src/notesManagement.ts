import {Response} from './dataType'

/**
 * Interfaz que permite que se puedan gestionar las notas
 */
export interface notesManagement {
    addNote(user: string, title: string, body: string, color: string): Response;
    readNote(user: string, title: string): Response;
    editNote(user: string, title: string, body: string, color: string): Response;
    removeNote(user: string, title: string): Response;
    listNotes(user: string): Response
  }
  