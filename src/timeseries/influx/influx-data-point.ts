/**
 * Shape expected by InfluxDBManager.sendGenericInformation - shared by influx-db.ts and
 * every DataSender subclass's parseData() return value. Split into its own file because
 * influx-db.ts exports its singleton via `export =`, which TypeScript does not allow to
 * coexist with any other exported declaration in the same module.
 */
export interface InfluxDataPoint {
    label: string;
    values: Record<string, number | undefined | null>;
    tags?: Record<string, unknown>;
}
