import React, { useState, useEffect } from 'react';
import { Edit2, Save, X } from 'lucide-react';
import SaveButton from './SaveButton';
import axios from 'axios';

interface JsonEditorProps {
  jsonData: any;
  onSave?: (data: any) => void;
  onClear?: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'https://text-to-structured-data.onrender.com';

const JsonEditor: React.FC<JsonEditorProps> = ({ jsonData, onSave, onClear }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<any>(jsonData);
  const [jsonString, setJsonString] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Función para filtrar campos internos que no deben mostrarse
  const filterInternalFields = (data: any) => {
    if (!data) return data;
    const { db_id, ...rest } = data;
    return rest;
  };

  useEffect(() => {
    const filteredData = filterInternalFields(jsonData);
    setEditedData(filteredData);
    setJsonString(JSON.stringify(filteredData, null, 2));
  }, [jsonData]);

  const handleEdit = () => {
    setIsEditing(true);
    setJsonString(JSON.stringify(editedData, null, 2));
    setError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData(jsonData);
    setJsonString(JSON.stringify(jsonData, null, 2));
    setError(null);
  };

  const handleJsonChange = (value: string) => {
    setJsonString(value);
    try {
      const parsed = JSON.parse(value);
      setEditedData(parsed);
      setError(null);
    } catch (e) {
      setError('JSON inválido. Verifica la sintaxis.');
    }
  };

  const handleSaveToDatabase = async () => {
    if (error) {
      return;
    }

    setSaving(true);
    setSaveSuccess(false);

    try {
      const response = await axios.post(`${API_URL}api/save`, {
        data: editedData
      });

      if (response.data.success) {
        setSaveSuccess(true);
        setIsEditing(false);
        
        // Mostrar mensaje de éxito y limpiar vista después de 2 segundos
        setTimeout(() => {
          setSaveSuccess(false);
          if (onClear) {
            onClear();
          }
        }, 2000);
      }
    } catch (err: any) {
      console.error('Error saving to database:', err);
      setError(err.response?.data?.error || 'Error al guardar en la base de datos');
    } finally {
      setSaving(false);
    }
  };

  const handleApplyChanges = () => {
    if (!error) {
      setIsEditing(false);
      if (onSave) {
        onSave(editedData);
      }
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Datos Estructurados (JSON)</h3>
        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
              >
                <Edit2 size={16} />
                Editar
              </button>
              <SaveButton 
                onClick={handleSaveToDatabase} 
                disabled={saving || !editedData}
                text={saving ? 'Guardando...' : 'Guardar en BD'}
              />
            </>
          ) : (
            <>
              <button
                onClick={handleApplyChanges}
                disabled={!!error}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition"
              >
                <Save size={16} />
                Aplicar
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
              >
                <X size={16} />
                Cancelar
              </button>
            </>
          )}
        </div>
      </div>

      {saveSuccess && (
        <div className="mb-4 p-4 bg-green-900/30 border border-green-700 rounded-lg">
          <p className="text-green-400 text-sm">✓ Guardado exitosamente en la base de datos</p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-900/30 border border-red-700 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {isEditing ? (
        <textarea
          value={jsonString}
          onChange={(e) => handleJsonChange(e.target.value)}
          className="w-full h-96 bg-gray-900 text-gray-100 font-mono text-sm p-4 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
          spellCheck={false}
        />
      ) : (
        <pre className="bg-gray-900 p-4 rounded-lg overflow-auto max-h-96 text-sm">
          <code className="text-green-400">{JSON.stringify(editedData, null, 2)}</code>
        </pre>
      )}

      <div className="mt-4 flex gap-2 text-xs text-gray-400">
        <span>Cliente: <strong className="text-white">{editedData?.cliente || 'N/A'}</strong></span>
        <span>•</span>
        <span>Tipo: <strong className="text-white">{editedData?.tipo_solicitud || 'N/A'}</strong></span>
        <span>•</span>
        <span>Fecha: <strong className="text-white">{editedData?.fecha || 'N/A'}</strong></span>
      </div>
    </div>
  );
};

export default JsonEditor;
