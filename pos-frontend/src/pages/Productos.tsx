import { useState, useMemo } from 'react'
import { AppLayout } from '../components/layout/AppLayout'
import { Table } from '../components/ui/Table'
import { Pagination } from '../components/ui/Pagination'
import { useProductos } from '../hooks/useProductos'
import type { Producto } from '../types/producto.types'

const LIMIT = 10

const CATEGORIAS = [
  'Todas',
  'Electrónica',
  'Ropa',
  'Alimentos',
  'Hogar',
  'Deportes',
  'Juguetes',
  'Otros',
]

export function Productos() {
  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState('')
  const [page, setPage] = useState(1)

  // Filtro de categoría para la API (vacío = todas)
  const apiCategoria = categoria === 'Todas' || categoria === '' ? undefined : categoria

  const { data: productos = [], isLoading } = useProductos({
    categoria: apiCategoria,
    page,
    limit: LIMIT,
  })

  // Filtro local por nombre
  const productosFiltrados = useMemo(() => {
    if (!busqueda.trim()) return productos
    const q = busqueda.toLowerCase()
    return productos.filter((p) => p.nombre.toLowerCase().includes(q))
  }, [productos, busqueda])

  const totalPages = Math.max(1, Math.ceil(productosFiltrados.length / LIMIT))
  const paginados = productosFiltrados.slice((page - 1) * LIMIT, page * LIMIT)

  const handleCategoriaChange = (cat: string) => {
    setCategoria(cat)
    setPage(1)
  }

  const handleBusqueda = (value: string) => {
    setBusqueda(value)
    setPage(1)
  }

  const columns = [
    { key: 'nombre',       header: 'Nombre' },
    { key: 'categoria',    header: 'Categoría',
      render: (p: Producto) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
          {p.categoria}
        </span>
      ),
    },
    { key: 'precio',       header: 'Precio',
      render: (p: Producto) => (
        <span className="font-medium text-gray-900">
          ${p.precio.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    { key: 'stock',        header: 'Stock',
      render: (p: Producto) => (
        <span className={`font-medium ${p.stock < 5 ? 'text-red-600' : 'text-gray-700'}`}>
          {p.stock}
          {p.stock < 5 && (
            <span className="ml-1.5 text-xs text-red-500">⚠ bajo</span>
          )}
        </span>
      ),
    },
    { key: 'fechaCreacion', header: 'Creado',
      render: (p: Producto) => (
        <span className="text-gray-400 text-xs">
          {new Date(p.fechaCreacion).toLocaleDateString('es-CO')}
        </span>
      ),
    },
  ]

  return (
    <AppLayout title="Productos">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* Búsqueda */}
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={busqueda}
            onChange={(e) => handleBusqueda(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-sm border border-gray-300 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              hover:border-gray-400 transition-colors"
          />
        </div>

        {/* Filtro categoría */}
        <select
          value={categoria}
          onChange={(e) => handleCategoriaChange(e.target.value)}
          className="px-3.5 py-2 text-sm border border-gray-300 rounded-lg bg-white
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            hover:border-gray-400 transition-colors"
        >
          {CATEGORIAS.map((cat) => (
            <option key={cat} value={cat === 'Todas' ? '' : cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Botón nuevo producto (placeholder para FE-3) */}
        <button
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700
            text-white text-sm font-medium rounded-lg transition-colors ml-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo producto
        </button>
      </div>

      {/* Tabla */}
      <Table
        columns={columns}
        data={paginados}
        keyExtractor={(p) => p.id}
        loading={isLoading}
        emptyMessage="No se encontraron productos"
      />

      {/* Paginación */}
      {!isLoading && productosFiltrados.length > 0 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          total={productosFiltrados.length}
          limit={LIMIT}
          onPageChange={setPage}
        />
      )}
    </AppLayout>
  )
}
