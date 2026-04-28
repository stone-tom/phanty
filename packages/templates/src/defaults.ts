import type { BlockEditorDocument, TemplateType } from './types';
import { BLOCK_EDITOR_DOCUMENT_VERSION } from './types';

export interface CreateDefaultTemplateDocumentOptions {
  createBlockId: () => string;
}

export function createDefaultTemplateDocument(
  templateType: TemplateType,
  options: CreateDefaultTemplateDocumentOptions,
): BlockEditorDocument {
  switch (templateType) {
    case 'form': {
      const containerId = options.createBlockId();

      return {
        version: BLOCK_EDITOR_DOCUMENT_VERSION,
        templateType: 'form',
        blocks: {
          [containerId]: {
            id: containerId,
            category: 'layout',
            type: 'container',
            parentId: null,
            sortIndex: 0,
          },
        },
        settings: {},
      };
    }

    case 'content':
    case 'email':
    case 'pdf':
      throw new Error(`Unsupported template type: ${templateType}`);
  }
}
