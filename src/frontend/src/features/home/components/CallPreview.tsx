import { useTranslation } from 'react-i18next'
import { RiMicLine, RiQuillPenLine, RiVideoOnLine } from '@remixicon/react'
import { css, cx } from '@/styled-system/css'

/**
 * Reunião CliqFast: no lugar do carrossel, um quadro de chamada que se mexe. Quatro pessoas, uma falando (anel verde que
 * pulsa), e o cartão "Anotando" escrevendo a ata. Tudo é decorativo (aria-hidden) e para quem pede menos movimento fica
 * parado e completo.
 */
const PEOPLE = [
  { initials: 'AN', bg: 'hsl(214, 64%, 36%)' },
  { initials: 'CE', bg: 'hsl(168, 62%, 30%)', speaking: true },
  { initials: 'WA', bg: 'hsl(230, 58%, 40%)' },
  { initials: 'PG', bg: 'hsl(186, 66%, 32%)' },
]

// Classes fixas (o Panda gera o CSS ao compilar; valor montado em tempo de execução não vira classe).
const float = css({
  _motionSafe: { animation: 'cfFloat 7s ease-in-out infinite' },
})
const pulse = css({
  _motionSafe: { animation: 'cfPulse 1.8s ease-out infinite' },
})
const ring = css({
  _motionSafe: { animation: 'cfRing 1.6s ease-out infinite' },
})
const bars = css({
  _motionSafe: { animation: 'cfBars 900ms ease-in-out infinite alternate' },
})
const typing = css({
  _motionSafe: {
    animation: 'cfType 3.6s cubic-bezier(0.23, 1, 0.32, 1) infinite',
  },
})

export const CallPreview = () => {
  const { t } = useTranslation('home', { keyPrefix: 'preview' })
  return (
    <div
      aria-hidden="true"
      className={css({
        position: 'relative',
        width: '100%',
        maxWidth: '34rem',
        paddingBottom: '2.5rem',
        _motionSafe: {
          opacity: 0,
          animation:
            'cfRise 700ms cubic-bezier(0.23, 1, 0.32, 1) 180ms forwards',
        },
      })}
    >
      <div
        className={cx(
          css({
            position: 'relative',
            borderRadius: '22px',
            padding: '0.875rem',
            background:
              'linear-gradient(160deg, #0b2a63 0%, #011a46 55%, #050d22 100%)',
            boxShadow:
              '0 30px 60px -24px rgba(1, 26, 70, 0.55), inset 0 1px 0 rgba(255,255,255,0.08)',
          }),
          float
        )}
      >
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'rgba(255,255,255,0.75)',
            fontSize: '0.75rem',
            paddingBottom: '0.625rem',
          })}
        >
          <span
            className={cx(
              css({
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#2dcd9f',
              }),
              pulse
            )}
          />
          {t('room')}
          <span className={css({ marginLeft: 'auto', opacity: 0.6 })}>
            12:04
          </span>
        </div>
        <div
          className={css({
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: '0.5rem',
          })}
        >
          {PEOPLE.map((p, i) => (
            <div
              key={p.initials}
              className={css({
                position: 'relative',
                aspectRatio: '16 / 10',
                borderRadius: '14px',
                display: 'grid',
                placeItems: 'center',
                overflow: 'hidden',
              })}
              style={{
                background: `radial-gradient(circle at 50% 45%, color-mix(in oklch, ${p.bg} 80%, white) 0%, ${p.bg} 45%, color-mix(in oklch, ${p.bg} 60%, black) 100%)`,
                animationDelay: `${i * 90}ms`,
              }}
            >
              <span
                className={cx(
                  css({
                    width: '3.25rem',
                    height: '3.25rem',
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    background: 'rgba(255,255,255,0.14)',
                    color: 'white',
                    fontFamily: 'heading',
                    fontWeight: 700,
                    fontSize: '1rem',
                  }),
                  p.speaking && ring
                )}
                style={
                  p.speaking ? { boxShadow: '0 0 0 3px #2dcd9f' } : undefined
                }
              >
                {p.initials}
              </span>
              {p.speaking && (
                <span
                  className={css({
                    position: 'absolute',
                    left: '0.5rem',
                    bottom: '0.5rem',
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: '2px',
                    height: '14px',
                  })}
                >
                  {[0, 1, 2].map((b) => (
                    <i
                      key={b}
                      className={cx(
                        css({
                          display: 'block',
                          width: '3px',
                          height: '60%',
                          borderRadius: '2px',
                          background: '#67e3bb',
                          transformOrigin: 'bottom',
                        }),
                        bars
                      )}
                      style={{ animationDelay: `${b * 150}ms` }}
                    />
                  ))}
                </span>
              )}
            </div>
          ))}
        </div>
        <div
          className={css({
            display: 'flex',
            justifyContent: 'center',
            gap: '0.5rem',
            paddingTop: '0.75rem',
          })}
        >
          {[RiMicLine, RiVideoOnLine, RiQuillPenLine].map((Icon, i) => (
            <span
              key={i}
              className={css({
                width: '2.25rem',
                height: '2.25rem',
                borderRadius: '12px',
                display: 'grid',
                placeItems: 'center',
                color: i === 2 ? '#022519' : 'white',
                background: i === 2 ? '#2dcd9f' : 'rgba(255,255,255,0.1)',
              })}
            >
              <Icon size={18} />
            </span>
          ))}
          <span
            className={css({
              width: '3rem',
              height: '2.25rem',
              borderRadius: '12px',
              background: '#e5484d',
            })}
          />
        </div>
      </div>
      <div
        className={cx(
          css({
            position: 'absolute',
            right: { base: '0.5rem', lg: '-1.5rem' },
            bottom: '0',
            width: '15rem',
            borderRadius: '16px',
            padding: '0.875rem 1rem',
            background: 'white',
            color: '#0b1733',
            boxShadow: '0 22px 44px -16px rgba(1, 26, 70, 0.38)',
            border: '1px solid #dde5f0',
            _motionSafe: {
              opacity: 0,
              animation:
                'cfRise 600ms cubic-bezier(0.23, 1, 0.32, 1) 650ms forwards',
            },
          })
        )}
      >
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#00785e',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            paddingBottom: '0.5rem',
          })}
        >
          <RiQuillPenLine size={14} /> {t('notes')}
        </div>
        {[92, 78, 64].map((w, i) => (
          <span
            key={w}
            className={cx(
              css({
                display: 'block',
                height: '7px',
                borderRadius: '4px',
                background: '#dbe6fe',
                marginTop: '0.4rem',
                transformOrigin: 'left',
              }),
              typing
            )}
            style={{ width: `${w}%`, animationDelay: `${i * 400}ms` }}
          />
        ))}
        <p
          className={css({
            fontSize: '0.75rem',
            color: '#5d6b82',
            paddingTop: '0.625rem',
          })}
        >
          {t('notesHint')}
        </p>
      </div>
    </div>
  )
}
