import { foreignKey, int, mysqlTable, tinyint, varchar } from 'drizzle-orm/mysql-core'
import { relations } from 'drizzle-orm'
import { ulid } from 'ulid'
import { devices } from './index.js'

export const deviceProperties = mysqlTable(
  'device_properties',
  {
    id: varchar('id', { length: 50 })
      .primaryKey()
      .$default(() => ulid()),
    deviceId: varchar('device_id', { length: 50 }).notNull(),
    brightness: int('brightness').notNull().default(100), // 0% to 100%
    state: tinyint('state').default(0),
    controlState: tinyint('control_state').default(0),
  },
  (table) => {
    return {
      deviceReference: foreignKey({
        columns: [table.deviceId],
        foreignColumns: [devices.id],
      }).onDelete('cascade'),
    }
  }
)

export const devicePropertiesRelations = relations(deviceProperties, ({ one }) => ({}))
