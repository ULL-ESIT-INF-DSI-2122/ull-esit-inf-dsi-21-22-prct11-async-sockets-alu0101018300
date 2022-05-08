export type NotesProperties = {
  title: string;
  body: string;
  color: string;
}

export type Response = {
  state: number;
  type: 'add' | 'read' | 'edit' | 'remove' | 'list';
  title?: string;
  user?: string;
  body?: string;
  color?: string;
  err?: string;
  notes?: NotesProperties[];
}

export type Request = {
  user: string;
  type: 'add' | 'read' | 'edit' | 'remove' | 'list';
  title?: string;
  body?: string;
  color?: string;
}
