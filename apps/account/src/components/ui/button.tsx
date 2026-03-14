import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 disabled:pointer-events-none cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-accent text-bg hover:bg-accent2 font-semibold',
        outline: 'border text-text',
        ghost: 'text-text-dim hover:text-text hover:bg-white/5',
      },
      size: {
        default: 'px-4 py-3',
        sm: 'px-3 py-2 text-xs',
        lg: 'px-5 py-3.5',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, style, ...props }, ref) => {
    const base = variant === 'outline'
      ? { background: 'var(--surface2)', borderColor: 'var(--border)', ...style }
      : style

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        style={base}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
