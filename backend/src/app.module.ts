import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { TransactionsModule } from './transactions/transactions.module';
import { Transaction } from './transactions/transaction.entity';

@Module({
  imports: [
    // Configuración de conexión a MySQL
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root', // Tu usuario de MySQL
      password: '',     // Tu contraseña
      database: 'sistema_reportes', // Asegúrate de crear esta DB en MySQL
      entities: [Transaction],
      synchronize: true, // Esto crea la tabla 'transactions' automáticamente al iniciar
    }),
    AuthModule,
    TransactionsModule,
  ],
})
export class AppModule {}