import React, { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import axios from 'axios';

interface DragDropUploadProps {
    onUpload: (text: string) => void;
    setLoading: (loading: boolean) => void;
    setJsonData: (data: any) => void;
    hasData: boolean;
}

const API_URL = import.meta.env.VITE_API_URL || 'https://text-to-structured-data.onrender.com';

console.log("Conectando a:", API_URL);

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

const DragDropUpload: React.FC<DragDropUploadProps> = ({ onUpload, setLoading, setJsonData, hasData }) => {
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(e.type === 'dragenter' || e.type === 'dragover');
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (hasData) {
            setError('Por favor, limpia los datos actuales antes de subir otro documento');
            return;
        }
        
        setError(null);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            await processFile(file);
        }
    };

    const handleClick = () => {
        if (hasData) return;
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            await processFile(files[0]);
        }
    };

    const processFile = async (file: File) => {
        setLoading(true);
        setError(null);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post(`${API_URL}api/process`, formData, {
                timeout: 60000, // 60 segundos para dar tiempo al servidor de despertar
            });
            
            if (response.data.error) {
                setError(response.data.error);
            } else {
                onUpload(response.data.raw_text);
                
                // ✅ CORRECCIÓN: Convertir objeto con índices numéricos a array real
                const rawData = response.data.structured_data;
                const structuredData = convertToArray(rawData);
                
                console.log('📊 Datos recibidos:', {
                    tipo_original: Array.isArray(rawData) ? 'array' : 'objeto',
                    raw: rawData,
                    convertido_a: 'array',
                    registros: structuredData.length,
                    datos: structuredData
                });
                
                setJsonData(structuredData); // Siempre guardar como array
            }
        } catch (error: any) {
            console.error('Error processing file:', error);
            console.error('Error response:', error.response);
            console.error('Error data:', error.response?.data);
            
            let errorMessage = 'Error al procesar el archivo';
            
            if (error.code === 'ECONNABORTED') {
                errorMessage = 'El servidor tardó demasiado en responder. Por favor, intenta nuevamente.';
            } else if (error.response) {
                // Primero intentar obtener el mensaje de error del backend
                const backendError = error.response?.data?.error || error.response?.data?.detail || error.response?.data?.message;
                
                if (backendError) {
                    errorMessage = backendError;
                } else if (error.response?.status === 500) {
                    errorMessage = 'Error interno del servidor. Revisa la consola del navegador para más detalles.';
                } else if (error.response?.status === 400) {
                    errorMessage = 'Documento inválido o no soportado.';
                }
            } else if (!error.response) {
                errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.docx,.xlsx,.pdf"
                onChange={handleFileChange}
                className="hidden"
            />
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={handleClick}
                className={`border-2 border-dashed rounded-lg p-12 text-center transition ${
                    hasData 
                        ? 'border-gray-700 bg-gray-800/50 cursor-not-allowed opacity-50' 
                        : dragActive 
                            ? 'border-blue-500 bg-blue-900/20 cursor-pointer' 
                            : 'border-gray-600 hover:border-gray-500 cursor-pointer'
                }`}
            >
                <Upload className="mx-auto mb-4" size={48} />
                <p className="text-xl font-semibold mb-2">
                    {hasData ? 'Limpia los datos para subir otro documento' : 'Arrastra archivos aquí o haz click'}
                </p>
                <p className="text-gray-400">Soporta: PDF, TXT, DOCX, XLSX</p>
            </div>
            {error && (
                <div className="mt-4 p-4 bg-red-900/30 border border-red-700 rounded-lg">
                    <p className="text-red-400 text-sm">{error}</p>
                </div>
            )}
        </div>
    );
};

export default DragDropUpload;