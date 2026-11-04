// Static fictional content. Missing monetary/date values remain null, never invented.
export const quotation = {
  source: `Cotización COT-DEMO-001
Fecha: 20 de octubre de 2026
Cliente: Cliente de ejemplo
Producto: Piso de ingeniería de roble de 14 mm
Cantidad: 48 m²
Precio unitario: $850 MXN por m²
Importe de materiales: $40,800 MXN
Flete: por confirmar`,
  freight: null,
  validUntil: null,
  finalTotal: null,
  rows: [
    ['Folio', 'COT-DEMO-001', 'Cotejar con el documento'],
    ['Fecha', '20 de octubre de 2026', 'Cotejar con el documento'],
    ['Cliente', 'Cliente de ejemplo', 'Cotejar con el documento'],
    ['Producto', 'Piso de ingeniería de roble de 14 mm', 'Cotejar con el documento'],
    ['Cantidad y unidad', '48 m²', 'Cotejar con el documento'],
    ['Precio unitario', '850 MXN por m²', 'Cotejar con el documento'],
    ['Importe de materiales', '40,800 MXN', 'Coincide con 48 × 850'],
    ['Flete', 'Por confirmar', 'Requiere aclaración'],
    ['Vigencia', 'No indicada', 'Requiere aclaración'],
    ['Total final', 'No determinado', 'Requiere aclaración'],
  ],
} as const;