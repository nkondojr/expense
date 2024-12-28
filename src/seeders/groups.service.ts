import { Not, Raw, Repository } from 'typeorm';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Group, Mode } from '../accounts/entities/group.entity';
import { UpdateGroupDto } from '../accounts/dto/groups/update-group.dto';
import { CreateGroupDto } from '../accounts/dto/groups/create-group.dto';
import { AccountType } from '../accounts/entities/class.entity';
import { isUUID } from 'class-validator';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private readonly groupsRepository: Repository<Group>,
  ) {}

  // ***********************************************************************************************************************************************
  async seed() {
    const groups = [
      {
        id: 1,
        uuid: 'b701c984-33f0-4703-b4a2-82b55f94801f',
        name: 'MALI ZA CHAMA MAKUSANYO',
        code: '100100',
        type: AccountType.ASSET, // Correctly use the enum
        mode: Mode.COLLECTION, // Correctly use the enum
        isEditable: false,
        createdBy: null, // User ID for createdBy
        updatedBy: null, // User ID for updatedBy
        createdAt: new Date('2024-05-01T00:00:49.595Z'),
        updatedAt: new Date('2024-05-01T00:00:49.595Z'),
      },
      {
        id: 2,
        uuid: 'e85a9d9a-3a26-48f1-b2b6-9ee4f74d8cf5',
        name: 'MALI ZA CHAMA',
        code: '1100',
        type: AccountType.ASSET, // Correctly use the enum
        mode: Mode.OPERATION, // Correctly use the enum
        isEditable: false,
        createdBy: null,
        updatedBy: null,
        createdAt: new Date('2024-05-01T00:00:49.595Z'),
        updatedAt: new Date('2024-05-01T00:00:49.595Z'),
      },
      {
        id: 3,
        uuid: '7975533f-2b3d-41cc-b0e4-b386233c03d7',
        name: 'BIDHAA',
        code: '1200',
        type: AccountType.ASSET, // Correctly use the enum
        mode: Mode.OPERATION, // Correctly use the enum
        isEditable: false,
        createdBy: null,
        updatedBy: null,
        createdAt: new Date('2024-05-01T00:00:49.595Z'),
        updatedAt: new Date('2024-05-01T00:00:49.595Z'),
      },
      {
        id: 4,
        uuid: 'e85a9d9a-3a26-48f1-b2b6-9ee4f74d8f5d',
        name: 'BIDHAA NYINGINEZO',
        code: '1300',
        type: AccountType.ASSET, // Correctly use the enum
        mode: Mode.OPERATION, // Correctly use the enum
        isEditable: false,
        createdBy: null,
        updatedBy: null,
        createdAt: new Date('2024-05-01T00:00:49.595Z'),
        updatedAt: new Date('2024-05-01T00:00:49.595Z'),
      },
      {
        id: 5,
        uuid: 'f96c8a55-ded2-47fc-8b3a-872132a63990',
        name: 'MADENI MAKUSANYO',
        code: '200100',
        type: AccountType.LIABILITY, // Correctly use the enum
        mode: Mode.COLLECTION, // Correctly use the enum
        isEditable: false,
        createdBy: null,
        updatedBy: null,
        createdAt: new Date('2024-05-01T00:00:55.595Z'),
        updatedAt: new Date('2024-05-01T00:00:55.595Z'),
      },
      {
        id: 6,
        uuid: 'b12dc62a-2e89-4915-bff9-f88be6262bc4',
        name: 'MADENI',
        code: '2100',
        type: AccountType.LIABILITY, // Correctly use the enum
        mode: Mode.OPERATION, // Correctly use the enum
        isEditable: false,
        createdBy: null,
        updatedBy: null,
        createdAt: new Date('2024-05-01T00:00:55.595Z'),
        updatedAt: new Date('2024-05-01T00:00:55.595Z'),
      },
      {
        id: 7,
        uuid: '400d9d2a-3c21-41e2-8c82-f77369650fb4',
        name: 'MTAJI',
        code: '3100',
        type: AccountType.EQUITY, // Correctly use the enum
        mode: Mode.OPERATION, // Correctly use the enum
        isEditable: false,
        createdBy: null,
        updatedBy: null,
        createdAt: new Date('2024-05-01T00:00:56.595Z'),
        updatedAt: new Date('2024-05-01T00:00:56.595Z'),
      },
      {
        id: 8,
        uuid: '9a1b54a3-4ed3-43c0-87c8-edc276f45327',
        name: 'MAPATO YA MAZAO',
        code: '400100',
        type: AccountType.REVENUE, // Correctly use the enum
        mode: Mode.COLLECTION, // Correctly use the enum
        isEditable: false,
        createdBy: null,
        updatedBy: null,
        createdAt: new Date('2024-05-01T00:00:52.595Z'),
        updatedAt: new Date('2024-05-01T00:00:52.595Z'),
      },
      {
        id: 9,
        uuid: '8f8a7d30-fd85-4d76-b2a9-0be90e5470bc',
        name: 'MAPATO YA NDANI TOZO ZA USHURU WA MAZAO',
        code: '4100',
        type: AccountType.REVENUE, // Correctly use the enum
        mode: Mode.OPERATION, // Correctly use the enum
        isEditable: false,
        createdBy: null,
        updatedBy: null,
        createdAt: new Date('2024-05-01T00:00:54.595Z'),
        updatedAt: new Date('2024-05-01T00:00:54.595Z'),
      },
      {
        id: 10,
        uuid: 'a8396296-94f3-431c-8763-4f281e7ff88a',
        name: 'MAPATO',
        code: '4200',
        type: AccountType.REVENUE, // Correctly use the enum
        mode: Mode.OPERATION, // Correctly use the enum
        isEditable: false,
        createdBy: null,
        updatedBy: null,
        createdAt: new Date('2024-05-01T00:00:51.595Z'),
        updatedAt: new Date('2024-05-01T00:00:51.595Z'),
      },
      {
        id: 11,
        uuid: '78662ce4-c65b-4227-91b1-2f503cc8da6e',
        name: 'MAPATO MENGINEYO',
        code: '4300',
        type: AccountType.REVENUE, // Correctly use the enum
        mode: Mode.OPERATION, // Correctly use the enum
        isEditable: false,
        createdBy: null,
        updatedBy: null,
        createdAt: new Date('2024-05-01T00:00:49.595Z'),
        updatedAt: new Date('2024-05-01T00:00:49.595Z'),
      },
      {
        id: 12,
        uuid: '6b2c1a9e-88b5-455f-990a-062e4e9f6997',
        name: 'MAPATO YA MAENDELEO',
        code: '4400',
        type: AccountType.REVENUE, // Correctly use the enum
        mode: Mode.OPERATION, // Correctly use the enum
        isEditable: false,
        createdBy: null,
        updatedBy: null,
        createdAt: new Date('2024-05-01T00:00:53.595Z'),
        updatedAt: new Date('2024-05-01T00:00:53.595Z'),
      },
      {
        id: 13,
        uuid: '26e3abc5-8808-4cd6-b6ba-c48723ade8a4',
        name: 'GHARAMA MAKUSANYO',
        code: '500100',
        type: AccountType.EXPENSE, // Correctly use the enum
        mode: Mode.COLLECTION, // Correctly use the enum
        isEditable: false,
        createdBy: null,
        updatedBy: null,
        createdAt: new Date('2024-05-01T00:00:56.595Z'),
        updatedAt: new Date('2024-05-01T00:00:56.595Z'),
      },
      {
        id: 14,
        uuid: 'a724e656-1c3e-4589-8726-2d5b282f2821',
        name: 'GHARAMA NYINGINEZO MAKUSANYO',
        code: '500200',
        type: AccountType.EXPENSE, // Correctly use the enum
        mode: Mode.COLLECTION, // Correctly use the enum
        isEditable: false,
        createdBy: null,
        updatedBy: null,
        createdAt: new Date('2024-05-01T00:00:49.595Z'),
        updatedAt: new Date('2024-05-01T00:00:49.595Z'),
      },
      {
        id: 15,
        uuid: '2f62149f-ecfa-42a7-8a0c-22bced86984b',
        name: 'ZIADA/(HASARA) ITOKANAYO NA HESABU ZA MIRADI',
        code: '5100',
        type: AccountType.EXPENSE, // Correctly use the enum
        mode: Mode.OPERATION, // Correctly use the enum
        isEditable: false,
        createdBy: null,
        updatedBy: null,
        createdAt: new Date('2024-05-01T00:00:50.595145+00:00'),
        updatedAt: new Date('2024-05-01T00:00:50.595145+00:00'),
      },
      {
        id: 16,
        uuid: 'c29d7b2a-8af0-4fa7-b824-0e7e18c8bac7',
        name: 'GHARAMA NYINGINEZO',
        code: '5200',
        type: AccountType.EXPENSE, // Correctly use the enum
        mode: Mode.OPERATION, // Correctly use the enum
        isEditable: false,
        createdBy: null,
        updatedBy: null,
        createdAt: new Date('2024-05-01T00:00:56.595145+00:00'),
        updatedAt: new Date('2024-05-01T00:00:56.595145+00:00'),
      },
      {
        id: 17,
        uuid: '810cdcb0-6df6-445f-b7ac-ab551afbe3c6',
        name: 'GHARAMA ZA UTAWALA',
        code: '5300',
        type: AccountType.EXPENSE, // Correctly use the enum
        mode: Mode.OPERATION, // Correctly use the enum
        isEditable: false,
        createdBy: null,
        updatedBy: null,
        createdAt: new Date('2024-05-01T00:00:56.595145+00:00'),
        updatedAt: new Date('2024-05-01T00:00:56.595145+00:00'),
      },
      {
        id: 18,
        uuid: '28fada96-fa23-47c1-aa64-6ac25b46802d',
        name: 'GHARAMA ZA UTUMISHI',
        code: '5400',
        type: AccountType.EXPENSE, // Correctly use the enum
        mode: Mode.OPERATION, // Correctly use the enum
        isEditable: false,
        createdBy: null,
        updatedBy: null,
        createdAt: new Date('2024-05-01T00:00:56.595145+00:00'),
        updatedAt: new Date('2024-05-01T00:00:56.595145+00:00'),
      },
      {
        id: 19,
        uuid: 'f8c2689c-0646-4da3-a70e-9ef6c0c5b215',
        name: 'MATUMIZI YA MAENDELEO-UWEKEZAJI',
        code: '5500',
        type: AccountType.EXPENSE, // Correctly use the enum
        mode: Mode.OPERATION, // Correctly use the enum
        isEditable: false,
        createdBy: null,
        updatedBy: null,
        createdAt: new Date('2024-05-01T00:00:49.595145+00:00'),
        updatedAt: new Date('2024-05-01T00:00:49.595145+00:00'),
      },
    ];

    for (const group of groups) {
      const existing = await this.groupsRepository.findOneBy({
        code: group.code,
      });
      if (!existing) {
        await this.groupsRepository.save({
          id: group.id,
          uuid: group.uuid,
          code: group.code,
          name: group.name,
          type: group.type,
          mode: group.mode,
          isEditable: group.isEditable,
          createdBy: { id: group.createdBy }, // Assuming createdBy is a User entity reference
          updatedBy: { id: group.updatedBy }, // Assuming updatedBy is a User entity reference
          createdAt: group.createdAt,
          updatedAt: group.updatedAt,
        });
      }
    }
  }

  // ***********************************************************************************************************************************************
  async create(createGroupDto: CreateGroupDto): Promise<{ message: string }> {
    let { name, code } = createGroupDto;

    // Trim input values
    name = name?.trim();
    code = code?.trim();

    // Ensure name and code are provided and not empty after trimming
    if (!name || !code) {
      throw new BadRequestException(
        'Name and code are required and cannot be empty or just spaces.',
      );
    }

    // Check for duplicate group by name (case-insensitive and trimmed)
    const existingGroupByName = await this.groupsRepository.findOne({
      where: {
        name: Raw((alias) => `LOWER(TRIM(${alias})) = LOWER(TRIM(:name))`, {
          name,
        }),
      },
    });
    if (existingGroupByName) {
      throw new ConflictException(
        `Account group with name ${name} already exists.`,
      );
    }

    // Check for duplicate group by code (case-insensitive and trimmed)
    const existingGroupByCode = await this.groupsRepository.findOne({
      where: {
        code: Raw((alias) => `LOWER(TRIM(${alias})) = LOWER(TRIM(:code))`, {
          code,
        }),
      },
    });
    if (existingGroupByCode) {
      throw new ConflictException(
        `Account group with code ${code} already exists.`,
      );
    }

    // Create new group entity with trimmed values and save it
    const newGroup = this.groupsRepository.create({
      ...createGroupDto,
      name, // Use trimmed name
      code, // Use trimmed code
    });

    try {
      // Save group to the database
      await this.groupsRepository.save(newGroup);
      return { message: 'Account group created successfully' };
    } catch (error) {
      // Handle unique constraint violation
      if (error.code === '23505') {
        throw new ConflictException('Duplicate account group details found.');
      }
      // Re-throw other errors
      throw error;
    }
  }

  // ***********************************************************************************************************************************************
  async update(
    uuid: string,
    updateGroupDto: UpdateGroupDto,
  ): Promise<{ message: string }> {
    let { name, code, type, mode } = updateGroupDto;

    // Validate UUID format for ID
    if (!isUUID(uuid)) {
      throw new BadRequestException('Invalid UUID format');
    }

    // Fetch the group to be updated
    const group = await this.groupsRepository.findOneBy({ uuid });
    if (!group) {
      throw new NotFoundException(`Account group with ID: ${uuid} not found.`);
    }

    // Validate if the group is editable
    if (!group.isEditable) {
      throw new BadRequestException('This account group cannot be edited.');
    }

    // Trim and normalize fields
    name = name?.trim();
    code = code?.trim();

    // Check for duplicates excluding the current group
    const duplicateCheckConditions = [
      { code: code, uuid: Not(uuid) },
      { name: name, uuid: Not(uuid) },
      { mode: mode, uuid: Not(uuid) },
      { type: type, uuid: Not(uuid) },
    ];

    for (const condition of duplicateCheckConditions) {
      const existingGroup = await this.groupsRepository.findOne({
        where: condition,
      });
      if (existingGroup) {
        if (condition.name) {
          throw new ConflictException(
            `Another account group with name ${name} already exists.`,
          );
        } else if (condition.code) {
          throw new ConflictException(
            `Another account group with code ${code} already exists.`,
          );
        }
      }
    }

    // Update the group entity
    Object.assign(group, updateGroupDto);

    try {
      await this.groupsRepository.save(group);
      return { message: 'Account group updated successfully' };
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Duplicate account group details found.');
      }
      throw error;
    }
  }
}
