import { foreignKey, int, mysqlTable, varchar } from 'drizzle-orm/mysql-core'
import { relations } from 'drizzle-orm'
import { ulid } from 'ulid'
import { devices } from './index.js'

export const schedules = mysqlTable(
  'schedules',
  {
    id: varchar('id', { length: 50 })
      .primaryKey()
      .$default(() => ulid()),
    deviceId: varchar('device_id', { length: 50 }).notNull(),
    startJobId: varchar('start_job_id', { length: 25 }).notNull(),
    endJobId: varchar('end_job_id', { length: 25 }).notNull(),
    time: varchar('time', { length: 5 }).notNull(),
    duration: int('duration').notNull(),
    weekdays: varchar('weekdays', { length: 50 }).notNull(),
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

export const schedulesRelations = relations(schedules, ({ one }) => ({
  device: one(devices, {
    fields: [schedules.deviceId],
    references: [devices.id],
  }),
}))
