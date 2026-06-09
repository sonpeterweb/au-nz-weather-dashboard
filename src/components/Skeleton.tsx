import * as React from 'react';

import { cn } from '@/lib/utils';

type SkeletonProps = React.ComponentPropsWithoutRef<'div'>;

export function Skeleton({ className, ...rest }: SkeletonProps) {
  return (
    <div
      className={cn('skeleton rounded-md bg-base-300', className)}
      {...rest}
    />
  );
}

export default Skeleton;
