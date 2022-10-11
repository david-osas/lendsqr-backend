import {MigrationInterface, QueryRunner} from "typeorm";

export class deleteTransactionCompletedAtColumn1665507689389 implements MigrationInterface {
    name = 'deleteTransactionCompletedAtColumn1665507689389'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`transaction\` DROP COLUMN \`completed_at\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`transaction\` ADD \`completed_at\` datetime NULL`);
    }

}
