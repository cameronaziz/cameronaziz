import type { ReactElement } from 'react';
import { config } from '@keystone-next/keystone';

export type ConfigOptions = Parameters<typeof config>[0];

export type RenderData = {
  id: string;
  label: string | undefined;
  data: Record<string, any> | undefined;
} | null;

export type RenderComponent = (props: RenderData) => ReactElement | null;
