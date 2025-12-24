
export const formatEndereco = (endereco: string): string => {
  let e = endereco.toUpperCase();
  e = e.replace(/AVENIDA\b/g, 'AV.');
  e = e.replace(/RUA\b/g, 'R.');
  e = e.replace(/RODOVIA\b/g, 'ROD.');
  e = e.replace(/TRAVESSA\b/g, 'TRAV.');
  e = e.replace(/ESTRADA\b/g, 'EST.');
  e = e.replace(/PRACA\b/g, 'PÇA.');
  e = e.replace(/PRAÇA\b/g, 'PÇA.');
  return e;
};

export const formatDestinatario = (nome: string): string => {
  let n = nome.toUpperCase();
  n = n.replace(/SERVIÇOS\b/g, 'SERV.');
  n = n.replace(/SERVICOS\b/g, 'SERV.');
  n = n.replace(/COMERCIO\b/g, 'COM.');
  n = n.replace(/COMÉRCIO\b/g, 'COM.');
  return n;
};

export const formatProduto = (produto: string): string => {
  let p = produto.toUpperCase();
  p = p.replace(/PARA/g, 'P/');
  p = p.replace(/SUSPENSAO/g, 'SUSP.');
  return p;
};

export const formatQuantity = (qCom: string): string => {
  if (!qCom) return '0';
  const qNum = parseFloat(qCom.replace(',', '.'));
  return isNaN(qNum) ? qCom : Math.floor(qNum).toString();
};
