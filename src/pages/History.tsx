import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, Search, FileText, DollarSign, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HistoryRecord {
  id: number;
  cliente: string;
  monto?: number;
  fecha: string;
  tipo_solicitud: string;
  created_at: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'https://text-to-structured-data.onrender.com';

const History: React.FC = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}api/history`);
      setRecords(response.data.records || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter((record) => {
    const matchesSearch = record.cliente.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || record.tipo_solicitud === filterType;
    return matchesSearch && matchesType;
  });

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'factura':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'cotizacion':
      case 'cotización':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'queja':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'venta':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
            >
              <ArrowLeft size={20} />
              Volver
            </button>
            <h1 className="text-4xl font-bold">Historial de Registros</h1>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="all">Todos los tipos</option>
            <option value="Factura">Factura</option>
            <option value="Cotización">Cotización</option>
            <option value="Queja">Queja</option>
            <option value="Venta">Venta</option>
          </select>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">Cargando registros...</p>
          </div>
        )}

        {/* Records Table */}
        {!loading && filteredRecords.length > 0 && (
          <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900 border-b border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Cliente</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Tipo</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Fecha</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Monto</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Registrado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-700/50 transition">
                      <td className="px-6 py-4 text-sm text-gray-400">#{record.id}</td>
                      <td className="px-6 py-4 text-sm font-medium">{record.cliente}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(record.tipo_solicitud)}`}>
                          <FileText size={14} />
                          {record.tipo_solicitud}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          {record.fecha}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {record.monto ? (
                          <div className="flex items-center gap-1 text-green-400">
                            <DollarSign size={14} />
                            {record.monto.toLocaleString()}
                          </div>
                        ) : (
                          <span className="text-gray-500">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(record.created_at).toLocaleDateString('es-MX', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredRecords.length === 0 && (
          <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
            <FileText size={64} className="mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-semibold mb-2 text-gray-400">No hay registros</h3>
            <p className="text-gray-500">
              {searchTerm || filterType !== 'all'
                ? 'No se encontraron registros con los filtros aplicados.'
                : 'Aún no se han guardado registros en la base de datos.'}
            </p>
          </div>
        )}

        {/* Stats */}
        {!loading && records.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <p className="text-gray-400 text-sm">Total de registros</p>
              <p className="text-2xl font-bold">{records.length}</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <p className="text-gray-400 text-sm">Filtrados</p>
              <p className="text-2xl font-bold">{filteredRecords.length}</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <p className="text-gray-400 text-sm">Monto total</p>
              <p className="text-2xl font-bold text-green-400">
                ${records.reduce((sum, r) => sum + (r.monto || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
