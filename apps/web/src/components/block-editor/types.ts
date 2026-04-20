export const BLOCK_EDITOR_DOCUMENT_VERSION = 1;

export type TemplateType = 'form' | 'pdf' | 'email' | 'content';

export type BlockCategory = 'layout' | 'form' | 'content' | 'email' | 'pdf';

export type LayoutBlockType = 'container';
export type FormBlockType = 'text';
export type BlockType = LayoutBlockType | FormBlockType;

export interface BlockEditorDocument {
  version: typeof BLOCK_EDITOR_DOCUMENT_VERSION;
  templateType: TemplateType;
  blocks: {
    root: AnyBlock[];
    [blockId: string]: AnyBlock[];
  };
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
  sortIndex: number;
}

// Future allowedBlocks / allowedChildren config should decide placement rules.
// These aliases describe block capabilities, not where a block is allowed.
export type ParentBlock = LayoutBlock;
export type LeafBlock = FormBlock;
export type AnyBlock = ParentBlock | LeafBlock;

export function isParentBlock(block: AnyBlock): block is ParentBlock {
  return block.category === 'layout';
}

export function isLeafBlock(block: AnyBlock): block is LeafBlock {
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
