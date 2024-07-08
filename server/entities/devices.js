import { foreignKey, mysqlTable, timestamp, tinyint, uniqueIndex, varchar } from 'drizzle-orm/mysql-core'
import { relations } from 'drizzle-orm'
import { ulid } from 'ulid'
import { EDeviceType, EDeviceStatus } from '../enums/index.js'
import { deviceProperties, schedules } from './index.js'

export const devices = mysqlTable(
  'devices',
  {
    id: varchar('id', { length: 50 })
      .primaryKey()
      .$default(() => ulid()),
    gatewayId: varchar('gateway_id', { length: 50 }),
    hardwareId: varchar('hardware_id', { length: 50 }).notNull(),
    name: varchar('name', { length: 256 }).notNull(),
    userName: varchar('user_name', { length: 50 }),
    password: varchar('password', { length: 50 }),
    tag: varchar('tag', { length: 256 }),
    type: tinyint('type').default(EDeviceType.LIGHT),
    status: tinyint('status').default(EDeviceStatus.OFFLINE),
    macAddress: varchar('mac_address', { length: 25 }),
    ipAddress: varchar('ip_address', { length: 50 }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => {
    return {
      gatewayReference: foreignKey({
        columns: [table.gatewayId],
        foreignColumns: [table.id],
      }).onDelete('cascade'),
      hardwareIdIdx: uniqueIndex('gateway_id_idx').on(table.hardwareId),
      macAddressIdx: uniqueIndex('mac_address_idx').on(table.macAddress),
    }
  }
)

export const devicesRelations = relations(devices, ({ one, many }) => ({
  gateway: one(devices, {
    fields: [devices.gatewayId],
    references: [devices.id],
  }),
  subDevices: many(devices),
  schedules: many(schedules),
  property: one(deviceProperties, {
    fields: [devices.id],
    references: [deviceProperties.deviceId],
  }),
}))
