/* PDF A4 vetorial sem dependências: fontes padrão PDF e texto WinAnsi.
 * Tudo é gerado no dispositivo, inclusive sem internet. */
function createGranjaReportPDF(report) {
  const WIDTH = 595.28, HEIGHT = 841.89, LEFT = 36, RIGHT = WIDTH - 36;
  const pages = [];
  let commands, y;
  const green = [0.07, 0.23, 0.18], ink = [0.09, 0.15, 0.18];
  const muted = [0.38, 0.43, 0.46], light = [0.94, 0.96, 0.95];
  const money = n => n.toLocaleString('pt-BR', {style:'currency', currency:'BRL'});
  const count = n => n.toLocaleString('pt-BR');
  const cp1252 = {'€':128,'‚':130,'ƒ':131,'„':132,'…':133,'†':134,'‡':135,'ˆ':136,'‰':137,'Š':138,'‹':139,'Œ':140,'Ž':142,'‘':145,'’':146,'“':147,'”':148,'•':149,'–':150,'—':151,'˜':152,'™':153,'š':154,'›':155,'œ':156,'ž':158,'Ÿ':159,'−':45};
  const hex = value => Array.from(String(value).replace(/[\r\n\t]/g, ' '), c => {
    const point = c.codePointAt(0);
    return (cp1252[c] ?? (point >= 32 && point <= 255 ? point : 63)).toString(16).padStart(2, '0');
  }).join('');
  const rect = (x, top, w, h, color) => commands.push(`${color.join(' ')} rg ${x} ${HEIGHT-top-h} ${w} ${h} re f`);
  const text = (value, x, top, size=11, bold=false, color=ink) => {
    commands.push(`BT /${bold ? 'F2' : 'F1'} ${size} Tf ${color.join(' ')} rg 1 0 0 1 ${x} ${HEIGHT-top} Tm <${hex(value)}> Tj ET`);
  };
  function newPage() {
    commands = [];
    pages.push(commands);
    rect(0, 0, WIDTH, 112, green);
    text(report.isDev ? 'GRANJA / DESENVOLVIMENTO' : 'GRANJA', LEFT, 30, 12, true, [0.71,0.86,0.77]);
    text('Relatório mensal', LEFT, 59, 25, true, [1,1,1]);
    text('Período: ' + report.period, LEFT, 81, 11, false, [1,1,1]);
    text('Emitido em: ' + report.emittedAt, LEFT, 99, 9, false, [0.82,0.9,0.85]);
    y = 140;
  }
  function space(height) { if (y + height > HEIGHT - 65) newPage(); }
  function section(title) { space(40); text(title, LEFT, y, 14, true, green); y += 20; }
  // Limite conservador de caracteres por linha mantém mesmo palavras longas dentro da página.
  function lines(value, limit) {
    const result = [];
    let remaining = String(value).replace(/\s+/g, ' ').trim();
    if (!remaining) return ['Sem categoria'];
    while (remaining.length > limit) {
      const split = remaining.lastIndexOf(' ', limit);
      const end = split > limit / 2 ? split : limit;
      result.push(remaining.slice(0, end));
      remaining = remaining.slice(end).trimStart();
    }
    if (remaining) result.push(remaining);
    return result;
  }
  newPage();
  const cards = [
    ['PRODUÇÃO', count(report.produced) + ' ovos', green],
    ['VENDIDOS', count(report.sold) + ' ovos', green],
    ['OVOS QUEBRADOS', count(report.broken) + ' ovos', [0.65,0.32,0.05]],
    ['CONSUMO PRÓPRIO', count(report.consumed) + ' ovos', [0.65,0.32,0.05]],
    ['FATURAMENTO', money(report.revenue), green],
    ['GASTOS', money(report.spending), [0.65,0.14,0.12]],
    ['LUCRO', money(report.profit), report.profit >= 0 ? green : [0.65,0.14,0.12]],
    ['ESTOQUE ATUAL', count(report.stock) + ' ovos', green]
  ];
  const gap=10, width=(RIGHT-LEFT-gap*3)/4;
  cards.forEach(([label,value,color],i) => {
    const x=LEFT+(i%4)*(width+gap), top=y+Math.floor(i/4)*77;
    rect(x,top,width,67,light);
    rect(x,top,3,67,color);
    text(label,x+10,top+20,8,true,muted);
    text(value,x+10,top+46,Math.min(17,(width-20)/(value.length*0.61)),true,color);
  });
  y += 178;
  section('Indicadores do mês');
  const indicators = [
    ['Quantidade de vendas', count(report.saleCount)],
    ['Ticket médio', money(report.ticket)],
    ['Preço médio por ovo vendido', money(report.eggPrice)],
    ['Produção aproveitável', count(report.usable) + ' ovos']
  ];
  for (const [label,value] of indicators) {
    text(label,LEFT,y,10,false,muted);
    text(value,RIGHT-115,y,11,true);
    y += 24;
  }
  y += 14;
  section('Gastos por categoria');
  function tableHeader() {
    space(32);
    rect(LEFT,y-13,RIGHT-LEFT,25,green);
    text('Categoria',LEFT+10,y+3,10,true,[1,1,1]);
    text('Valor',RIGHT-115,y+3,10,true,[1,1,1]);
    y+=31;
  }
  tableHeader();
  const categories = report.categories.length ? report.categories : [['Sem gastos neste mês',0]];
  categories.forEach(([name,value],i) => {
    const wrapped=lines(name,60);
    wrapped.forEach((line,j) => {
      if (y+25>HEIGHT-65) { newPage(); section('Gastos por categoria — continuação'); tableHeader(); }
      rect(LEFT,y-13,RIGHT-LEFT,25,i%2===0 ? light : [1,1,1]);
      text(line,LEFT+10,y+3,10);
      if (j===wrapped.length-1) text(money(value),RIGHT-115,y+3,10,true);
      y+=25;
    });
  });
  space(33);
  rect(LEFT,y-12,RIGHT-LEFT,29,[0.87,0.93,0.89]);
  text('Total de gastos',LEFT+10,y+6,11,true,green);
  text(money(report.spending),RIGHT-115,y+6,11,true,green);
  y+=53;
  const notes = [
    'Produção, vendas, quebras, consumo e valores se referem ao mês selecionado.',
    'O estoque atual considera todos os registros e foi calculado na emissão deste relatório.',
    'Lucro = faturamento - gastos. Produção aproveitável = produção - ovos quebrados.'
  ];
  notes.forEach(note => lines(note,99).forEach(line => { space(15); text(line,LEFT,y,9,false,muted); y+=15; }));
  pages.forEach((page,i) => {
    commands=page;
    rect(LEFT,HEIGHT-45,RIGHT-LEFT,1,[0.83,0.87,0.85]);
    text('Granja • Controle de caixa e produção',LEFT,HEIGHT-27,8,false,muted);
    text(`${i+1} / ${pages.length}`,RIGHT-35,HEIGHT-27,8,false,muted);
  });
  // Todos os objetos são ASCII; os textos são strings hexadecimais WinAnsi.
  // Assim os offsets de xref coincidem com os bytes gravados no arquivo.
  const objects = [null, '', '',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>'];
  const pageIds=[];
  pages.forEach(page => {
    const stream=page.join('\n')+'\n';
    const streamId=objects.length;
    objects.push(`<< /Length ${stream.length} >>\nstream\n${stream}endstream`);
    const pageId=objects.length;
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${WIDTH} ${HEIGHT}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${streamId} 0 R >>`);
    pageIds.push(pageId);
  });
  objects[1]='<< /Type /Catalog /Pages 2 0 R >>';
  objects[2]=`<< /Type /Pages /Kids [${pageIds.map(id=>`${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;
  let pdf='%PDF-1.4\n', offsets=[0];
  for(let id=1;id<objects.length;id++) { offsets[id]=pdf.length; pdf+=`${id} 0 obj\n${objects[id]}\nendobj\n`; }
  const start=pdf.length;
  pdf+=`xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach(offset=>pdf+=`${String(offset).padStart(10,'0')} 00000 n \n`);
  pdf+=`trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${start}\n%%EOF\n`;
  return new TextEncoder().encode(pdf);
}
