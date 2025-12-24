import React from 'react';
import { LabelData } from '../types';
import Barcode from './Barcode';
import { formatProduto } from '../utils/formatters';

interface LabelProps {
  data: LabelData;
  isPrinting?: boolean;
}

const Label: React.FC<LabelProps> = ({ data, isPrinting = false }) => {
  const logoUrl = "https://images.seeklogo.com/logo-png/40/2/idemitsu-kosan-logo-png_seeklogo-409801.png";
  const item = data.itens[data.itemIndex];
  const prodCode = item.cProd;
  const prodDesc = formatProduto(item.xProd);
  const barcodeValue = `${prodCode}-${item.xPed}`;

  return (
    <div 
      className={`
        bg-white flex flex-col overflow-hidden text-black leading-tight
        ${isPrinting 
          ? 'w-[100mm] h-[70mm] p-2 rounded-none' 
          : 'w-full max-w-[500px] aspect-[10/7] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-xl mb-4 border border-slate-200 relative'}
      `}
      style={{ boxSizing: 'border-box', fontFamily: 'Arial, sans-serif' }}
    >
      {!isPrinting && (
        <div className="absolute top-2 right-2">
          {/* Removed "Prévia Térmica 10x7" text */}
        </div>
      )}

      {/* Top Section */}
      <div className="flex items-start gap-3 mb-1">
        <div className="w-[100px] sm:w-[110px] flex-shrink-0 pt-0.5">
          <img 
            src={logoUrl} 
            alt="Idemitsu" 
            className="w-full h-auto object-contain"
          />
        </div>
        
        <div className="flex flex-col flex-grow items-center justify-center">
          <div className="w-full text-center mb-0.5">
            <span className="inline-block text-[11px] sm:text-[15px] font-black uppercase leading-none whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
              {data.emitente || "IDEMITSU LUBE SOUTH AMERICA LTDA"}
            </span>
          </div>
          
          <div className="w-full flex justify-center h-[38px] overflow-hidden">
            <Barcode id={`bc-${data.id}-${data.volumeAtual}`} value={barcodeValue} />
          </div>
          
          <p className="text-[10px] sm:text-[11px] font-black mt-0.5 tracking-tight text-center w-full">
            {prodCode} - ITEM {data.volumeNoItem} DE {data.totalNoItem}
          </p>
        </div>
      </div>

      {/* Data Grid */}
      <div className="grid grid-cols-[75px_1fr] sm:grid-cols-[90px_1fr] gap-x-1.5 gap-y-[1px] text-[12px] sm:text-[13px] pt-0.5 pl-1">
        <div className="font-black uppercase text-[10px]">DESTINAT.</div>
        <div className="font-bold truncate text-[11px]">{data.destNome}</div>
        
        <div className="font-black uppercase text-[10px]">ENDEREÇO</div>
        <div className="font-bold text-[11px] leading-tight whitespace-normal break-words">
          {data.endereco}
        </div>
        
        <div className="font-black uppercase text-[10px]">BAIRRO</div>
        <div className="font-bold text-[11px]">{data.bairro}</div>
        
        <div className="font-black uppercase text-[10px] self-center">CIDADE</div>
        <div className="font-black text-[15px] sm:text-[17px] uppercase leading-tight break-words">
          {data.cidadeUF}
        </div>
        
        <div className="font-black uppercase text-[10px] mt-0.5">PRODUTO</div>
        <div className="font-bold text-[10px] leading-[1.1] mt-0.5">
          {prodCode} - {prodDesc}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto flex justify-between items-end pt-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[14px] sm:text-[18px] font-black uppercase">NF</span>
          <span className="text-[20px] sm:text-[28px] font-black leading-none">{data.nNF}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[14px] sm:text-[18px] font-black uppercase">VOL</span>
          <span className="text-[20px] sm:text-[28px] font-black leading-none">
            {data.volumeAtual}/{data.volumesTotais}
          </span>
        </div>
      </div>

      {/* Operator Note */}
      <div className="text-[8px] text-center mt-1 font-bold italic uppercase tracking-wider pt-0.5">
        OPERADOR LOGÍSTICO: INTERMARÍTIMA PORTOS E LOGÍSTICA S.A.
      </div>
    </div>
  );
};

export default Label;