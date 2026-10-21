import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { css } from '@/styled-system/css'
import { useScreenReaderAnnounce } from '@/hooks/useScreenReaderAnnounce'
import { useNotes } from '../hooks/useNotes'

/**
 * Faixa no topo para todos: "Anotando a reunião · ligado por Fulano". Quando desliga, avisa por alguns segundos que a
 * ata vai para a CliqGestão e por e-mail. É o aviso de que as falas estão sendo anotadas.
 */
export const NotesBanner = () => {
  const { t } = useTranslation('rooms', { keyPrefix: 'notesBanner' })
  const { isActive, notes, canToggle, toggle, isPending, error } = useNotes()
  const announce = useScreenReaderAnnounce()
  const was = useRef(false)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    if (isActive && !was.current)
      announce(t('on', { name: notes?.by || t('someone') }))
    if (!isActive && was.current) {
      announce(t('sent'))
      setSent(true)
      const id = window.setTimeout(() => setSent(false), 7000)
      was.current = false
      return () => window.clearTimeout(id)
    }
    was.current = isActive
  }, [isActive, notes?.by, announce, t])

  if (!isActive && !sent && !error) return null
  return (
    <div
      role="status"
      className={css({
        position: 'fixed',
        top: '12px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        gap: '0.625rem',
        padding: '0.375rem 0.5rem 0.375rem 0.875rem',
        borderRadius: '999px',
        background: 'rgba(1, 26, 70, 0.88)',
        border: '1px solid rgba(103, 227, 187, 0.35)',
        boxShadow: '0 10px 30px -12px rgba(0, 0, 0, 0.55)',
        color: 'white',
        fontSize: '0.8125rem',
        backdropFilter: 'blur(10px)',
        animation: 'cfBannerIn 220ms cubic-bezier(0.23, 1, 0.32, 1)',
        _motionReduce: { animation: 'none' },
      })}
    >
      <span
        aria-hidden="true"
        className={css({
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: error ? '#f87171' : '#2dcd9f',
          boxShadow: '0 0 0 0 rgba(45, 205, 159, 0.6)',
          animation: isActive ? 'cfPulse 1.8s ease-out infinite' : 'none',
          _motionReduce: { animation: 'none' },
        })}
      />
      <span>
        {error
          ? t('error')
          : isActive
            ? t('on', { name: notes?.by || t('someone') })
            : t('sent')}
      </span>
      {isActive && canToggle && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => void toggle().catch(() => undefined)}
          className={css({
            borderRadius: '999px',
            padding: '0.25rem 0.75rem',
            background: 'rgba(255, 255, 255, 0.12)',
            color: 'white',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background-color 150ms ease',
            _hover: { background: 'rgba(255, 255, 255, 0.2)' },
            _disabled: { opacity: 0.6, cursor: 'default' },
          })}
        >
          {t('stop')}
        </button>
      )}
    </div>
  )
}
