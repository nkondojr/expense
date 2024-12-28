import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinancialYear } from 'src/organizations/entities/financial-years/financial-year.entity'; // Assuming financial year entity exists
import { Balance } from 'src/accounts/entities/balance.entity';
import { Account } from 'src/accounts/entities/account.entity';

@Injectable()
export class BalanceService {
  constructor(
    @InjectRepository(Balance)
    private balanceRepository: Repository<Balance>,

    @InjectRepository(FinancialYear)
    private financialYearRepository: Repository<FinancialYear>,

    @InjectRepository(Account)
    private accountsRepository: Repository<Account>,
  ) {}

  // Seed balances
  async seed() {
    const balances = [
      {
        id: 1,
        uuid: 'da93ad96-2252-4415-b41a-10d2a9027010',
        account: 1, // Assuming these are IDs and not UUIDs for accounts
        financialYear: 1,
        createdBy: null,
        updatedBy: null,
        createdAt: new Date('2024-05-01T00:01:12.595145+00:00'),
        updatedAt: new Date('2024-05-01T00:01:12.595145+00:00'),
      },
      {
        id: 2,
        uuid: '7962e6db-d1dc-43e7-bd02-cbda1ceca515',
        account: 2,
        financialYear: 1,
        createdBy: null,
        updatedBy: null,
        createdAt: new Date('2024-05-01T00:01:13.595145+00:00'),
        updatedAt: new Date('2024-05-01T00:01:13.595145+00:00'),
      },
      {
        id: 3,
        uuid: 'f64a92bd-b48f-47b0-8982-846038ea44b9',
        account: 3,
        financialYear: 1,
        createdBy: null,
        updatedBy: null,
        createdAt: new Date('2024-05-01T00:01:14.595145+00:00'),
        updatedAt: new Date('2024-05-01T00:01:14.595145+00:00'),
      },
      {
        id: 4,
        uuid: '76e5ccf7-8b39-4d92-81d9-f63e8b7a0186',
        account: 4,
        financialYear: 1,
        createdBy: null,
        updatedBy: null,
        createdAt: new Date('2024-05-01T00:01:15.595145+00:00'),
        updatedAt: new Date('2024-05-01T00:01:15.595145+00:00'),
      },
      {
        id: 5,
        uuid: 'c22c9f31-bd27-4cda-ba25-c418282efca1',
        account: 5,
        financialYear: 1,
        createdBy: null,
        updatedBy: null,
        createdAt: new Date('2024-05-01T00:01:16.595145+00:00'),
        updatedAt: new Date('2024-05-01T00:01:16.595145+00:00'),
      },
      {
        id: 6,
        uuid: '3c36595e-b8cd-486e-9310-85e0370b7472',
        account: 6,
        financialYear: 1,
        createdBy: null,
        updatedBy: null,
        createdAt: new Date('2024-05-01T00:01:17.595145+00:00'),
        updatedAt: new Date('2024-05-01T00:01:17.595145+00:00'),
      },
      {
        id: 7,
        uuid: '2c3e9197-33d5-46dc-87a0-9ab1693fffd1',
        account: 7,
        financialYear: 1,
        createdBy: null,
        updatedBy: null,
        createdAt: new Date('2024-05-01T00:01:18.595145+00:00'),
        updatedAt: new Date('2024-05-01T00:01:18.595145+00:00'),
      },
      {
        id: 8,
        uuid: '97949851-14ff-4031-a553-3ac5e97d63c9',
        account: 8,
        financialYear: 1,
        createdBy: null,
        updatedBy: null,
        createdAt: new Date('2024-05-01T00:01:19.595145+00:00'),
        updatedAt: new Date('2024-05-01T00:01:19.595145+00:00'),
      },
      {
        id: 9,
        uuid: '2cb8cd84-2c76-4696-bf6f-bdd9c1df014f',
        account: 9,
        financialYear: 1,
        createdBy: null,
        updatedBy: null,
        createdAt: new Date('2024-05-01T00:01:20.595145+00:00'),
        updatedAt: new Date('2024-05-01T00:01:20.595145+00:00'),
      },
      {
        id: 10,
        uuid: '963bb208-4adb-4f83-9de9-a19a9e169196',
        account: 10,
        financialYear: 1,
        createdBy: null,
        updatedBy: null,
        createdAt: new Date('2024-05-01T00:01:21.595145+00:00'),
        updatedAt: new Date('2024-05-01T00:01:21.595145+00:00'),
      },
      {
        id: 11,
        uuid: 'f7c85d56-8b03-4317-b0ed-e7c148ee4971',
        account: 11,
        financialYear: 1,
        createdBy: null,
        updatedBy: null,
        createdAt: new Date('2024-05-01T00:01:22.595145+00:00'),
        updatedAt: new Date('2024-05-01T00:01:22.595145+00:00'),
      },
      {
        id: 12,
        uuid: '06692bc5-4236-4459-9526-1328953b11e5',
        account: 12,
        financialYear: 1,
        createdBy: null,
        updatedBy: null,
        createdAt: new Date('2024-05-01T00:01:23.595145+00:00'),
        updatedAt: new Date('2024-05-01T00:01:23.595145+00:00'),
      },
    ];

    for (const balance of balances) {
      const existing = await this.balanceRepository.findOneBy({
        uuid: balance.uuid,
      });

      if (!existing) {
        // Find related account and financial year entities
        const account = await this.accountsRepository.findOne({
          where: { id: balance.account },
        });
        const financialYear = await this.financialYearRepository.findOne({
          where: { id: balance.financialYear },
        });

        if (account && financialYear) {
          await this.balanceRepository.save({
            id: balance.id,
            uuid: balance.uuid,
            account: { id: balance.account }, // Assuming account is a relation, pass its id
            financialYear: { id: balance.financialYear }, // Assuming financialYear is a relation
            createdBy: { id: balance.createdBy }, // Assuming createdBy is a User entity reference
            updatedBy: { id: balance.updatedBy }, // Assuming updatedBy is a User entity reference
            createdAt: balance.createdAt,
            updatedAt: balance.updatedAt,
          });
        }
      }
    }
  }
}
