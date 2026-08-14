import type { ComponentProps } from 'react';

import { Chip } from '@/components/primitives/Chip';

type Props = ComponentProps<typeof Chip>;

/** @deprecated Prefer Chip from components/primitives for new UI. */
export function Pill(props: Props) {
  return <Chip {...props} />;
}
