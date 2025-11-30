import React, { useState } from 'react';
import { BarChart3, TrendingUp, Users, FileText, BrainCircuit } from 'lucide-react';
import { analyzeInstitutionalData } from '../../services/geminiService';

const DirectorDashboard: React.FC = () => {
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Mock Data Description that would be sent to Gemini
  const schoolDataDescription = `
    Matrícula total: 450 alumnos. 
    Asistencia promedio global: 88%.
    Tasa de aprobación último trimestre: 76%.
    Problemas reportados: Aumento del ausentismo en 5to año (15% de incremento). 
    Bajo rendimiento en Matemáticas en 2do año (promedio 5.5).
    Quejas de padres sobre comunicación institucional: moderadas.
  `;

  const handleRunAnalysis = async () => {
    setLoading(true);
    const result = await analyzeInstitutionalData(schoolDataDescription);
    setAnalysis(result);
    setLoading(false);
  };

  return (
    <div className="space-y-8">
       <div className="flex justify-between items-end">
        <div>
            <h2 className="text-2xl font-bold text-gray-800">Panel Directivo</h2>
            <p className="text-gray-500 text-sm">Vista general estratégica de la institución</p>
        </div>
        <button className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-900">
            Exportar Reporte PDF
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Matrícula Activa</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">450</h3>
                </div>
                <Users className="text-blue-500 w-6 h-6" />
            </div>
            <span className="text-green-500 text-xs font-medium mt-2 inline-block">+2.5% vs año anterior</span>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Asistencia Global</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">88%</h3>
                </div>
                <TrendingUp className="text-green-500 w-6 h-6" />
            </div>
            <span className="text-red-500 text-xs font-medium mt-2 inline-block">-1.2% último mes</span>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Promedio General</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">7.8</h3>
                </div>
                <BarChart3 className="text-purple-500 w-6 h-6" />
            </div>
            <span className="text-gray-400 text-xs font-medium mt-2 inline-block">Estable</span>
        </div>
         <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Licencias Docentes</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">3</h3>
                </div>
                <FileText className="text-orange-500 w-6 h-6" />
            </div>
            <span className="text-gray-400 text-xs font-medium mt-2 inline-block">Activas hoy</span>
        </div>
      </div>

      {/* AI Strategic Analysis */}
      <div className="bg-white rounded-xl shadow-lg border border-purple-100 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-800 to-indigo-900 p-6 text-white">
            <div className="flex items-center mb-2">
                <BrainCircuit className="w-6 h-6 mr-2" />
                <h3 className="text-xl font-bold">Análisis Estratégico IA</h3>
            </div>
            <p className="text-purple-100 text-sm mb-4">
                Genera un resumen ejecutivo basado en los datos métricos actuales de la institución para la toma de decisiones.
            </p>
            <button 
                onClick={handleRunAnalysis}
                disabled={loading}
                className="bg-white text-purple-900 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-100 transition disabled:opacity-70"
            >
                {loading ? 'Analizando datos...' : 'Generar Informe Ejecutivo'}
            </button>
        </div>

        {analysis && (
            <div className="p-8 bg-purple-50">
                <h4 className="text-sm font-bold text-purple-900 uppercase tracking-wide mb-4">Resultado del Análisis</h4>
                <div className="prose prose-purple max-w-none text-gray-800 whitespace-pre-wrap leading-relaxed bg-white p-6 rounded-lg border border-purple-100 shadow-sm">
                    {analysis}
                </div>
            </div>
        )}
        {!analysis && !loading && (
             <div className="p-12 text-center text-gray-400">
                <p>Presiona el botón para iniciar el análisis de los indicadores institucionales.</p>
             </div>
        )}
      </div>
    </div>
  );
};

export default DirectorDashboard;
