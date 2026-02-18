import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { History as HistoryIcon, Trash2 } from 'lucide-react';
import DragDropUpload from '../components/DragDropUpload';
import ProcessViewer from '../components/ProcessViewer';
import StatusDashboard from '../components/StatusDashboard';
import Loader from '../components/Loader';
import JsonEditor from '../components/JsonEditor';

const Home: React.FC = () => {
    const navigate = useNavigate();
    const [rawText, setRawText] = useState<string>('');
    const [jsonData, setJsonData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const handleClearView = () => {
        setRawText('');
        setJsonData(null);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold">Text to Structured Data</h1>
                    <div className="flex gap-3">
                        {(rawText || jsonData) && (
                            <button
                                onClick={handleClearView}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
                            >
                                <Trash2 size={20} />
                                Limpiar
                            </button>
                        )}
                        <button
                            onClick={() => navigate('/historial')}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                        >
                            <HistoryIcon size={20} />
                            Ver Historial
                        </button>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <DragDropUpload 
                        onUpload={setRawText} 
                        setLoading={setLoading} 
                        setJsonData={setJsonData} 
                        hasData={!!jsonData || !!rawText}
                    />
                    <StatusDashboard data={jsonData} />
                </div>

                {loading && (
                    <div className="flex flex-col items-center justify-center mt-8 space-y-4">
                        <Loader />
                        <p className="text-gray-400 text-lg">Procesando archivo...</p>
                        <p className="text-gray-500 text-sm">Si es la primera petición, el servidor puede tardar hasta 30 segundos en despertar</p>
                    </div>
                )}

                {!loading && rawText && jsonData && (
                    <div className="space-y-8">
                        <JsonEditor jsonData={jsonData} onSave={setJsonData} onClear={handleClearView} />
                        <ProcessViewer rawText={rawText} jsonData={jsonData} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;