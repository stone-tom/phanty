import type { ReactNode } from 'react';

export type ActionRenderState = {
  formId: string;
  isPending: boolean;
};

export interface ActionChildrenProps {
  children: (state: ActionRenderState) => ReactNode;
}
