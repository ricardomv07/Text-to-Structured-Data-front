import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface StatusDashboardProps {
    data: any;
}

const StatusDashboard: React.FC<StatusDashboardProps> = ({ data }) => {
    // ✅ CORRECCIÓN: Manejar tanto arrays como objetos
    let displayData = null;
    let recordCount = 0;
    
    if (Array.isArray(data)) {
        // Si es array, usar el primer registro
        if (data.length > 0) {
            displayData = data[0];
            recordCount = data.length;
        }
    } else if (data) {
        // Si es objeto único, usarlo directamente
        displayData = data;
        recordCount = 1;
    }
    
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