import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Expense } from "src/expense/entities/expense.entity";

@Entity()
export class Report {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Expense, expense => expense.reports)
    expense: Expense;
}
