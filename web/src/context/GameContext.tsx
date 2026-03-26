import { createContext, useContext } from 'react'
import type { TGameState } from '../types'

type TGameContextValue = {
  gameState: TGameState | null
}

export const GameContext = createContext<TGameContextValue>({
  gameState: null,
})

export const useGameContext = (): TGameContextValue => {
  return useContext(GameContext)
}
