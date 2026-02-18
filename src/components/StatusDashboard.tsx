import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface StatusDashboardProps {
    data: any;
}

// ✅ Función para convertir objeto con índices numéricos a array
const convertToArray = (data: any): any[] => {
  if (!data) return [];
  
  // Si ya es array, retornarlo
  if (Array.isArray(data)) {
    return data;
  }
  
  // Si es un objeto con claves numéricas (ej: {"0": {...}, "1": {...}})
  if (typeof data === 'object') {
    const keys = Object.keys(data);
    
    // Verificar si todas las claves son números consecutivos
    const isIndexedObject = keys.every((key, index) => key === String(index));
    
    if (isIndexedObject && keys.length > 0) {
      // Convertir a array manteniendo el orden
      return keys.map(key => data[key]);
    }
    
    // Si es un objeto único (sin índices numéricos), convertir a array de un elemento
    return [data];
  }
  
  return [data];
};

const StatusDashboard: React.FC<StatusDashboardProps> = ({ data }) => {
    // ✅ CORRECCIÓN: Convertir a array primero
    const arrayData = convertToArray(data);
    const displayData = arrayData.length > 0 ? arrayData[0] : null;
    const recordCount = arrayData.length;
    
    if (!displayData) {
        return (
            <div className="bg-gray-800 rounded-lg p-6 flex items-center justify-center min-h-64">
                <AlertCircle className="mr-3" size={24} />
                <p className="text-gray-400">Carga un archivo para ver el estado</p>
            </div>
        );
    }

    // Formatear el cliente mostrando si hay más registros
    const clienteDisplay = recordCount > 1 
        ? `${displayData.cliente} (+${recordCount - 1} más)` 
        : displayData.cliente || 'N/A';
    
    // Formatear monto con separador de miles
    const montoDisplay = displayData.monto 
        ? `$${Number(displayData.monto).toLocaleString('es-MX')}` 
        : '$0';

    return (
        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
            <div className="flex items-center mb-6">
                <CheckCircle size={24} className="mr-2 text-green-500" />
                <h3 className="text-xl font-bold">Estado del Procesamiento</h3>
                {recordCount > 1 && (
                    <span className="ml-auto text-sm bg-blue-600 px-3 py-1 rounded-full">
                        {recordCount} registros
                    </span>
                )}
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-900 rounded">
                <span className="text-gray-400">Cliente</span>
                <span className="font-semibold text-blue-400">{clienteDisplay}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-900 rounded">
                <span className="text-gray-400">Monto</span>
                <span className="font-semibold text-green-400">{montoDisplay}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-900 rounded">
                <span className="text-gray-400">Tipo de Solicitud</span>
                <span className="font-semibold text-purple-400">{displayData.tipo_solicitud || 'N/A'}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-900 rounded">
                <span className="text-gray-400">Fecha</span>
                <span className="font-semibold text-yellow-400">{displayData.fecha || 'N/A'}</span>
            </div>
        </div>
    );
};

export default StatusDashboard;