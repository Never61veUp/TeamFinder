import { useState } from 'react'
import {githubService} from "../../services";

export function useGithub() {
  const [isConnecting, setIsConnecting] = useState(false)

  const connect = async () => {
    setIsConnecting(true)
    try {
      await githubService.connect()
    } finally {
      setIsConnecting(false)
    }
  }

  return { isConnecting, connect }
}
