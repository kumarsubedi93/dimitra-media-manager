import { MigrationInterface, QueryRunner } from "typeorm";

export class Newmigration1683590032910 implements MigrationInterface {
    name = 'Newmigration1683590032910'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`media\` (\`id\` int NOT NULL AUTO_INCREMENT, \`file\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`media\``);
    }

}
