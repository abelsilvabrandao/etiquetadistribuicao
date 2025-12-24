import React, { useEffect, useRef } from 'react';

interface BarcodeProps {
  value: string;
  id: string;
}

const Barcode: React.FC<BarcodeProps> = ({ value, id }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current) {
      try {
        // @ts-ignore
        window.JsBarcode(svgRef.current, value, {
          format: "CODE128",
          width: 1.6,
          height: 35, // Altura reduzida de 40 para 35 para economizar espaço vertical
          displayValue: false,
          margin: 0,
          background: "transparent"
        });
      } catch (e) {
        console.error("Erro ao gerar código de barras", e);
      }
    }
  }, [value]);

  return <svg ref={svgRef} id={id} className="max-w-full h-full"></svg>;
};

export default Barcode;