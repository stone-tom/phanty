export const BLOCK_EDITOR_DOCUMENT_VERSION = 1;

export type TemplateType = 'form' | 'pdf' | 'email' | 'content';

export type BlockCategory = 'layout' | 'form' | 'content' | 'email' | 'pdf';

export type LayoutBlockType = 'container';
export type FormBlockType = 'text';
export type BlockType = LayoutBlockType | FormBlockType;

export interface BlockEditorDocument {
  version: typeof BLOCK_EDITOR_DOCUMENT_VERSION;
  templateType: TemplateType;
  blocks: Record<string, AnyBlock>;
  settings?: TemplateSettings;
}

export interface TemplateSettings {
  title?: string;
}

export interface BaseBlock {
  id: string;
  category: BlockCategory;
  type: BlockType;
  parentId: string | null;
  sortIndex: number; // defines sort order among siblings
}

// Future allowedBlocks / allowedChildren config should decide placement rules.
// These aliases describe block capabilities, not where a block is allowed.
export type RootBlock = LayoutBlock;
export type ChildBlock = FormBlock;
export type AnyBlock = RootBlock | ChildBlock;

export function isRootBlock(block: AnyBlock): block is RootBlock {
  return block.category === 'layout';
}

export function isChildBlock(block: AnyBlock): block is ChildBlock {
  return block.category === 'form';
}

export type LayoutBlock = ContainerLayoutBlock;

export interface ContainerLayoutBlock extends BaseBlock {
  category: 'layout';
  type: 'container';
  parentId: null;
}

export type FormBlock = TextFormBlock;

export interface BaseFormBlock extends BaseBlock {
  parentId: string;
  category: 'form';
  type: FormBlockType;
  schema: FormFieldSchema;
}

export interface TextFormBlock extends BaseFormBlock {
  type: 'text';
  schema: TextFieldSchema;
}

export interface FormFieldSchema {
  name: string;
  label: string;
  description?: string;
  required?: boolean;
}

export interface TextFieldSchema extends FormFieldSchema {
  placeholder?: string;
}

export type BlockByType<T extends AnyBlock['type']> = Extract<
  AnyBlock,
  { type: T }
>;
