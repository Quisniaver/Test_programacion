import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sourceId: string; // Ej: INV-2025-001 

  @Column()
  fecha: string; // Ej: 11-10-2025 

  @Column()
  categoria: string; // Ej: Servicios 

  @Column({ type: 'float' })
  monto: number; // Guardamos 1666.00 en lugar de "$1.666" 

  @Column()
  estado: string; // Ej: cancelado 

  @Column()
  descripcion: string; // Ej: Prestación de servicio 
}