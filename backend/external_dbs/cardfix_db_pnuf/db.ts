import { SQLDatabase } from "encore.dev/storage/sqldb";

export default new SQLDatabase("cardfix_db_pnuf", {migrations: "./migrations"});
