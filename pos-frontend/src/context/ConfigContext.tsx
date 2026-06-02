/**
 * ConfigContext — provee la configuración del sistema a toda la app.
 *
 * Al guardar cambios (tasa IVA, formato papel), el POS los aplica
 * inmediatamente sin recargar la página. Req-11 (11.4, 11.5).
 */
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react'
import type { ConfiguracionResponse } from '../types/reporte.types'
import { getConfiguracion } from '../api/configuracion.api'

const DEFAULT_CONFIG: ConfiguracionResponse = {
  id: 'global',
  nombre_negocio: 'Mi Supermercado',
  tasa_iva: 0.19,
  formato_papel: '80mm',
  logo_url: null,
  updated_at: '',
}

interface ConfigContextValue {
  config: ConfiguracionResponse
  setConfig: (c: ConfiguracionResponse) => void
  isLoading: boolean
}

const ConfigContext = createContext<ConfigContextValue>({
  config: DEFAULT_CONFIG,
  setConfig: () => {},
  isLoading: false,
})

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfigState] = useState<ConfiguracionResponse>(DEFAULT_CONFIG)
  const [isLoading, setIsLoading] = useState(true)

  // Cargar configuración al montar — solo si hay token
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { setIsLoading(false); return }

    getConfiguracion()
      .then((c) => setConfigState(c))
      .catch(() => { /* usa defaults si el backend no está disponible */ })
      .finally(() => setIsLoading(false))
  }, [])

  const setConfig = useCallback((c: ConfiguracionResponse) => {
    setConfigState(c)
  }, [])

  return (
    <ConfigContext.Provider value={{ config, setConfig, isLoading }}>
      {children}
    </ConfigContext.Provider>
  )
}

export function useConfig(): ConfigContextValue {
  return useContext(ConfigContext)
}
