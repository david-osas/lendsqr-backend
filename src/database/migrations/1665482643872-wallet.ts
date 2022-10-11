import {MigrationInterface, QueryRunner} from "typeorm";

export class wallet1665482643872 implements MigrationInterface {
    name = 'wallet1665482643872'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`wallet\` (\`id\` varchar(36) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_72548a47ac4a996cd254b08252\` (\`user_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_72548a47ac4a996cd254b08252\` ON \`wallet\``);
        await queryRunner.query(`DROP TABLE \`wallet\``);
    }

}
