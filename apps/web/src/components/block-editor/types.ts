export const BLOCK_EDITOR_DOCUMENT_VERSION = 1;

export type TemplateType = 'form' | 'pdf' | 'email' | 'content';

export type BlockCategory = 'layout' | 'form' | 'content' | 'email' | 'pdf';

export type LayoutBlockType = 'container';
export type FormBlockType = 'text';
export type BlockType = LayoutBlockType | FormBlockType;

export interface BlockEditorDocument {
  version: typeof BLOCK_EDITOR_DOCUMENT_VERSION;
  templateType: TemplateType;
  rootBlockIds: string[];
  blocks: Record<AnyBlock['id'], AnyBlock>;
  settings?: TemplateSettings;
}

export interface TemplateSettings {
  title?: string;
}

export interface BaseBlock {
  id: string;
  category: BlockCategory;
  type: BlockType;
}

// Future allowedBlocks / allowedChildren config should decide placement rules.
// These aliases describe block capabilities, not where a block is allowed.
export type ParentBlock = LayoutBlock;
export type LeafBlock = FormBlock;
export type AnyBlock = ParentBlock | LeafBlock;

export type LayoutBlock = ContainerLayoutBlock;

export interface ContainerLayoutBlock extends BaseBlock {
  category: 'layout';
  type: 'container';
  childIds: string[];
}

export type FormBlock = TextFormBlock;

export interface BaseFormBlock extends BaseBlock {
  parentId: string | null;
  category: 'form';
  type: FormBlockType;
  field: FormFieldDefinition;
}

export interface TextFormBlock extends BaseFormBlock {
  type: 'text';
  field: TextFieldDefinition;
}

export interface FormFieldDefinition {
  name: string;
  label: string;
  description?: string;
  required?: boolean;
}

export interface TextFieldDefinition extends FormFieldDefinition {
  placeholder?: string;
}

export type BlockByType<T extends AnyBlock['type']> = Extract<
  AnyBlock,
  { type: T }
>;
