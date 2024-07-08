import { foreignKey, mysqlTable, primaryKey, tinyint, varchar } from 'drizzle-orm/mysql-core'
import { relations } from 'drizzle-orm'
import { EPermission } from '../enums/index.js'
import { devices, users } from './index.js'

export const permissions = mysqlTable(
  'permissions',
  {
    deviceId: varchar('device_id', { length: 50 }).notNull(),
    userId: varchar('user_id', { length: 50 }).notNull(),
    permission: tinyint('permission').notNull().default(EPermission.READ),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.deviceId, table.userId] }),
      deviceReference: foreignKey({
        columns: [table.deviceId],
        foreignColumns: [devices.id],
      }).onDelete('cascade'),
      userReference: foreignKey({
        columns: [table.userId],
        foreignColumns: [users.id],
      }).onDelete('cascade'),
    }
  }
)

export const permisionRelations = relations(permissions, ({ one }) => ({
  device: one(devices, {
    fields: [permissions.deviceId],
    references: [devices.id],
  }),
  user: one(users, {
    fields: [permissions.userId],
    references: [users.id],
  }),
}))
