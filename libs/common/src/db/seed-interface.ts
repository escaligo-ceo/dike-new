import { DataSource } from "typeorm";

export interface ISeedInterface {
  run(dataSource: DataSource): Promise<void>;
}
