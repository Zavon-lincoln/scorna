/**
 * Scorna Blueprint — PDF Export
 * Uses html2canvas + jsPDF to capture the rendered blueprint.
 */

export async function exportBlueprintPDF(elementId, fileName) {
  const { default: html2canvas } = await import('html2canvas');
  const { default: jsPDF } = await import('jspdf');

  const element = document.getElementById(elementId);
  if (!element) throw new Error('Blueprint element not found');

  // A4 proportions in points
  const PDF_WIDTH = 595.28;
  const PDF_HEIGHT = 841.89;

  // Capture at 2x scale for sharpness
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#0A0A0A',
    logging: false,
    // Ensure full-height capture
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  });

  const imgWidth = canvas.width;
  const imgHeight = canvas.height;

  // Work out how many PDF pages we need
  const ratio = PDF_WIDTH / (imgWidth / 2); // account for 2x scale
  const scaledHeight = (imgHeight / 2) * ratio;
  const pageCount = Math.ceil(scaledHeight / PDF_HEIGHT);

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  // Slice canvas into pages
  for (let i = 0; i < pageCount; i++) {
    if (i > 0) pdf.addPage();

    // How many canvas pixels correspond to one PDF page?
    const pageHeightInCanvasPx = (PDF_HEIGHT / ratio) * 2;
    const sourceY = i * pageHeightInCanvasPx;
    const remainingHeight = imgHeight - sourceY;
    const sliceHeight = Math.min(pageHeightInCanvasPx, remainingHeight);

    // Create a temporary canvas for this slice
    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = imgWidth;
    pageCanvas.height = sliceHeight;

    const ctx = pageCanvas.getContext('2d');
    ctx.fillStyle = '#0A0A0A';
    ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
    ctx.drawImage(canvas, 0, -sourceY);

    const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.97);
    const pageScaledHeight = (sliceHeight / 2) * ratio;

    pdf.addImage(pageImgData, 'JPEG', 0, 0, PDF_WIDTH, pageScaledHeight);
  }

  pdf.save(fileName);
}
