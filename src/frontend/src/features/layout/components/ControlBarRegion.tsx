import { cva, RecipeVariantProps } from '@/styled-system/css'
import { useTranslation } from 'react-i18next'

const controlBarRegion = cva({
  base: {
    display: 'flex',
    alignItems: 'center',
    flex: '0 0 auto',
    justifyContent: 'center',
    gap: '0.5rem',
    // Reunião CliqFast: os controles numa pílula translúcida sobre o marinho.
    padding: '0.5rem 0.625rem',
    borderRadius: '20px',
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.07)',
    boxShadow: '0 18px 40px -20px rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(10px)',
  },
  variants: {
    mobile: {
      true: {
        justifyContent: 'center',
        width: '100%',
        flex: '1 1 auto',
        padding: '0.375rem',
        borderRadius: '16px',
      },
    },
  },
  defaultVariants: {
    mobile: false,
  },
})

export const CONTROL_BAR_REGION_ID = 'control-bar-region'

export type ControlBarRegionProps = React.HTMLAttributes<HTMLDivElement> &
  RecipeVariantProps<typeof controlBarRegion>

export function ControlBarRegion({
  children,
  mobile,
  ...props
}: ControlBarRegionProps) {
  const { t } = useTranslation('rooms')
  return (
    <div
      role="region"
      id={CONTROL_BAR_REGION_ID}
      aria-label={t('controls.region')}
      className={controlBarRegion({ mobile })}
      {...props}
    >
      {children}
    </div>
  )
}
