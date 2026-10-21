import { useTranslation } from 'react-i18next'
import { DialogTrigger } from 'react-aria-components'
import { Button } from '@/primitives'
import { styled } from '@/styled-system/jsx'
import { Screen } from '@/layout/Screen'
import { UserAware } from '@/features/auth/components/UserAware'
import { useUser } from '@/features/auth/api/useUser'
import { JoinMeetingDialog } from '../components/JoinMeetingDialog'
import { CallPreview } from '../components/CallPreview'
import {
  RiLinksLine,
  RiQuillPenLine,
  RiShieldCheckLine,
} from '@remixicon/react'
import { CreateMeetingMenu } from '../components/CreateMeetingMenu'
import { CreateUnregisteredMeetingButton } from '../components/CreateUnregisteredMeetingButton'
import React, { ReactNode, useEffect, useState } from 'react'

import { css, cx } from '@/styled-system/css'
import { useConfig } from '@/api/useConfig'
import { LoginButton } from '@/components/LoginButton'
import { LoadingScreen } from '@/components/LoadingScreen'
import { captureEvent } from '@/features/analytics/telemetry'

const Columns = ({ children }: { children?: ReactNode }) => {
  return (
    <div
      className={css({
        alignItems: 'center',
        margin: 'auto',
        display: 'inline-flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: '100%',
        justifyContent: 'normal',
        padding: '0 1rem',
        width: 'calc(100% - 2rem)',
        _motionReduce: {
          opacity: 1,
        },
        lg: {
          flexDirection: 'row',
          justifyContent: 'center',
          width: '100%',
          padding: 0,
        },
      })}
    >
      {children}
    </div>
  )
}

const LeftColumn = ({ children }: { children?: ReactNode }) => {
  return (
    <div
      className={css({
        alignItems: 'center',
        textAlign: 'center',
        display: 'inline-flex',
        flexDirection: 'column',
        flexBasis: 'auto',
        flexShrink: 0,
        maxWidth: '38rem',
        width: '100%',
        padding: '1rem 3%',
        marginTop: 'auto',
        lg: {
          margin: 0,
          textAlign: 'left',
          alignItems: 'flex-start',
          flexShrink: '1',
          flexBasis: '40rem',
          maxWidth: '40rem',
          padding: '1em 3em',
        },
      })}
    >
      {children}
    </div>
  )
}

const RightColumn = ({ children }: { children?: ReactNode }) => {
  return (
    <div
      className={css({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflow: 'visible',
        padding: '1rem 3%',
        marginBottom: 'auto',
        flexBasis: 'auto',
        flexShrink: 0,
        maxWidth: '39rem',
        lg: {
          margin: 0,
          flexBasis: '45%',
          padding: '1em 3em',
        },
      })}
    >
      {children}
    </div>
  )
}

const Heading = styled('h1', {
  base: {
    fontWeight: '700',
    fontStyle: 'normal',
    fontStretch: 'normal',
    fontOpticalSizing: 'auto',
    paddingBottom: '1.2rem',
    fontSize: '2.3rem',
    lineHeight: '2.6rem',
    letterSpacing: '0',
    xsm: {
      fontSize: '3rem',
      lineHeight: '3.2rem',
    },
  },
})

// Reunião CliqFast: etiqueta antes do título, palavra de destaque e entrada escalonada (cada bloco sobe um pouco).
const riseClass = css({
  _motionSafe: {
    opacity: 0,
    animation:
      'cfRise 560ms cubic-bezier(0.23, 1, 0.32, 1) var(--cf-delay, 0ms) forwards',
  },
})
const rise = (delay: number) => ({
  className: riseClass,
  style: { '--cf-delay': `${delay}ms` } as React.CSSProperties,
})

const Eyebrow = styled('span', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.3rem 0.75rem',
    borderRadius: '999px',
    background: 'mint.50',
    color: 'mint.700',
    fontSize: '0.8rem',
    fontWeight: 600,
    marginBottom: '1rem',
    border: '1px solid',
    borderColor: 'mint.100',
  },
})

const Accent = styled('span', {
  base: {
    display: 'block',
    background: 'linear-gradient(90deg, #009672 0%, #01bd8c 55%, #2dcd9f 100%)',
    backgroundClip: 'text',
    color: 'transparent',
  },
})

const Feature = styled('li', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.45rem 0.8rem',
    borderRadius: '12px',
    background: 'white',
    border: '1px solid',
    borderColor: 'primary.100',
    boxShadow: 'sm',
    color: 'primary.800',
    fontSize: '0.875rem',
    fontWeight: 500,
    '& svg': { color: 'mint.600', flexShrink: 0 },
  },
})

const IntroText = styled('div', {
  base: {
    marginBottom: '3rem',
    fontSize: '1.2rem',
    lineHeight: '1.5rem',
    textWrap: 'balance',
    maxWidth: '32rem',
  },
})

const Home = () => {
  const { t } = useTranslation('home')
  const { isLoggedIn } = useUser()

  const [redirectFailed, setRedirectFailed] = useState(false)
  const { data } = useConfig()

  useEffect(() => {
    const checkSiteAndRedirect = async () => {
      if (!data?.external_home_url) return
      if (isLoggedIn === false) {
        try {
          await fetch(data.external_home_url, {
            method: 'HEAD', // Use HEAD to avoid downloading the full page
            mode: 'no-cors', // Needed for cross-origin requests
          })
          window.location.replace(data.external_home_url)
        } catch (error) {
          setRedirectFailed(true)
          captureEvent('external-home-unreachable', {
            error_name: error instanceof Error ? error.name : 'Unknown',
            error_message:
              error instanceof Error ? error.message : String(error),
          })
        }
      }
    }

    checkSiteAndRedirect()
  }, [isLoggedIn, data])

  if (data?.external_home_url && isLoggedIn == false && !redirectFailed) {
    return <LoadingScreen header={false} footer={false} delay={0} />
  }

  return (
    <UserAware>
      <Screen>
        <Columns>
          <LeftColumn>
            <Eyebrow {...rise(0)}>
              <span
                aria-hidden="true"
                className={css({
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: 'mint.500',
                  _motionSafe: { animation: 'cfPulse 1.8s ease-out infinite' },
                })}
              />
              {t('eyebrow')}
            </Eyebrow>
            <Heading {...rise(60)}>
              {t('heading')} <Accent>{t('headingAccent')}</Accent>
            </Heading>
            <IntroText {...rise(120)}>{t('intro')}</IntroText>
            <div
              style={rise(180).style}
              className={cx(
                riseClass,
                css({
                  display: 'flex',
                  gap: 0.5,
                  flexDirection: { base: 'column', xsm: 'row' },
                  flexWrap: 'wrap',
                  alignItems: { base: 'center', xsm: 'items-start' },
                })
              )}
            >
              {isLoggedIn ? (
                <CreateMeetingMenu />
              ) : (
                <>
                  {data?.allow_unregistered_rooms && (
                    <CreateUnregisteredMeetingButton />
                  )}
                  <LoginButton proConnectHint={false} />
                </>
              )}
              <DialogTrigger>
                <Button
                  variant="secondary"
                  style={{
                    height:
                      !isLoggedIn && data?.use_proconnect_button
                        ? '56px'
                        : undefined, // Temporary, Align with ProConnect Button fixed height
                  }}
                >
                  {t('joinMeeting')}
                </Button>
                <JoinMeetingDialog />
              </DialogTrigger>
            </div>
            <ul
              style={rise(260).style}
              className={cx(
                riseClass,
                css({
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  marginTop: '2rem',
                  justifyContent: { base: 'center', lg: 'flex-start' },
                })
              )}
            >
              <Feature>
                <RiLinksLine size={18} aria-hidden="true" />
                {t('features.link')}
              </Feature>
              <Feature>
                <RiQuillPenLine size={18} aria-hidden="true" />
                {t('features.notes')}
              </Feature>
              <Feature>
                <RiShieldCheckLine size={18} aria-hidden="true" />
                {t('features.secure')}
              </Feature>
            </ul>
          </LeftColumn>
          <RightColumn>
            <CallPreview />
          </RightColumn>
        </Columns>
      </Screen>
    </UserAware>
  )
}

export default Home
