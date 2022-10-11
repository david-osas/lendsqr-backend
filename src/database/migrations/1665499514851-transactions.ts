import {MigrationInterface, QueryRunner} from "typeorm";

export class transactions1665499514851 implements MigrationInterface {
    name = 'transactions1665499514851'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`transaction\` (\`id\` varchar(36) NOT NULL, \`amount\` decimal(10,2) NOT NULL, \`sender_id\` varchar(255) NOT NULL, \`receiver_id\` varchar(255) NOT NULL, \`completed_at\` datetime NULL, \`transaction_type\` enum ('INFLOW', 'TRANSFER', 'OUTFLOW') NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`transaction\``);
    }

}
