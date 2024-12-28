import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { FinancialYearService } from './seeders/financial-year.service';
import { GroupsService } from './seeders/groups.service';
import { ClassesService } from './seeders/classes.service';
import { AccountsService } from './seeders/accounts.service';
import { BalanceService } from './seeders/balances.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable CORS
  app.enableCors({
    origin: ['http://localhost:3000', 'https://expense.ecu.co.tz'],  // Update with your frontend domain
    // origin: 'http://localhost:3000',  // Update with your frontend domain
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Serve static files from the 'uploads' directory
  app.useStaticAssets(join(__dirname, '..', '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Retrieve the FinancialYearService and run the seeder
  const financialYearService = app.get(FinancialYearService);
  await financialYearService.seed();

  // Retrieve the GroupsService and run the seeder
  const groupService = app.get(GroupsService);
  await groupService.seed();

  // Retrieve the ClassesService and run the seeder
  const classService = app.get(ClassesService);
  await classService.seed();

  // Retrieve the AccountsService and run the seeder
  const accountService = app.get(AccountsService);
  await accountService.seed();

  // Retrieve the BalanceService and run the seeder
  const balanceService = app.get(BalanceService);
  await balanceService.seed();

  await app.listen(5000);
}
bootstrap();
