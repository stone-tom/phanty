import type { z } from 'zod';
import { getBlockDefinitionKey, isBlockAllowedInParent } from './registry';
import {
  type BlockEditorDocument,
  BlockEditorDocumentSchema,
  type TemplateType,
} from './types';

export interface TemplateDocumentValidationSuccess {
  success: true;
  document: BlockEditorDocument;
  errors?: never;
}

export interface TemplateDocumentValidationFailure {
  success: false;
  document?: never;
  errors: string[];
}

export type TemplateDocumentValidationResult =
  | TemplateDocumentValidationSuccess
  | TemplateDocumentValidationFailure;

export function validateTemplateDocument(
  input: unknown,
  templateType: TemplateType,
): TemplateDocumentValidationResult {
  const parsedDocument = BlockEditorDocumentSchema.safeParse(input);

  if (!parsedDocument.success) {
    return {
      success: false,
      errors: formatZodIssues(parsedDocument.error),
    };
  }

  const document = parsedDocument.data;
  const structuralErrors = validateDocumentStructure(document, templateType);

  if (structuralErrors.length > 0) {
    return {
      success: false,
      errors: structuralErrors,
    };
  }

  return {
    success: true,
    document,
  };
}

function validateDocumentStructure(
  document: BlockEditorDocument,
  templateType: TemplateType,
) {
  const errors: string[] = [];

  if (document.templateType !== templateType) {
    errors.push(
      `Document templateType "${document.templateType}" must match template type "${templateType}".`,
    );
  }

  for (const [blockId, block] of Object.entries(document.blocks)) {
    if (block.id !== blockId) {
      errors.push(
        `Block map key "${blockId}" must match block id "${block.id}".`,
      );
    }

    const blockKey = getBlockDefinitionKey(block);

    if (block.parentId === null) {
      if (
        !isBlockAllowedInParent({
          templateType,
          parentKey: 'root',
          childKey: blockKey,
        })
      ) {
        errors.push(`Block "${block.id}" is not allowed at document root.`);
      }

      continue;
    }

    const parentBlock = document.blocks[block.parentId];

    if (!parentBlock) {
      errors.push(
        `Block "${block.id}" references missing parent "${block.parentId}".`,
      );
      continue;
    }

    const parentKey = getBlockDefinitionKey(parentBlock);

    if (
      !isBlockAllowedInParent({
        templateType,
        parentKey,
        childKey: blockKey,
      })
    ) {
      errors.push(
        `Block "${block.id}" (${blockKey}) is not allowed in parent "${parentBlock.id}" (${parentKey}).`,
      );
    }
  }

  return errors;
}

function formatZodIssues(error: z.ZodError) {
  return error.issues.map((issue) => {
    const path = issue.path.length > 0 ? issue.path.join('.') : 'document';
    return `${path}: ${issue.message}`;
  });
}
