import type { ComponentProps } from 'react';

import { AppText } from '@/components/primitives/AppText';

type Props = ComponentProps<typeof AppText>;

/** @deprecated Prefer AppText from components/primitives for new UI. */
export function Type(props: Props) {
  return <AppText {...props} />;
}
