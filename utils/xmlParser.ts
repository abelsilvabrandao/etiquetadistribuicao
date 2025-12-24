
import { NFData, ProductItem } from '../types';
// Removed formatCidade which was not exported from formatters.ts
import { formatDestinatario, formatEndereco } from './formatters';

export const parseNFeXML = async (file: File): Promise<NFData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, 'text/xml');

        const get = (tag: string, parent: Element | Document = xml) => {
          const el = parent.getElementsByTagName(tag)[0];
          return el ? el.textContent || '' : '';
        };

        const emitente = get('xNome');
        const cnpjEmitente = get('CNPJ');
        const nNF = get('nNF');

        const dest = xml.getElementsByTagName('dest')[0];
        const endDest = dest?.getElementsByTagName('enderDest')[0];
        
        const destNome = formatDestinatario(get('xNome', dest));
        const endereco = formatEndereco(`${get('xLgr', endDest)}, ${get('nro', endDest)}`);
        const bairro = (get('xBairro', endDest) || '').toUpperCase();
        const cidadeUF = `${get('xMun', endDest)} - ${get('UF', endDest)}`.toUpperCase();

        const itemsElements = Array.from(xml.getElementsByTagName('det'));
        const itens: ProductItem[] = itemsElements.map(itemEl => ({
          cProd: get('cProd', itemEl),
          xProd: get('xProd', itemEl),
          qCom: get('qCom', itemEl),
          xPed: get('xPed', itemEl) || '---'
        }));

        const volTag = xml.getElementsByTagName('vol')[0];
        const volumesTotais = parseInt(get('qVol', volTag) || '1');

        resolve({
          id: `${nNF}-${cnpjEmitente}`,
          emitente,
          cnpjEmitente,
          nNF,
          destNome,
          endereco,
          bairro,
          cidadeUF,
          itens,
          volumesTotais
        });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("Erro ao ler arquivo"));
    reader.readAsText(file);
  });
};
