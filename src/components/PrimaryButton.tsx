import type { ComponentProps } from 'react';

import { Button } from '@/components/primitives/Button';

type Props = Omit<ComponentProps<typeof Button>, 'icon'>;

/** @deprecated Prefer Button from components/primitives for new UI. */
export function PrimaryButton(props: Props) {
  return <Button {...props} />;
}
