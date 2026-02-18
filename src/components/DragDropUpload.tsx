import React, { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import axios from 'axios';

interface DragDropUploadProps {
    onUpload: (text: string) => void;
    setLoading: (loading: boolean) => void;
    setJsonData: (data: any) => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'https://text-to-structured-data.onrender.com';

console.log("Conectando a:", API_URL);

const DragDropUpload: React.FC<DragDropUploadProps> = ({ onUpload, setLoading, setJsonData }) => {
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
        setError(null);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            await processFile(file);
        }
    };

    const handleClick = () => {
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
                setJsonData(response.data.structured_data);
            }
        } catch (error: any) {
            console.error('Error processing file:', error);
            
            let errorMessage = 'Error al procesar el archivo';
            
            if (error.code === 'ECONNABORTED') {
                errorMessage = 'El servidor tardó demasiado en responder. Por favor, intenta nuevamente.';
            } else if (error.response?.status === 500) {
                errorMessage = error.response?.data?.error || 'El servidor está iniciando (Render free tier). Por favor, espera 30 segundos e intenta de nuevo.';
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
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
                className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition ${
                    dragActive ? 'border-blue-500 bg-blue-900/20' : 'border-gray-600 hover:border-gray-500'
                }`}
            >
                <Upload className="mx-auto mb-4" size={48} />
                <p className="text-xl font-semibold mb-2">Arrastra archivos aquí o haz click</p>
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