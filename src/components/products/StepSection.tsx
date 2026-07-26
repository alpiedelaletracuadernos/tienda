// src/components/products/StepSection.tsx
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Props = {
  step: number;
  title: string;
  hint?: string;
  children: ReactNode;
  id?: string;
  className?: string;
};

export function StepSection({ step, title, hint, children, id, className }: Props) {
  return (
    <section id={id} className={cn('space-y-3', className)}>
      <div className="flex items-start gap-3">
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold"
          aria-hidden="true"
        >
          {step}
        </span>
        <div className="min-w-0 pt-0.5">
          <h2 className="font-semibold leading-tight">{title}</h2>
          {hint && <p className="text-sm text-muted-foreground mt-0.5">{hint}</p>}
        </div>
      </div>
      <div className="pl-10">{children}</div>
    </section>
  );
}

export default StepSection;
