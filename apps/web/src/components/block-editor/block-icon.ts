import type { BlockType } from '@repo/templates';
import { Container, type LucideIcon, Type } from 'lucide-react';

export const blockIcon: Record<BlockType, LucideIcon> = {
  text: Type,
  container: Container,
};
