import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Expense } from "src/expense/entities/expense.entity";
import { Organization } from "src/organizations/entities/organization.entity";

@Entity()
export class Report {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Organization, organization => organization.reports)
    organization: Organization;

    @ManyToOne(() => Expense, expense => expense.reports)
    expense: Expense;
}
