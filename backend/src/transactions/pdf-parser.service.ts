import { Injectable } from '@nestjs/common';
import { Transaction } from './transaction.entity';

@Injectable()
export class PdfParserService {
  async parse(buffer: Buffer): Promise<Partial<Transaction>[]> {
    return new Promise((resolve, reject) => {
      console.log('=== PARSEO PDF CON TABLA ===');
      
      const PDFParser = require('pdf2json').default || require('pdf2json');
      const pdfParser = new PDFParser(null, 1);
      
      let pdfText = '';
      
      pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
        try {
          console.log('✓ PDF parseado');
          
          // Extraer texto de forma estructurada
          pdfText = this.extractStructuredText(pdfData);
          console.log(`Texto extraído: ${pdfText.length} caracteres`);
          
          // Procesar tabla de transacciones
          const transactions = this.parseTransactionTable(pdfText);
          console.log(`✓ ${transactions.length} transacciones extraídas correctamente`);
          
          resolve(transactions);
        } catch (error) {
          reject(error);
        }
      });
      
      pdfParser.on('pdfParser_dataError', (error: any) => {
        console.error('Error parseando PDF:', error);
        reject(error);
      });
      
      console.log('Parseando buffer...');
      pdfParser.parseBuffer(buffer);
    });
  }
  
  private extractStructuredText(pdfData: any): string {
    let text = '';
    
    if (!pdfData || !pdfData.Pages) return text;
    
    console.log(`PDF tiene ${pdfData.Pages.length} páginas`);
    
    // Para cada página, extraer texto manteniendo cierta estructura
    pdfData.Pages.forEach((page: any, pageIndex: number) => {
      if (page.Texts && Array.isArray(page.Texts)) {
        // Ordenar textos por posición Y (vertical) y X (horizontal)
        const sortedTexts = [...page.Texts].sort((a, b) => {
          // Primero por posición Y (de arriba a abajo)
          const yDiff = a.y - b.y;
          if (Math.abs(yDiff) > 0.5) {
            return yDiff;
          }
          // Luego por posición X (de izquierda a derecha)
          return a.x - b.x;
        });
        
        let lastY = -1;
        sortedTexts.forEach((textItem: any) => {
          if (textItem.R && textItem.R[0] && textItem.R[0].T) {
            try {
              const textContent = decodeURIComponent(textItem.R[0].T);
              
              // Si hay un cambio significativo en Y, agregar nueva línea
              if (lastY !== -1 && Math.abs(textItem.y - lastY) > 1) {
                text += '\n';
              }
              
              text += textContent + ' ';
              lastY = textItem.y;
            } catch {
              // Si falla decodeURI, usar el texto directo
              text += textItem.R[0].T + ' ';
            }
          }
        });
        
        // Nueva línea entre páginas
        text += '\n\n';
      }
    });
    
    return text;
  }
  
  private parseTransactionTable(text: string): Partial<Transaction>[] {
    const transactions: Partial<Transaction>[] = [];
    
    if (!text) return transactions;
    
    console.log('=== ANALIZANDO ESTRUCTURA DEL TEXTO ===');
    
    // Dividir en líneas y limpiar
    const lines = text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    console.log(`Total líneas: ${lines.length}`);
    
    // Buscar el inicio de la tabla (después de "Reporte de Transacciones")
    let startIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('Reporte de Transacciones') || 
          lines[i].includes('Source ID') && lines[i].includes('Fecha')) {
        startIndex = i + 1;
        console.log(`Tabla encontrada en línea ${i}`);
        break;
      }
    }
    
    // Si no encontramos encabezado, buscar líneas que contengan INV-2025
    if (startIndex === 0) {
      console.log('Buscando transacciones directamente...');
      for (let i = 0; i < lines.length; i++) {
        this.extractTransactionFromLine(lines[i], transactions);
      }
      return transactions;
    }
    
    // Procesar líneas desde el inicio de la tabla
    console.log(`Procesando desde línea ${startIndex}`);
    
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      
      // Buscar transacciones en esta línea
      const extracted = this.extractTransactionsFromLine(line);
      if (extracted.length > 0) {
        transactions.push(...extracted);
      }
    }
    
    return transactions;
  }
  
  private extractTransactionsFromLine(line: string): Partial<Transaction>[] {
    const transactions: Partial<Transaction>[] = [];
    
    if (!line) return transactions;
    
    // Buscar todos los patrones de factura en la línea
    const invoicePattern = /INV-2025-\d{3}/g;
    const matches = line.match(invoicePattern);
    
    if (!matches || matches.length === 0) {
      return transactions;
    }
    
    console.log(`Encontradas ${matches.length} facturas en línea`);
    
    // Para cada factura encontrada, intentar extraer sus datos
    for (const invoiceId of matches) {
      // Encontrar la posición de esta factura en la línea
      const startIndex = line.indexOf(invoiceId);
      if (startIndex === -1) continue;
      
      // Tomar el substring desde esta factura hasta la siguiente o el final
      let endIndex = line.length;
      for (const otherInvoice of matches) {
        if (otherInvoice !== invoiceId) {
          const otherIndex = line.indexOf(otherInvoice, startIndex + 1);
          if (otherIndex !== -1 && otherIndex < endIndex) {
            endIndex = otherIndex;
          }
        }
      }
      
      const transactionText = line.substring(startIndex, endIndex).trim();
      
      // Parsear esta transacción individual
      const transaction = this.parseSingleTransaction(transactionText, invoiceId);
      if (transaction) {
        transactions.push(transaction);
      }
    }
    
    return transactions;
  }
  
  private parseSingleTransaction(text: string, invoiceId: string): Partial<Transaction> | null {
    try {
      // Dividir el texto de la transacción por espacios
      const parts = text.split(/\s+/).filter(part => part.length > 0);
      
      if (parts.length < 4) {
        console.warn(`Transacción muy corta para ${invoiceId}: ${text.substring(0, 50)}...`);
        return null;
      }
      
      // El primer elemento debería ser el ID de factura
      if (parts[0] !== invoiceId) {
        // Buscar el ID en los primeros elementos
        let idIndex = -1;
        for (let i = 0; i < Math.min(parts.length, 3); i++) {
          if (parts[i] === invoiceId) {
            idIndex = i;
            break;
          }
        }
        
        if (idIndex === -1) {
          console.warn(`No se encontró ${invoiceId} en: ${text.substring(0, 50)}...`);
          return null;
        }
        
        // Reordenar parts desde el ID
        parts.splice(0, idIndex);
      }
      
      // Asumir estructura: ID Fecha Categoría Monto Estado Descripción...
      // Pero la descripción puede contener espacios
      
      const fecha = this.extractDateFromParts(parts, 1);
      const categoria = this.extractCategoriaFromParts(parts, 2);
      const monto = this.extractMontoFromParts(parts, 3);
      const estado = this.extractEstadoFromParts(parts, 4);
      const descripcion = this.extractDescripcionFromParts(parts, 5);
      
      if (!fecha || !categoria || monto === 0) {
        console.warn(`Datos incompletos para ${invoiceId}: fecha=${fecha}, categoria=${categoria}, monto=${monto}`);
        return null;
      }
      
      return {
        sourceId: invoiceId,
        fecha: fecha,
        categoria: categoria,
        monto: monto,
        estado: estado || 'activo',
        descripcion: descripcion || `Transacción ${invoiceId}`
      };
      
    } catch (error) {
      console.error(`Error parseando transacción ${invoiceId}:`, error.message);
      return null;
    }
  }
  
  private extractDateFromParts(parts: string[], startIndex: number): string {
    if (startIndex >= parts.length) return '';
    
    // Buscar fecha en formato DD-MM-YYYY
    const datePattern = /\d{2}-\d{2}-\d{4}/;
    for (let i = startIndex; i < Math.min(parts.length, startIndex + 3); i++) {
      if (datePattern.test(parts[i])) {
        return parts[i];
      }
    }
    
    return '';
  }
  
  private extractCategoriaFromParts(parts: string[], startIndex: number): string {
    if (startIndex >= parts.length) return '';
    
    // Lista de categorías conocidas
    const categoriasConocidas = [
      'Servicios', 'Inventario', 'Gastos', 'Ventas', 
      'servicios', 'inventario', 'gastos', 'ventas'
    ];
    
    for (let i = startIndex; i < Math.min(parts.length, startIndex + 3); i++) {
      if (categoriasConocidas.includes(parts[i])) {
        return parts[i].charAt(0).toUpperCase() + parts[i].slice(1).toLowerCase();
      }
    }
    
    // Si no encontramos categoría conocida, tomar el siguiente campo no numérico
    for (let i = startIndex; i < Math.min(parts.length, startIndex + 3); i++) {
      if (!this.looksLikeDate(parts[i]) && !this.looksLikeAmount(parts[i])) {
        return parts[i].substring(0, 50); // Limitar longitud
      }
    }
    
    return 'General';
  }
  
  private extractMontoFromParts(parts: string[], startIndex: number): number {
    if (startIndex >= parts.length) return 0;
    
    // Buscar monto con $ o números grandes
    for (let i = startIndex; i < Math.min(parts.length, startIndex + 3); i++) {
      const monto = this.parseAmount(parts[i]);
      if (monto > 0) {
        return monto;
      }
    }
    
    return 0;
  }
  
  private extractEstadoFromParts(parts: string[], startIndex: number): string {
    if (startIndex >= parts.length) return 'activo';
    
    const estadosConocidos = [
      'cancelado', 'activo', 'pendiente', 'completado',
      'Cancelado', 'Activo', 'Pendiente', 'Completado'
    ];
    
    for (let i = startIndex; i < Math.min(parts.length, startIndex + 3); i++) {
      if (estadosConocidos.includes(parts[i])) {
        return parts[i].toLowerCase();
      }
    }
    
    return 'activo';
  }
  
  private extractDescripcionFromParts(parts: string[], startIndex: number): string {
    if (startIndex >= parts.length) return '';
    
    // Tomar todos los elementos restantes como descripción
    const descParts = parts.slice(startIndex);
    
    // Limitar longitud y unir
    const descripcion = descParts.join(' ').substring(0, 200);
    return descripcion;
  }
  
  private looksLikeDate(text: string): boolean {
    return /\d{2}-\d{2}-\d{4}/.test(text);
  }
  
  private looksLikeAmount(text: string): boolean {
    return /\$?[\d\.,]+/.test(text);
  }
  
  private parseAmount(amountStr: string): number {
    if (!amountStr) return 0;
    
    // Buscar números con o sin símbolo $
    const match = amountStr.match(/\$?([\d\.,]+)/);
    if (!match) return 0;
    
    let amount = match[1];
    
    // Limpiar: quitar puntos de miles, convertir coma decimal a punto
    if (amount.includes('.') && amount.includes(',')) {
      // Formato: 1.666,00
      amount = amount.replace(/\./g, '').replace(',', '.');
    } else if (amount.includes(',')) {
      // Formato: 1666,00
      amount = amount.replace(',', '.');
    } else if ((amount.match(/\./g) || []).length > 1) {
      // Formato: 1.666.000
      amount = amount.replace(/\./g, '');
    }
    
    const parsed = parseFloat(amount);
    return isNaN(parsed) ? 0 : parsed;
  }
  
  private extractTransactionFromLine(line: string, transactions: Partial<Transaction>[]): void {
    // Método alternativo: buscar patrón completo
    const transactionPattern = /(INV-2025-\d{3})\s+(\d{2}-\d{2}-\d{4})\s+(\w+)\s+(\$?[\d\.,]+)\s+(\w+)\s+(.+)/;
    const match = line.match(transactionPattern);
    
    if (match) {
      const monto = this.parseAmount(match[4]);
      
      transactions.push({
        sourceId: match[1],
        fecha: match[2],
        categoria: match[3],
        monto: monto,
        estado: match[5].toLowerCase(),
        descripcion: match[6].substring(0, 200) // Limitar longitud
      });
    }
  }
}