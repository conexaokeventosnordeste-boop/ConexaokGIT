'use strict';

window.createBriefingPdf = async function createBriefingPdf(rows) {
  const { PDFDocument, StandardFonts, PageSizes, rgb } = window.PDFLib;
  const documentPdf = await PDFDocument.create();
  documentPdf.setTitle('XK Eventos | Briefing do projeto');
  const regular = await documentPdf.embedFont(StandardFonts.Helvetica);
  const bold = await documentPdf.embedFont(StandardFonts.HelveticaBold);
  const supported = new Set(regular.getCharacterSet());
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const [width, height] = PageSizes.A4;
  const margin = 44;
  const column = width - 2 * margin;
  const size = 11;
  const lineHeight = 16;
  const ink = rgb(.07, .07, .11);
  const blue = rgb(.125, .125, .92);
  let page;
  let y;

  function nextPage() {
    page = documentPdf.addPage(PageSizes.A4);
    page.drawRectangle({ x: margin, y: height - 45, width: 26, height: 4, color: blue });
    page.drawText('XK EVENTOS', { x: margin, y: height - 67, size: 11, font: bold, color: blue });
    page.drawText('Briefing do projeto', { x: margin, y: height - 99, size: 25, font: bold, color: ink });
    y = height - 133;
  }

  function hasPdfGlyphs(text) {
    return Array.from(text).every(char => supported.has(char.codePointAt(0)));
  }

  function measure(text) {
    if (hasPdfGlyphs(text)) return regular.widthOfTextAtSize(text, size);
    context.font = size + 'px Arial, sans-serif';
    return context.measureText(text).width;
  }

  function wrap(text) {
    const lines = [];
    for (const paragraph of text.normalize('NFC').replace(/\r\n?/g, '\n').split('\n')) {
      let line = '';
      for (const word of paragraph.split(/\s+/u).filter(Boolean)) {
        const combined = line ? line + ' ' + word : word;
        if (measure(combined) <= column) { line = combined; continue; }
        if (line) lines.push(line);
        line = '';
        for (const character of word) {
          if (line && measure(line + character) > column) { lines.push(line); line = ''; }
          line += character;
        }
      }
      lines.push(line);
    }
    return lines;
  }

  async function drawLine(text) {
    if (hasPdfGlyphs(text)) {
      page.drawText(text, { x: margin, y, size, font: regular, color: ink });
      return;
    }
    const imageWidth = Math.ceil(measure(text)) + 4;
    canvas.width = imageWidth * 3;
    canvas.height = lineHeight * 3;
    context.scale(3, 3);
    context.font = size + 'px Arial, sans-serif';
    context.fillStyle = '#12121b';
    context.fillText(text, 0, 12);
    const image = await documentPdf.embedPng(canvas.toDataURL('image/png'));
    page.drawImage(image, { x: margin, y: y - 4, width: imageWidth, height: lineHeight });
  }

  nextPage();
  for (const [label, value] of rows) {
    if (y < margin + 28) nextPage();
    page.drawText(label, { x: margin, y, size: 10, font: bold, color: blue });
    y -= 17;
    for (const line of wrap(value)) {
      if (y < margin) nextPage();
      if (line) await drawLine(line);
      y -= lineHeight;
    }
    y -= 12;
  }
  return documentPdf.save();
};
