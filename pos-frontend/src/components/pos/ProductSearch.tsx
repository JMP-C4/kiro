/**
 * ProductSearch — Req-2, P-05
 *
 * Fieldset with a hidden legend, a search input and a lupa (magnifier) button.
 * Structure mirrors Referencias/search.html.
 *
 * Behaviour:
 *  - Typing debounces 300 ms then calls buscarProductos()
 *  - Results appear in a glass-card dropdown
 *  - ↑ / ↓ navigate the list; Enter selects; Esc closes
 *  - On selection:
 *      • weight product (kg/g/lb) → onWeightRequired(producto)
 *      • otherwise               → onAddItem(producto) + clear input
 *  - "Producto no encontrado" shown when query is non-empty and results are empty
 *  - F1 focus is handled by the parent via focusRef
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import { buscarProductos } from '../../api/productos.api'
import type { ProductoSearchResult } from '../../types/producto.types'

const WEIGHT_UNITS = new Set(['kg', 'g', 'lb'])

interface ProductSearchProps {
  onAddItem: (producto: ProductoSearchResult, peso?: number) => void
  onWeightRequired: (producto: ProductoSearchResult) => void
  focusRef?: React.RefObject<HTMLInputElement | null>
}

export default function ProductSearch({
  onAddItem,
  onWeightRequired,
  focusRef,
}: ProductSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ProductoSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)

  const internalRef = useRef<HTMLInputElement>(null)
  // Expose the input ref to the parent (for F1 focus)
  const inputRef = (focusRef ?? internalRef) as React.RefObject<HTMLInputElement>

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // ── Search ──────────────────────────────────────────────────────────────────

  const runSearch = useCallback(async (text: string) => {
    if (!text.trim()) {
      setResults([])
      setShowDropdown(false)
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    try {
      const data = await buscarProductos(text.trim())
      setResults(data)
      setShowDropdown(true)
      setSelectedIndex(-1)
    } catch {
      setResults([])
      setShowDropdown(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)

    if (debounceTimer.current) clearTimeout(debounceTimer.current)

    if (!value.trim()) {
      setResults([])
      setShowDropdown(false)
      setIsLoading(false)
      return
    }

    debounceTimer.current = setTimeout(() => {
      runSearch(value)
    }, 300)
  }

  // ── Selection ────────────────────────────────────────────────────────────────

  const selectProduct = useCallback(
    (producto: ProductoSearchResult) => {
      if (WEIGHT_UNITS.has(producto.unidad_medida)) {
        onWeightRequired(producto)
      } else {
        onAddItem(producto)
        setQuery('')
      }
      setShowDropdown(false)
      setResults([])
      setSelectedIndex(-1)
    },
    [onAddItem, onWeightRequired]
  )

  // ── Keyboard navigation ──────────────────────────────────────────────────────

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) =>
          results.length === 0 ? -1 : Math.min(prev + 1, results.length - 1)
        )
        break

      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => Math.max(prev - 1, -1))
        break

      case 'Enter': {
        e.preventDefault()
        if (results.length === 0) break
        const idx = selectedIndex >= 0 ? selectedIndex : 0
        selectProduct(results[idx])
        break
      }

      case 'Escape':
        e.preventDefault()
        setShowDropdown(false)
        setSelectedIndex(-1)
        break

      default:
        break
    }
  }

  // ── Search button click ──────────────────────────────────────────────────────

  const handleSearchClick = () => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    runSearch(query)
  }

  // ── Close dropdown on outside click ─────────────────────────────────────────

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // ── Cleanup debounce on unmount ──────────────────────────────────────────────

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [])

  // ── Render ───────────────────────────────────────────────────────────────────

  const showNotFound = showDropdown && !isLoading && query.trim() && results.length === 0

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Fieldset structure from search.html */}
      <fieldset className="w-full">
        <legend className="sr-only">Buscar producto</legend>

        <div className="relative">
          {/* Lupa button — positioned inside the input on the left */}
          <span className="absolute inset-y-0 left-0 flex items-center pl-2 z-10">
            <button
              type="button"
              title="Buscar"
              aria-label="Buscar producto"
              onClick={handleSearchClick}
              className="p-1 focus:outline-none focus:ring-2 focus:ring-violet-500/60 rounded"
            >
              {isLoading ? (
                /* Inline mini-spinner while loading */
                <span
                  className="block w-4 h-4 border-2 border-dashed border-violet-400 rounded-full animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <svg
                  fill="currentColor"
                  viewBox="0 0 512 512"
                  className="w-4 h-4 text-white/60"
                  aria-hidden="true"
                >
                  <path d="M479.6,399.716l-81.084-81.084-62.368-25.767A175.014,175.014,0,0,0,368,192c0-97.047-78.953-176-176-176S16,94.953,16,192,94.953,368,192,368a175.034,175.034,0,0,0,101.619-32.377l25.7,62.2L400.4,478.911a56,56,0,1,0,79.2-79.195ZM48,192c0-79.4,64.6-144,144-144s144,64.6,144,144S271.4,336,192,336,48,271.4,48,192ZM456.971,456.284a24.028,24.028,0,0,1-33.942,0l-76.572-76.572-23.894-57.835L380.4,345.771l76.573,76.572A24.028,24.028,0,0,1,456.971,456.284Z" />
                </svg>
              )}
            </button>
          </span>

          <input
            ref={inputRef}
            id="product-search"
            type="search"
            name="product-search"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Buscar por código o nombre…"
            autoComplete="off"
            aria-label="Buscar producto"
            aria-autocomplete="list"
            aria-controls={showDropdown ? 'product-search-results' : undefined}
            aria-activedescendant={
              selectedIndex >= 0
                ? `product-result-${selectedIndex}`
                : undefined
            }
            className="glass-input w-full rounded-lg py-2 pl-10 pr-3 text-sm text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-violet-500/60 transition"
          />
        </div>
      </fieldset>

      {/* Dropdown */}
      {showDropdown && (
        <div
          id="product-search-results"
          role="listbox"
          aria-label="Resultados de búsqueda"
          className="absolute left-0 right-0 top-full mt-1 z-50 glass-card overflow-hidden"
        >
          {showNotFound ? (
            <p
              role="status"
              className="px-4 py-3 text-sm text-white/60 text-center"
            >
              Producto no encontrado
            </p>
          ) : (
            <ul className="max-h-64 overflow-y-auto divide-y divide-white/10">
              {results.map((producto, index) => (
                <li
                  key={producto.id}
                  id={`product-result-${index}`}
                  role="option"
                  aria-selected={index === selectedIndex}
                  onMouseEnter={() => setSelectedIndex(index)}
                  onClick={() => selectProduct(producto)}
                  className={`flex items-center justify-between px-4 py-2.5 cursor-pointer text-sm transition-colors ${
                    index === selectedIndex
                      ? 'bg-violet-500/30 text-white'
                      : 'text-white/80 hover:bg-white/10'
                  }`}
                >
                  <span className="flex flex-col gap-0.5 min-w-0">
                    <span className="font-medium truncate">{producto.nombre}</span>
                    <span className="text-xs text-white/50 font-mono">
                      {producto.codigo}
                    </span>
                  </span>
                  <span className="ml-4 shrink-0 text-right">
                    <span className="font-semibold text-violet-300">
                      ${producto.precio.toFixed(2)}
                    </span>
                    {WEIGHT_UNITS.has(producto.unidad_medida) && (
                      <span className="ml-1 text-xs text-amber-400/80">
                        /{producto.unidad_medida}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
