import { useConfig } from '@/api/useConfig'
import { useUser } from '@/features/auth/api/useUser'
import { useRoomData } from '@/features/rooms/livekit/hooks/useRoomData'
import { useRoomMetadata } from '@/features/recording/hooks/useRoomMetadata'
import type { RoomNotes } from '../api/notes'
import { useStartNotes, useStopNotes } from '../api/notes'

/**
 * Anotações da reunião: liga e desliga pelo backend (o anotador manda as falas para a CliqGestão).
 * Quem pode ligar: quem entrou com conta da equipe. Todos veem a faixa enquanto estiver ligado.
 */
export const useNotes = () => {
  const { data: config } = useConfig()
  const { isLoggedIn } = useUser()
  const room = useRoomData()
  const metadata = useRoomMetadata() as { notes?: RoomNotes } | undefined
  const start = useStartNotes()
  const stop = useStopNotes()
  const notes = metadata?.notes?.active ? metadata.notes : undefined
  const roomId = room?.livekit?.room ?? room?.id
  const isPending = start.isPending || stop.isPending

  const toggle = async () => {
    if (!roomId || isPending) return
    if (notes) await stop.mutateAsync(roomId)
    else await start.mutateAsync(roomId)
  }

  return {
    isAvailable: !!config?.notes?.enabled,
    canToggle: !!config?.notes?.enabled && !!isLoggedIn && !!roomId,
    notes,
    isActive: !!notes,
    isPending,
    error: start.error ?? stop.error,
    toggle,
  }
}
