import { useMutation } from '@tanstack/react-query'
import { fetchApi } from '@/api/fetchApi'
import type { ApiError } from '@/api/ApiError'

/** Metadado "notes" da sala: a faixa "anotando" e o anotador leem daqui. */
export interface RoomNotes {
  active: boolean
  session: string
  by: string
  since: string
}

const call = (id: string, action: 'start-notes' | 'stop-notes') =>
  fetchApi<RoomNotes | { status: string }>(`rooms/${id}/${action}/`, {
    method: 'POST',
  })

export const useStartNotes = () =>
  useMutation<RoomNotes | { status: string }, ApiError, string>({
    mutationFn: (id) => call(id, 'start-notes'),
  })

export const useStopNotes = () =>
  useMutation<RoomNotes | { status: string }, ApiError, string>({
    mutationFn: (id) => call(id, 'stop-notes'),
  })
