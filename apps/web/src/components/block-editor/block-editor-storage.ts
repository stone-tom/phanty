import {
  BLOCK_EDITOR_DOCUMENT_VERSION,
  type BlockEditorDocument,
  type TemplateType,
} from './types';

const BLOCK_EDITOR_STORAGE_PREFIX = 'template-editor';

export interface BlockEditorStorageParams {
  templateId: string;
  templateType: TemplateType;
}

export function createBlockEditorStorageKey(params: BlockEditorStorageParams) {
  return `${BLOCK_EDITOR_STORAGE_PREFIX}:${params.templateType}:${params.templateId}`;
}

export function loadBlockEditorDocument(
  params: BlockEditorStorageParams,
): BlockEditorDocument | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawDocument = window.localStorage.getItem(
    createBlockEditorStorageKey(params),
  );

  if (!rawDocument) {
    return null;
  }

  try {
    const parsedDocument = JSON.parse(rawDocument);
    return isBlockEditorDocument(parsedDocument, params.templateType)
      ? parsedDocument
      : null;
  } catch {
    return null;
  }
}

export function saveBlockEditorDocument(
  params: BlockEditorStorageParams,
  document: BlockEditorDocument,
) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(
    createBlockEditorStorageKey(params),
    JSON.stringify(document),
  );
}

function isBlockEditorDocument(
  value: unknown,
  templateType: TemplateType,
): value is BlockEditorDocument {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const document = value as Partial<BlockEditorDocument>;

  return (
    document.version === BLOCK_EDITOR_DOCUMENT_VERSION &&
    document.templateType === templateType &&
    typeof document.blocks === 'object' &&
    document.blocks !== null &&
    !Array.isArray(document.blocks)
  );
}
