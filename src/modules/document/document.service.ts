type DocumentEntity = { id: string; title: string; content: string };

const inMemoryDocs: Record<string, DocumentEntity> = {};

export const documentService = {
  async getById(id: string): Promise<DocumentEntity | undefined> {
    return inMemoryDocs[id];
  },
  async create(input: { title: string; content: string }): Promise<DocumentEntity> {
    const id = Math.random().toString(36).slice(2);
    const doc: DocumentEntity = { id, ...input };
    inMemoryDocs[id] = doc;
    return doc;
  },
  async update(id: string, input: Partial<Omit<DocumentEntity, 'id'>>): Promise<DocumentEntity | undefined> {
    const existing = inMemoryDocs[id];
    if (!existing) return undefined;
    const updated = { ...existing, ...input };
    inMemoryDocs[id] = updated;
    return updated;
  },
};

export default documentService;


