import * as React from 'react'
import { cn } from '../../lib/utils'

const Separator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('h-px w-full', className)}
      style={{ background: '#1f2435' }}
      {...props}
    />
  )
)
Separator.displayName = 'Separator'

export { Separator }
