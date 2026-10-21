import { useTranslation } from 'react-i18next'
import { RiQuillPenLine } from '@remixicon/react'
import { ToggleButton } from '@/primitives'
import { useNotes } from '../hooks/useNotes'

/** Botão da barra: liga e desliga as anotações (só aparece para quem entrou com conta da equipe). */
export const NotesToggle = () => {
  const { t } = useTranslation('rooms', { keyPrefix: 'controls.notes' })
  const { canToggle, isActive, isPending, toggle } = useNotes()
  if (!canToggle) return null
  const label = isActive ? t('stop') : t('start')
  return (
    <ToggleButton
      square
      variant="primaryDark"
      aria-label={label}
      tooltip={label}
      isSelected={isActive}
      isDisabled={isPending}
      onPress={() => void toggle().catch(() => undefined)}
      data-attr={`controls-notes-${isActive ? 'on' : 'off'}`}
    >
      <RiQuillPenLine />
    </ToggleButton>
  )
}
