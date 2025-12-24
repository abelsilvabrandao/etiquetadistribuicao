
export interface ProductItem {
  cProd: string;
  xProd: string;
  qCom: string;
  xPed: string;
}

export interface NFData {
  id: string;
  emitente: string;
  cnpjEmitente: string;
  nNF: string;
  destNome: string;
  endereco: string;
  bairro: string;
  cidadeUF: string;
  itens: ProductItem[];
  volumesTotais: number;
}

export interface LabelData extends NFData {
  itemIndex: number;
  subItemIndex: number;
  volumeAtual: number;
  volumeNoItem: number;
  totalNoItem: number;
}
