import { z } from 'zod';

export const BLOCK_EDITOR_DOCUMENT_VERSION = 1;

export const TemplateTypeSchema = z.enum(['form', 'pdf', 'email', 'content']);
export type TemplateType = z.infer<typeof TemplateTypeSchema>;

export const BlockCategorySchema = z.enum([
  'layout',
  'form',
  'content',
  'email',
  'pdf',
]);
export type BlockCategory = z.infer<typeof BlockCategorySchema>;

export const LayoutBlockTypeSchema = z.enum(['container']);
export type LayoutBlockType = z.infer<typeof LayoutBlockTypeSchema>;

export const FormBlockTypeSchema = z.enum(['text']);
export type FormBlockType = z.infer<typeof FormBlockTypeSchema>;

export const BlockTypeSchema = z.union([
  LayoutBlockTypeSchema,
  FormBlockTypeSchema,
]);
export type BlockType = z.infer<typeof BlockTypeSchema>;

export const BlockDefinitionStatusSchema = z.enum([
  'active',
  'deprecated',
  'disabled',
]);
export type BlockDefinitionStatus = z.infer<typeof BlockDefinitionStatusSchema>;

export const BlockVersionSchema = z.number().int().positive();
export type BlockVersion = z.infer<typeof BlockVersionSchema>;

const BaseBlockDefinitionSchema = z
  .object({
    name: z.string().min(1),
    description: z.string().min(1),
    version: BlockVersionSchema,
    status: BlockDefinitionStatusSchema,
  })
  .strict();

export const LayoutBlockDefinitionSchema = BaseBlockDefinitionSchema.extend({
  category: z.literal('layout'),
  type: LayoutBlockTypeSchema,
}).strict();

export const FormBlockDefinitionSchema = BaseBlockDefinitionSchema.extend({
  category: z.literal('form'),
  type: FormBlockTypeSchema,
}).strict();

export const BlockDefinitionSchema = z.discriminatedUnion('category', [
  LayoutBlockDefinitionSchema,
  FormBlockDefinitionSchema,
]);
export type BlockDefinition = z.infer<typeof BlockDefinitionSchema>;

export const TemplateSettingsSchema = z
  .object({
    title: z.string().optional(),
  })
  .strict();
export type TemplateSettings = z.infer<typeof TemplateSettingsSchema>;

export const BaseBlockSchema = z
  .object({
    id: z.string().min(1),
    category: BlockCategorySchema,
    type: BlockTypeSchema,
    version: BlockVersionSchema,
    parentId: z.string().min(1).nullable(),
    sortIndex: z.number().int().nonnegative(),
  })
  .strict();
export type BaseBlock = z.infer<typeof BaseBlockSchema>;

export const ContainerLayoutBlockSchema = BaseBlockSchema.extend({
  category: z.literal('layout'),
  type: z.literal('container'),
  parentId: z.null(),
}).strict();
export type ContainerLayoutBlock = z.infer<typeof ContainerLayoutBlockSchema>;

export const FormFieldSchema = z
  .object({
    label: z.string().min(1),
    description: z.string().optional(),
    required: z.boolean().optional(),
  })
  .strict();
export type FormFieldSchema = z.infer<typeof FormFieldSchema>;

export const BaseFormBlockSchema = BaseBlockSchema.extend({
  category: z.literal('form'),
  type: FormBlockTypeSchema,
  parentId: z.string().min(1),
  schema: FormFieldSchema,
}).strict();
export type BaseFormBlock = z.infer<typeof BaseFormBlockSchema>;

export const TextFieldSchema = FormFieldSchema.extend({
  placeholder: z.string().optional(),
}).strict();
export type TextFieldSchema = z.infer<typeof TextFieldSchema>;

export const TextFormBlockSchema = BaseFormBlockSchema.extend({
  type: z.literal('text'),
  schema: TextFieldSchema,
}).strict();
export type TextFormBlock = z.infer<typeof TextFormBlockSchema>;

export const LayoutBlockSchema = ContainerLayoutBlockSchema;
export type LayoutBlock = z.infer<typeof LayoutBlockSchema>;

export const FormBlockSchema = TextFormBlockSchema;
export type FormBlock = z.infer<typeof FormBlockSchema>;

export const AnyBlockSchema = z.discriminatedUnion('type', [
  ContainerLayoutBlockSchema,
  TextFormBlockSchema,
]);
export type AnyBlock = z.infer<typeof AnyBlockSchema>;

export const BlockEditorDocumentSchema = z
  .object({
    version: z.literal(BLOCK_EDITOR_DOCUMENT_VERSION),
    templateType: TemplateTypeSchema,
    blocks: z.record(z.string().min(1), AnyBlockSchema),
    settings: TemplateSettingsSchema.optional(),
  })
  .strict();
export type BlockEditorDocument = z.infer<typeof BlockEditorDocumentSchema>;

export type RootBlock = LayoutBlock;
export type ChildBlock = FormBlock;

export type BlockByType<T extends AnyBlock['type']> = Extract<
  AnyBlock,
  { type: T }
>;

export function isRootBlock(block: AnyBlock): block is RootBlock {
  return block.category === 'layout';
}

export function isChildBlock(block: AnyBlock): block is ChildBlock {
  return block.category === 'form';
}
