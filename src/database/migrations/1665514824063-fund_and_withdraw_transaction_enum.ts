import {MigrationInterface, QueryRunner} from "typeorm";

export class fundAndWithdrawTransactionEnum1665514824063 implements MigrationInterface {
    name = 'fundAndWithdrawTransactionEnum1665514824063'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`transaction\` CHANGE \`transaction_type\` \`transaction_type\` enum ('FUND', 'TRANSFER', 'WITHDRAW') NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`transaction\` CHANGE \`transaction_type\` \`transaction_type\` enum ('INFLOW', 'TRANSFER', 'OUTFLOW') NOT NULL`);
    }

}
