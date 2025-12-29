import React, { useState, useCallback, useMemo, useRef } from 'react';
import { FileUp, Eye, Printer, Trash2, ClipboardCheck, Package, FileText, Layers, AlertCircle, X, CheckCircle2 } from 'lucide-react';
import { NFData, LabelData } from './types';
import { parseNFeXML } from './utils/xmlParser';
import Label from './components/Label';
import { formatQuantity } from './utils/formatters';
import { createRoot } from 'react-dom/client';

const App: React.FC = () => {
  const [nfs, setNfs] = useState<NFData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewing, setViewing] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    setIsLoading(true);
    const files: File[] = Array.from(e.target.files);
    const parsedNfs: NFData[] = [];

    for (const file of files) {
      try {
        const data = await parseNFeXML(file);
        parsedNfs.push(data);
      } catch (err) {
        console.error("Erro ao processar arquivo:", file.name, err);
      }
    }

    setNfs(prev => [...prev, ...parsedNfs]);
    setIsLoading(false);
  };

  const labels = useMemo(() => {
    const allLabels: LabelData[] = [];
    nfs.forEach(nf => {
      let currentVol = 0;
      const quantities = nf.itens.map(it => parseInt(formatQuantity(it.qCom)) || 1);
      const sumQuantities = quantities.reduce((a, b) => a + b, 0);
      
      let distribution: number[] = [];
      if (sumQuantities === nf.volumesTotais) {
        distribution = [...quantities];
      } else {
        distribution = nf.itens.map((_, idx) =>
          Math.round((nf.volumesTotais / nf.itens.length) * (idx + 1)) - Math.round((nf.volumesTotais / nf.itens.length) * idx)
        );
      }

      nf.itens.forEach((item, itemIdx) => {
        const labelsForItem = distribution[itemIdx] || 1;
        for (let i = 1; i <= labelsForItem; i++) {
          currentVol++;
          allLabels.push({
            ...nf,
            itemIndex: itemIdx,
            subItemIndex: i,
            volumeAtual: currentVol,
            volumeNoItem: i,
            totalNoItem: labelsForItem
          });
        }
      });
    });
    return allLabels;
  }, [nfs]);

  const handlePrint = useCallback(() => {
    const printContainer = document.getElementById('print-section');
    if (!printContainer) return;

    // Clear previous prints
    printContainer.innerHTML = '';
    
    // Create a new container for print content
    const printContent = document.createElement('div');
    printContent.style.width = '100%';
    printContent.style.height = '100%';
    printContent.style.position = 'relative';
    
    // Create a root for the print content
    const root = createRoot(printContainer);
    
    // Render labels with proper print classes
    const labelsHtml = (
      <div style={{ 
        width: '100%', 
        height: '100%',
        position: 'relative'
      }}>
        {labels.map((label, idx) => (
          <div 
            key={`${label.id}-${idx}`} 
            className="print-page"
            style={{
              pageBreakAfter: idx === labels.length - 1 ? 'auto' : 'always',
              breakAfter: idx === labels.length - 1 ? 'auto' : 'page',
              width: '100mm',
              height: '70mm',
              margin: 0,
              padding: '2mm 3mm',
              boxSizing: 'border-box'
            }}
          >
            <Label data={label} isPrinting={true} />
          </div>
        ))}
      </div>
    );

    root.render(labelsHtml);

    // Give time for barcodes to render before opening print dialog
    setTimeout(() => {
      // Force a reflow to ensure all elements are properly rendered
      void printContainer.offsetHeight;
      
      // Open print dialog
      window.print();
      
      // Optional: Clean up after print dialog closes
      // setTimeout(() => {
      //   root.unmount();
      // }, 1000);
    }, 1000);
  }, [labels]);

  const confirmClearData = () => {
    setNfs([]);
    setViewing(false);
    setShowConfirmClear(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-900 font-sans">
      <div className="max-w-[1600px] mx-auto px-4 py-6 md:p-8 space-y-6">
        
        {/* Header - Industrial Modern Branding */}
        <header className="flex flex-col lg:flex-row items-center justify-between gap-6 glass-effect p-4 md:p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-white">
          <div className="flex items-center gap-5 w-full lg:w-auto">
            <div className="bg-slate-900 p-3.5 rounded-2xl shadow-lg shadow-slate-200 flex-shrink-0">
              <Layers className="text-emerald-400 w-8 h-8" />
            </div>
            <div className="truncate">
              <h1 className="text-2xl md:text-3xl font-[950] tracking-tight text-slate-800 leading-none mb-1">
                Intermarítima
              </h1>
              <p className="text-emerald-600 font-extrabold text-[11px] uppercase tracking-[0.2em]">ETIQUETAS DE DISTRIBUIÇÃO</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:flex md:flex-row items-center gap-3 w-full lg:w-auto">
            <label className="flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold cursor-pointer transition-all active:scale-95 shadow-lg shadow-emerald-200 text-sm">
              <FileUp size={20} />
              <span>Importar XML</span>
              <input 
                ref={fileInputRef}
                type="file" 
                multiple 
                accept=".xml" 
                className="hidden" 
                onChange={handleFileChange} 
              />
            </label>
            
            <button 
              disabled={nfs.length === 0}
              onClick={() => setViewing(!viewing)}
              className={`flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl font-bold transition-all text-sm
                ${viewing 
                  ? 'bg-white text-emerald-600 ring-2 ring-emerald-500 shadow-lg' 
                  : 'bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-500 text-slate-600 shadow-sm'}
                disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              <Eye size={20} className={viewing ? 'line-through' : ''} />
              <span>{viewing ? 'Ocultar' : 'Pré-visualizar'}</span>
            </button>

            <button 
              disabled={!viewing || labels.length === 0}
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-black text-white rounded-2xl font-bold transition-all disabled:opacity-20 disabled:cursor-not-allowed text-sm shadow-xl shadow-slate-300"
            >
              <Printer size={20} />
              <span>Imprimir</span>
            </button>

            <button 
              disabled={nfs.length === 0}
              onClick={() => setShowConfirmClear(true)}
              className="flex items-center justify-center gap-2 p-3.5 bg-red-50 hover:bg-red-500 hover:text-white text-red-500 rounded-2xl font-bold transition-all disabled:opacity-20 disabled:cursor-not-allowed text-sm group"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sidebar - Conference Panel */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-6 flex flex-col h-[600px] lg:h-[calc(100vh-180px)]">
              <div className="flex items-center justify-between mb-8 shrink-0">
                <div>
                  <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                    <CheckCircle2 className="text-emerald-500" size={24} />
                    Conferência
                  </h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Status do Processamento</p>
                </div>
                <div className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider border border-emerald-100">
                  {nfs.length} {nfs.length === 1 ? 'Nota' : 'Notas'}
                </div>
              </div>

              <div className="space-y-4 flex-grow overflow-y-auto pr-3 custom-scrollbar">
                {nfs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-300 space-y-6">
                    <div className="bg-slate-50 p-10 rounded-[3rem] border-2 border-dashed border-slate-200">
                      <FileText size={48} className="opacity-30" />
                    </div>
                    <div className="text-center px-6">
                      <p className="font-bold text-slate-400 text-sm">Nenhum documento carregado.</p>
                      <p className="text-xs text-slate-300 mt-2">Arraste seus XMLs ou use o botão de importar no topo.</p>
                    </div>
                  </div>
                ) : (
                  nfs.map((nf) => (
                    <div key={nf.id} className="bg-slate-50 border border-slate-200 p-5 rounded-3xl group hover:border-emerald-300 hover:bg-white hover:shadow-xl transition-all duration-500 ease-out">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-1 block">Documento Fiscal</span>
                          <p className="text-lg font-[900] text-slate-800 tracking-tighter">NF-e #{nf.nNF}</p>
                        </div>
                        <span className="bg-slate-800 text-white text-[10px] px-3 py-1 rounded-xl font-black shadow-sm">
                          {nf.volumesTotais} VOL
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0"></div>
                          <p className="text-xs font-bold text-slate-600 leading-snug line-clamp-2">{nf.destNome}</p>
                        </div>
                        <p className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md inline-block uppercase tracking-wider">{nf.cidadeUF}</p>
                      </div>

                      <div className="mt-5 pt-4 border-t border-slate-200 space-y-2.5">
                        {nf.itens.slice(0, 2).map((item, i) => (
                          <div key={i} className="text-[10px] flex justify-between items-center bg-white p-2 rounded-xl border border-slate-100 shadow-sm">
                            <span className="text-slate-500 truncate font-bold w-[70%]">
                              <span className="text-slate-800 font-black">{item.cProd}</span> · {item.xProd}
                            </span>
                            <span className="font-black text-emerald-600 shrink-0">QTD {formatQuantity(item.qCom)}</span>
                          </div>
                        ))}
                        {nf.itens.length > 2 && (
                          <p className="text-[10px] text-center font-black text-slate-400 py-1">+ {nf.itens.length - 2} itens ocultos</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Stats Bar */}
              <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 gap-4 shrink-0">
                 <div className="bg-slate-900 p-5 rounded-[1.5rem] shadow-lg shadow-slate-200">
                   <p className="text-[10px] font-black text-slate-400 mb-1 uppercase tracking-[0.15em]">Processadas</p>
                   <p className="text-2xl font-[1000] text-white leading-none">{nfs.length}</p>
                 </div>
                 <div className="bg-emerald-50 p-5 rounded-[1.5rem] border border-emerald-100 shadow-inner">
                   <p className="text-[10px] font-black text-emerald-600 mb-1 uppercase tracking-[0.15em]">Total Etiquetas</p>
                   <p className="text-2xl font-[1000] text-emerald-800 leading-none">{labels.length}</p>
                 </div>
              </div>
            </div>
          </aside>

          {/* Main Viewer Area */}
          <section className="lg:col-span-8">
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-200 p-4 md:p-10 min-h-[600px] lg:min-h-[calc(100vh-180px)] flex flex-col items-center">
              {!viewing ? (
                <div className="m-auto flex flex-col items-center space-y-10 text-slate-300 max-w-md text-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-400/10 blur-[100px] rounded-full"></div>
                    <div className="relative bg-white p-14 rounded-[4rem] shadow-2xl ring-1 ring-slate-100 border-4 border-slate-50">
                      <Package size={80} className="text-emerald-500/40" />
                    </div>
                  </div>
                  <div className="space-y-4 text-center transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
                    {nfs.length > 0 && !viewing ? (
                      <div className="animate-fade-in">
                        <h3 className="text-2xl font-[1000] text-slate-800 tracking-tight transition-opacity duration-300">Fluxo de Impressão Pronto</h3>
                        <p className="font-medium text-slate-400 text-base leading-relaxed transition-opacity duration-300">
                          Seus dados foram processados com sucesso. Clique em <strong className="text-emerald-500 uppercase tracking-wider">Pré-visualizar</strong> para conferir as etiquetas antes da impressão térmica.
                        </p>
                      </div>
                    ) : (
                      <div className="animate-fade-in">
                        <h3 className="text-2xl font-[1000] text-slate-800 tracking-tight transition-opacity duration-300">Pronto para gerar?</h3>
                        <p className="font-medium text-slate-400 text-base leading-relaxed max-w-md mx-auto transition-opacity duration-300">
                          Importe seus arquivos XML e clique em <strong className="text-emerald-500 uppercase tracking-wider">Pré-visualizar</strong> para ver as etiquetas 10x7cm.
                        </p>
                      </div>
                    )}
                  </div>
                  <style jsx global>{`
                    @keyframes fadeIn {
                      from { opacity: 0; transform: translateY(3px); }
                      to { opacity: 1; transform: translateY(0); }
                    }
                    .animate-fade-in {
                      animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    }
                  `}</style>
                </div>
              ) : (
                <div className="w-full">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-12 pb-8 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse"></div>
                      <div>
                        <h3 className="font-black text-slate-800 text-xl tracking-tighter">Prévia de Etiquetas</h3>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Simulação de papel térmico 100x70mm</p>
                      </div>
                    </div>
                    <div className="bg-slate-900 px-6 py-2 rounded-2xl text-xs font-[900] text-white uppercase tracking-[0.2em] shadow-lg">
                      {labels.length} UNIDADES GERADAS
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center gap-12 pb-20 w-full max-w-4xl mx-auto px-4">
                    {labels.map((label, idx) => (
                      <div 
                        key={`${label.id}-${idx}`} 
                        className="w-full max-w-[500px] mx-auto transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2 cursor-zoom-in"
                      >
                        <Label data={label} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
          <div className="bg-white p-12 rounded-[4rem] shadow-2xl flex flex-col items-center space-y-8 max-w-xs w-full animate-in fade-in zoom-in duration-300">
            <div className="relative">
              <div className="w-20 h-20 border-[8px] border-emerald-50 border-t-emerald-500 rounded-full animate-spin shadow-inner"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_10px_#10B981]"></div>
              </div>
            </div>
            <div className="text-center">
              <p className="font-black text-slate-800 text-xl tracking-tight">Processando XML</p>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Mapeando distribuição...</p>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmClear && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-[0_30px_60px_rgba(0,0,0,0.3)] p-10 flex flex-col items-center text-center animate-in zoom-in-95 duration-300 relative">
            <div className="bg-red-50 p-6 rounded-full mb-8">
              <AlertCircle size={48} className="text-red-500" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-4 tracking-tight">Limpar Sessão?</h3>
            <p className="text-slate-500 font-medium mb-10 leading-relaxed text-sm">
              Todos os dados importados e o histórico de etiquetas geradas nesta sessão serão removidos permanentemente.
            </p>
            <div className="grid grid-cols-2 gap-4 w-full">
              <button 
                onClick={() => setShowConfirmClear(false)}
                className="px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black transition-all text-sm uppercase tracking-widest"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmClearData}
                className="px-6 py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black transition-all shadow-xl shadow-red-100 text-sm uppercase tracking-widest"
              >
                Limpar Agora
              </button>
            </div>
            <button 
              onClick={() => setShowConfirmClear(false)}
              className="absolute top-8 right-8 p-2 text-slate-300 hover:text-slate-500 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
