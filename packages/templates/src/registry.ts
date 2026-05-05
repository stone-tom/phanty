import type {
  BlockCategory,
  BlockType,
  BlockVersion,
  FormBlock,
  LayoutBlock,
  TemplateType,
} from './types';

export type BlockDefinitionKey =
  | `${LayoutBlock['category']}:${LayoutBlock['type']}`
  | `${FormBlock['category']}:${FormBlock['type']}`;
export type PlacementParentKey = 'root' | BlockDefinitionKey;

type TemplatePlacementRules = Partial<
  Record<PlacementParentKey, readonly BlockDefinitionKey[]>
>;

export const templatePlacementRules: Record<
  TemplateType,
  TemplatePlacementRules
> = {
  form: {
    root: ['layout:container'],
    'layout:container': ['form:text'],
  },
  pdf: {},
  email: {},
  content: {},
} satisfies Record<TemplateType, TemplatePlacementRules>;

export function getBlockDefinitionKey(
  category: BlockCategory,
  type: BlockType,
): BlockDefinitionKey {
  return `${category}:${type}` as BlockDefinitionKey;
}

export function getBlockVersionKey(
  category: BlockCategory,
  type: BlockType,
  version: BlockVersion,
): `${BlockDefinitionKey}@${BlockVersion}` {
  return `${getBlockDefinitionKey(category, type)}@${version}`;
}

export function isBlockAllowedInParent(params: {
  templateType: TemplateType;
  parentKey: PlacementParentKey;
  childKey: BlockDefinitionKey;
}) {
  const allowedChildren =
    templatePlacementRules[params.templateType][params.parentKey] ?? [];

  return allowedChildren.includes(params.childKey);
}
