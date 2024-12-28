import {
  AccountType,
  Class,
  Duration,
  Nature,
} from '../accounts/entities/class.entity';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(Class)
    private readonly classesRepository: Repository<Class>,
  ) {}

  async seed() {
    const classes = [
      {
        id: 1,
        uuid: '2eef87a4-8bb2-4b06-b242-e7ec4d64fdd9',
        name: 'asset',
        type: AccountType.ASSET, // Correctly use the enum
        duration: Duration.NON_CURRENT_ASSET, // Correctly use the enum
        nature: Nature.DEBITOR, // Correctly use the enum
        isEditable: false,
        createdAt: new Date('2024-05-01T00:00:01.595145+00:00'),
        updatedAt: new Date('2024-05-01T00:00:01.595145+00:00'),
      },
      {
        id: 2,
        uuid: '1642c036-2bd2-48cf-950a-384bac8e32d8',
        name: 'asset cash',
        type: AccountType.ASSET, // Correctly use the enum
        duration: Duration.CURRENT_ASSET, // Correctly use the enum
        nature: Nature.DEBITOR, // Correctly use the enum
        isEditable: false,
        createdAt: new Date('2024-05-01T00:00:02.595145+00:00'),
        updatedAt: new Date('2024-05-01T00:00:02.595145+00:00'),
      },
      {
        id: 3,
        uuid: '19fc68f9-08a4-4732-b518-fc21bdd66f07',
        name: 'bank',
        type: AccountType.ASSET, // Correctly use the enum
        duration: Duration.CURRENT_ASSET, // Correctly use the enum
        nature: Nature.DEBITOR, // Correctly use the enum
        isEditable: false,
        createdAt: new Date('2024-05-01T00:00:03.595145+00:00'),
        updatedAt: new Date('2024-05-01T00:00:03.595145+00:00'),
      },
      {
        id: 4,
        uuid: 'c4b94eb2-3de3-4908-8da5-2dd3c7b691c1',
        name: 'account receivable',
        type: AccountType.ASSET, // Correctly use the enum
        duration: Duration.CURRENT_ASSET, // Correctly use the enum
        nature: Nature.DEBITOR, // Correctly use the enum
        isEditable: false,
        createdAt: new Date('2024-05-01T00:00:04.595145+00:00'),
        updatedAt: new Date('2024-05-01T00:00:04.595145+00:00'),
      },
      {
        id: 5,
        uuid: '2320674f-1f79-42e7-b15c-87457a075615',
        name: 'allowance for bad debts',
        type: AccountType.ASSET, // Correctly use the enum
        duration: Duration.CURRENT_ASSET, // Correctly use the enum
        nature: Nature.DEBITOR, // Correctly use the enum
        isEditable: false,
        createdAt: new Date('2024-05-01 00:00:05.595145+00:00'),
        updatedAt: new Date('2024-05-01 00:00:05.595145+00:00'),
      },
      {
        id: 6,
        uuid: '786f087b-6938-4fee-9258-58f5bd98ab1d',
        name: 'inventory',
        type: AccountType.ASSET, // Correctly use the enum
        duration: Duration.CURRENT_ASSET, // Correctly use the enum
        nature: Nature.DEBITOR, // Correctly use the enum
        isEditable: false,
        createdAt: new Date('2024-05-01 00:00:06.595145+00:00'),
        updatedAt: new Date('2024-05-01 00:00:06.595145+00:00'),
      },
      {
        id: 7,
        uuid: '530da2ae-3712-4ac8-abdb-6b124b67b566',
        name: 'short term investments',
        type: AccountType.ASSET, // Correctly use the enum
        duration: Duration.CURRENT_ASSET, // Correctly use the enum
        nature: Nature.DEBITOR, // Correctly use the enum
        isEditable: false,
        createdAt: new Date('2024-05-01 00:00:07.595145+00:00'),
        updatedAt: new Date('2024-05-01 00:00:07.595145+00:00'),
      },
      {
        id: 8,
        uuid: '531f28c6-b175-4af6-a0de-9dc20acc5bd4',
        name: 'fixed asset',
        type: AccountType.ASSET, // Correctly use the enum
        duration: Duration.NON_CURRENT_ASSET, // Correctly use the enum
        nature: Nature.DEBITOR, // Correctly use the enum
        isEditable: false,
        createdAt: new Date('2024-05-01 00:00:08.595145+00:00'),
        updatedAt: new Date('2024-05-01 00:00:08.595145+00:00'),
      },
      {
        id: 9,
        uuid: '80441a54-cb1e-4588-8cf8-f19783e7bd20',
        name: 'accumulation, amortization & depreciation',
        type: AccountType.ASSET, // Correctly use the enum
        duration: Duration.NON_CURRENT_ASSET, // Correctly use the enum
        nature: Nature.DEBITOR, // Correctly use the enum
        isEditable: false,
        createdAt: new Date('2024-05-01 00:00:09.595145+00:00'),
        updatedAt: new Date('2024-05-01 00:00:09.595145+00:00'),
      },
      {
        id: 10,
        uuid: 'b6c72ddc-5040-4eb9-8a46-890829f56102',
        name: 'other asset',
        type: AccountType.ASSET, // Correctly use the enum
        duration: Duration.CURRENT_ASSET, // Correctly use the enum
        nature: Nature.DEBITOR, // Correctly use the enum
        isEditable: false,
        createdAt: new Date('2024-05-01 00:00:10.595145+00:00'),
        updatedAt: new Date('2024-05-01 00:00:10.595145+00:00'),
      },
      {
        id: 11,
        uuid: 'e18e6eb9-2b0f-4cbd-8337-dfc8b4a2f626',
        name: 'liability',
        type: AccountType.LIABILITY, // Correctly use the enum
        duration: Duration.CURRENT_ASSET, // Correctly use the enum
        nature: Nature.CREDITOR, // Correctly use the enum
        isEditable: false,
        createdAt: new Date('2024-05-01 00:00:11.595145+00:00'),
        updatedAt: new Date('2024-05-01 00:00:11.595145+00:00'),
      },
      {
        id: 12,
        uuid: 'f4cb259b-58e3-4ffa-97da-644af123fcdc',
        name: 'liability cash',
        type: AccountType.LIABILITY, // Correctly use the enum
        duration: Duration.CURRENT_ASSET, // Correctly use the enum
        nature: Nature.CREDITOR, // Correctly use the enum
        isEditable: false,
        createdAt: new Date('2024-05-01 00:00:12.595145+00:00'),
        updatedAt: new Date('2024-05-01 00:00:12.595145+00:00'),
      },
      {
        id: 13,
        uuid: '45084d63-c30a-4a61-aa76-f0a7358790b3',
        name: 'credit card',
        type: AccountType.LIABILITY, // Correctly use the enum
        duration: Duration.CURRENT_ASSET, // Correctly use the enum
        nature: Nature.CREDITOR, // Correctly use the enum
        isEditable: false,
        createdAt: new Date('2024-05-01 00:00:13.595145+00:00'),
        updatedAt: new Date('2024-05-01 00:00:13.595145+00:00'),
      },
      {
        id: 14,
        uuid: '844b71cd-a66d-46f2-947b-96ec96072257',
        name: 'accounts payable',
        type: AccountType.LIABILITY, // Correctly use the enum
        duration: Duration.CURRENT_ASSET, // Correctly use the enum
        nature: Nature.CREDITOR, // Correctly use the enum
        isEditable: false,
        createdAt: new Date('2024-05-01 00:00:14.595145+00:00'),
        updatedAt: new Date('2024-05-01 00:00:14.595145+00:00'),
      },
      {
        id: 15,
        uuid: '6185f7a8-7507-4548-8b06-dcd409e221f3',
        name: 'other payable',
        type: AccountType.LIABILITY, // Correctly use the enum
        duration: Duration.CURRENT_ASSET, // Correctly use the enum
        nature: Nature.CREDITOR, // Correctly use the enum
        isEditable: false,
        createdAt: new Date('2024-05-01 00:00:15.595145+00:00'),
        updatedAt: new Date('2024-05-01 00:00:15.595145+00:00'),
      },
      {
        id: 16,
        uuid: 'a00e2cd5-48d9-405e-8578-920ec15a6181',
        name: 'sales tax payable',
        type: AccountType.LIABILITY, // Correctly use the enum
        duration: Duration.CURRENT_ASSET, // Correctly use the enum
        nature: Nature.CREDITOR, // Correctly use the enum
        isEditable: false,
        createdAt: new Date('2024-05-01 00:00:16.595145+00:00'),
        updatedAt: new Date('2024-05-01 00:00:16.595145+00:00'),
      },
      {
        id: 17,
        uuid: '32d35615-8121-46d9-a32e-26c04772a2fd',
        name: 'payroll tax payable',
        type: AccountType.LIABILITY, // Correctly use the enum
        duration: Duration.CURRENT_ASSET, // Correctly use the enum
        nature: Nature.CREDITOR, // Correctly use the enum
        isEditable: false,
        createdAt: new Date('2024-05-01 00:00:17.595145+00:00'),
        updatedAt: new Date('2024-05-01 00:00:17.595145+00:00'),
      },
      {
        id: 18,
        uuid: 'fb754495-4783-4e78-8865-c5b30e2ba645',
        name: 'employee deductions payable',
        type: AccountType.LIABILITY, // Correctly use the enum
        duration: Duration.CURRENT_ASSET, // Correctly use the enum
        nature: Nature.CREDITOR, // Correctly use the enum
        isEditable: false,
        createdAt: new Date('2024-05-01 00:00:18.595145+00:00'),
        updatedAt: new Date('2024-05-01 00:00:18.595145+00:00'),
      },
      {
        id: 19,
        uuid: '57336e7e-b788-41c7-9f94-85740ccd7389',
        name: 'income tax payable',
        type: AccountType.LIABILITY, // Correctly use the enum
        duration: Duration.CURRENT_ASSET, // Correctly use the enum
        nature: Nature.CREDITOR, // Correctly use the enum
        isEditable: false,
        createdAt: new Date('2024-05-01 00:00:19.595145+00:00'),
        updatedAt: new Date('2024-05-01 00:00:19.595145+00:00'),
      },
      {
        id: 20,
        uuid: '7ff5d5c0-7d1d-407b-9467-08e2591593a0',
        name: 'short term debt',
        type: AccountType.LIABILITY, // Correctly use the enum
        duration: Duration.CURRENT_ASSET, // Correctly use the enum
        nature: Nature.CREDITOR, // Correctly use the enum
        isEditable: false,
        createdAt: new Date('2024-05-01 00:00:20.595145+00:00'),
        updatedAt: new Date('2024-05-01 00:00:20.595145+00:00'),
      },
      {
        id: 21,
        uuid: 'd114d367-bdfd-4faf-bbbd-3006928f51b4',
        name: 'long term debt',
        type: AccountType.LIABILITY, // Correctly use the enum
        duration: Duration.CURRENT_ASSET, // Correctly use the enum
        nature: Nature.CREDITOR, // Correctly use the enum
        isEditable: false,
        createdAt: new Date('2024-05-01 00:00:21.595145+00:00'),
        updatedAt: new Date('2024-05-01 00:00:21.595145+00:00'),
      },
      {
        id: 22,
        uuid: '04ec1a17-6ca6-4020-adb2-dd0f81f98bd9',
        name: 'equity',
        type: AccountType.EQUITY, // Correctly use the enum
        duration: Duration.CURRENT_ASSET, // Correctly use the enum
        nature: Nature.CREDITOR, // Correctly use the enum
        isEditable: false,
        createdAt: new Date('2024-05-01 00:00:22.595145+00:00'),
        updatedAt: new Date('2024-05-01 00:00:22.595145+00:00'),
      },
      {
        id: 23,
        uuid: '83364d86-e85c-4232-9f4a-ff6ffd285101',
        name: 'equity cash',
        type: AccountType.EQUITY, // Correctly use the enum
        duration: Duration.CURRENT_ASSET, // Correctly use the enum
        nature: Nature.CREDITOR, // Correctly use the enum
        isEditable: false,
        createdAt: new Date('2024-05-01 00:00:23.595145+00:00'),
        updatedAt: new Date('2024-05-01 00:00:23.595145+00:00'),
      },
      {
        id: 24,
        uuid: 'c3b3c5e2-7bc7-4270-ae4e-c5a0afd5a5fc',
        name: 'owner/partner contributions',
        type: AccountType.EQUITY, // Correctly use the enum
        duration: Duration.CURRENT_ASSET, // Correctly use the enum
        nature: Nature.CREDITOR, // Correctly use the enum
        isEditable: false,
        createdAt: new Date('2024-05-01 00:00:24.595145+00:00'),
        updatedAt: new Date('2024-05-01 00:00:24.595145+00:00'),
      },
      {
        id: 25,
        uuid: '4aed6ce9-1499-4a02-9cc0-73ccb5c2da24',
        name: 'owner/partner withdrawls',
        type: AccountType.EQUITY, // Correctly use the enum
        duration: Duration.CURRENT_ASSET, // Correctly use the enum
        nature: Nature.CREDITOR, // Correctly use the enum
        isEditable: false,
        createdAt: new Date('2024-05-01 00:00:25.595145+00:00'),
        updatedAt: new Date('2024-05-01 00:00:25.595145+00:00'),
      },
      {
        id: 26,
        uuid: 'd2e13a0e-9d59-4bbd-bceb-361e259f98f5',
        name: 'share capital',
        type: AccountType.EQUITY, // Correctly use the enum
        duration: Duration.CURRENT_ASSET, // Correctly use the enum
        nature: Nature.CREDITOR, // Correctly use the enum
        isEditable: false,
        createdAt: new Date('2024-05-01 00:00:26.595145+00:00'),
        updatedAt: new Date('2024-05-01 00:00:26.595145+00:00'),
      },
      {
        id: 27,
        uuid: '3c9c9a05-2603-4657-b7ec-103b74dd6bd7',
        name: 'dividends',
        type: AccountType.EQUITY, // Correctly use the enum
        duration: Duration.CURRENT_ASSET, // Correctly use the enum
        nature: Nature.CREDITOR, // Correctly use the enum
        isEditable: false,
        createdAt: new Date('2024-05-01 00:00:27.595145+00:00'),
        updatedAt: new Date('2024-05-01 00:00:27.595145+00:00'),
      },
      {
        id: 28,
        uuid: 'c1801159-3e60-46fc-b99c-ccd900215e5e',
        name: 'retained earnings',
        type: AccountType.EQUITY, // Correctly use the enum
        duration: Duration.CURRENT_ASSET, // Correctly use the enum
        nature: Nature.CREDITOR, // Correctly use the enum
        isEditable: false,
        createdAt: new Date('2024-05-01 00:00:28.595145+00:00'),
        updatedAt: new Date('2024-05-01 00:00:28.595145+00:00'),
      },
      {
        id: 29,
        uuid: '7e8eccd6-893e-4a92-9814-bb1f57b9048b',
        name: 'current earnings',
        type: AccountType.EQUITY, // Correctly use the enum
        duration: Duration.CURRENT_ASSET, // Correctly use the enum
        nature: Nature.CREDITOR, // Correctly use the enum
        isEditable: false,
        createdAt: new Date('2024-05-01 00:00:29.595145+00:00'),
        updatedAt: new Date('2024-05-01 00:00:29.595145+00:00'),
      },
      {
        id: 30,
        uuid: '590000c7-d0ac-403b-9bb2-2c16de200ca4',
        name: 'revenue',
        type: AccountType.REVENUE, // Correctly use the enum
        duration: Duration.CURRENT_ASSET, // Correctly use the enum
        nature: Nature.CREDITOR, // Correctly use the enum
        isEditable: false,
        createdAt: new Date('2024-05-01 00:00:30.595145+00:00'),
        updatedAt: new Date('2024-05-01 00:00:30.595145+00:00'),
      },
      {
        id: 31,
        uuid: '958244a9-c960-4c92-806e-3452e78872a9',
        name: 'operating revenue',
        type: AccountType.REVENUE, // Correctly use the enum
        duration: Duration.CURRENT_ASSET, // Correctly use the enum
        nature: Nature.CREDITOR, // Correctly use the enum
        isEditable: false,
        createdAt: new Date('2024-05-01 00:00:31.595145+00:00'),
        updatedAt: new Date('2024-05-01 00:00:31.595145+00:00'),
      },
      {
        id: 32,
        uuid: '2b10752e-7987-408b-8331-729e9d7feb85',
        name: 'non-operating revenue',
        type: AccountType.REVENUE, // Correctly use the enum
        duration: Duration.CURRENT_ASSET, // Correctly use the enum
        nature: Nature.CREDITOR, // Correctly use the enum
        isEditable: false,
        createdAt: new Date('2024-05-01 00:00:32.595145+00:00'),
        updatedAt: new Date('2024-05-01 00:00:32.595145+00:00'),
      },
      {
        id: 33,
        uuid: '61fbe554-3c88-497d-a645-887e927e222a',
        name: 'other revenue',
        type: AccountType.REVENUE, // Correctly use the enum
        duration: Duration.CURRENT_ASSET, // Correctly use the enum
        nature: Nature.CREDITOR, // Correctly use the enum
        isEditable: false,
        createdAt: new Date('2024-05-01 00:00:33.595145+00:00'),
        updatedAt: new Date('2024-05-01 00:00:33.595145+00:00'),
      },
      {
        id: 34,
        uuid: 'b386da65-86a7-44d9-9705-9f5f53842bff',
        name: 'gain',
        type: AccountType.REVENUE, // Correctly use the enum
        duration: Duration.CURRENT_ASSET, // Correctly use the enum
        nature: Nature.CREDITOR, // Correctly use the enum
        isEditable: false,
        createdAt: new Date('2024-05-01 00:00:34.595145+00:00'),
        updatedAt: new Date('2024-05-01 00:00:34.595145+00:00'),
      },
      {
        id: 35,
        uuid: 'cd14cfc1-68e4-4ad9-92fb-f3933bd4b409',
        name: 'expense',
        type: AccountType.EXPENSE, // Correctly use the enum
        duration: Duration.CURRENT_ASSET, // Correctly use the enum
        nature: Nature.DEBITOR, // Correctly use the enum
        isEditable: false,
        createdAt: new Date('2024-05-01 00:00:35.595145+00:00'),
        updatedAt: new Date('2024-05-01 00:00:35.595145+00:00'),
      },
      {
        id: 36,
        uuid: '39b24552-f1eb-481d-829f-dc9878933c98',
        name: 'cost of goods sold',
        type: AccountType.EXPENSE, // Correctly use the enum
        duration: Duration.CURRENT_ASSET, // Correctly use the enum
        nature: Nature.DEBITOR, // Correctly use the enum
        isEditable: false,
        createdAt: new Date('2024-05-01 00:00:36.595145+00:00'),
        updatedAt: new Date('2024-05-01 00:00:36.595145+00:00'),
      },
      {
        id: 37,
        uuid: '7c1bdaf0-1e09-472c-a958-07b7b40fba46',
        name: 'operating expense',
        type: AccountType.EXPENSE, // Correctly use the enum
        duration: Duration.CURRENT_ASSET, // Correctly use the enum
        nature: Nature.DEBITOR, // Correctly use the enum
        isEditable: false,
        createdAt: new Date('2024-05-01 00:00:37.595145+00:00'),
        updatedAt: new Date('2024-05-01 00:00:37.595145+00:00'),
      },
      {
        id: 38,
        uuid: 'a74a354c-b250-4d9b-b842-03078465d03d',
        name: 'general & admin expense',
        type: AccountType.EXPENSE, // Correctly use the enum
        duration: Duration.CURRENT_ASSET, // Correctly use the enum
        nature: Nature.DEBITOR, // Correctly use the enum
        isEditable: false,
        createdAt: new Date('2024-05-01 00:00:38.595145+00:00'),
        updatedAt: new Date('2024-05-01 00:00:38.595145+00:00'),
      },
      {
        id: 39,
        uuid: '0c660dc1-6745-432e-8c62-cbfd44b64268',
        name: 'amortization/depreciation expense',
        type: AccountType.EXPENSE, // Correctly use the enum
        duration: Duration.CURRENT_ASSET, // Correctly use the enum
        nature: Nature.DEBITOR, // Correctly use the enum
        isEditable: false,
        createdAt: new Date('2024-05-01 00:00:39.595145+00:00'),
        updatedAt: new Date('2024-05-01 00:00:39.595145+00:00'),
      },
      {
        id: 40,
        uuid: '8de1d4c0-7d87-4438-8a4e-3e21e4f612b5',
        name: 'bad debt expense',
        type: AccountType.EXPENSE, // Correctly use the enum
        duration: Duration.CURRENT_ASSET, // Correctly use the enum
        nature: Nature.DEBITOR, // Correctly use the enum
        isEditable: false,
        createdAt: new Date('2024-05-01 00:00:40.595145+00:00'),
        updatedAt: new Date('2024-05-01 00:00:40.595145+00:00'),
      },
      {
        id: 41,
        uuid: 'f1f75d56-1fbc-426f-a47e-875282705d48',
        name: 'employee benefit expense',
        type: AccountType.EXPENSE, // Correctly use the enum
        duration: Duration.CURRENT_ASSET, // Correctly use the enum
        nature: Nature.DEBITOR, // Correctly use the enum
        isEditable: false,
        createdAt: new Date('2024-05-01 00:00:41.595145+00:00'),
        updatedAt: new Date('2024-05-01 00:00:41.595145+00:00'),
      },
      {
        id: 42,
        uuid: 'bce2bda1-f091-41c8-8707-8580eb723db2',
        name: 'payroll expense',
        type: AccountType.EXPENSE, // Correctly use the enum
        duration: Duration.CURRENT_ASSET, // Correctly use the enum
        nature: Nature.DEBITOR, // Correctly use the enum
        isEditable: false,
        createdAt: new Date('2024-05-01 00:00:42.595145+00:00'),
        updatedAt: new Date('2024-05-01 00:00:42.595145+00:00'),
      },
      {
        id: 43,
        uuid: '8f06331f-e1ef-4341-9a27-ffea9812d368',
        name: 'interest expense',
        type: AccountType.EXPENSE, // Correctly use the enum
        duration: Duration.CURRENT_ASSET, // Correctly use the enum
        nature: Nature.DEBITOR, // Correctly use the enum
        isEditable: false,
        createdAt: new Date('2024-05-01 00:00:43.595145+00:00'),
        updatedAt: new Date('2024-05-01 00:00:43.595145+00:00'),
      },
      {
        id: 44,
        uuid: 'c1d7ca63-7308-43aa-955d-f4d00d6585b5',
        name: 'income tax expense',
        type: AccountType.EXPENSE, // Correctly use the enum
        duration: Duration.CURRENT_ASSET, // Correctly use the enum
        nature: Nature.DEBITOR, // Correctly use the enum
        isEditable: false,
        createdAt: new Date('2024-05-01 00:00:44.595145+00:00'),
        updatedAt: new Date('2024-05-01 00:00:44.595145+00:00'),
      },
      {
        id: 45,
        uuid: '267bf1bd-3928-4427-819c-d4051ef077c0',
        name: 'non-operating expense',
        type: AccountType.EXPENSE, // Correctly use the enum
        duration: Duration.CURRENT_ASSET, // Correctly use the enum
        nature: Nature.DEBITOR, // Correctly use the enum
        isEditable: false,
        createdAt: new Date('2024-05-01 00:00:45.595145+00:00'),
        updatedAt: new Date('2024-05-01 00:00:45.595145+00:00'),
      },
      {
        id: 46,
        uuid: '6cf5e5a3-4f34-4f14-8cac-cfd9ca3b5a71',
        name: 'loss',
        type: AccountType.EXPENSE, // Correctly use the enum
        duration: Duration.CURRENT_ASSET, // Correctly use the enum
        nature: Nature.DEBITOR, // Correctly use the enum
        isEditable: false,
        createdAt: new Date('2024-05-01 00:00:46.595145+00:00'),
        updatedAt: new Date('2024-05-01 00:00:46.595145+00:00'),
      },
      {
        id: 47,
        uuid: '6a3ee3a6-47bc-48dd-9cf4-410774ef7a37',
        name: 'cost of sales',
        type: AccountType.EXPENSE, // Correctly use the enum
        duration: Duration.CURRENT_ASSET, // Correctly use the enum
        nature: Nature.DEBITOR, // Correctly use the enum
        isEditable: false,
        createdAt: new Date('2024-05-01 00:00:47.595145+00:00'),
        updatedAt: new Date('2024-05-01 00:00:47.595145+00:00'),
      },
      {
        id: 48,
        uuid: '6557206b-e251-42f5-a672-fb378b9c7a81',
        name: 'long term investments',
        type: AccountType.ASSET, // Correctly use the enum
        duration: Duration.NON_CURRENT_ASSET, // Correctly use the enum
        nature: Nature.DEBITOR, // Correctly use the enum
        isEditable: false,
        createdAt: new Date('2024-05-01 00:00:48.595145+00:00'),
        updatedAt: new Date('2024-05-01 00:00:48.595145+00:00'),
      },
    ];

    for (const classAcc of classes) {
      const existing = await this.classesRepository.findOneBy({
        name: classAcc.name,
      });
      if (!existing) {
        await this.classesRepository.save(classAcc);
      }
    }
  }
}
