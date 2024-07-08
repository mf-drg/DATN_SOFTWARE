import { index, mysqlTable, tinyint, uniqueIndex, varchar } from 'drizzle-orm/mysql-core'
import { relations } from 'drizzle-orm'
import { ulid } from 'ulid'
import { EUserRole } from '../enums/index.js'
import { permissions } from './index.js'

export const users = mysqlTable(
  'users',
  {
    id: varchar('id', { length: 50 })
      .primaryKey()
      .$default(() => ulid()),
    userName: varchar('user_name', { length: 256 }).notNull(),
    email: varchar('email', { length: 256 }).notNull(),
    phoneNumber: varchar('phone_number', { length: 256 }),
    password: varchar('password', { length: 256 }).notNull(),
    role: tinyint('role').default(EUserRole.NORMAL),
  },
  (table) => {
    return {
      userNameIdx: index('user_name_idx').on(table.userName),
      emailIdx: uniqueIndex('email_idx').on(table.email),
    }
  }
)

export const usersRelations = relations(users, ({ one, many }) => ({
  permissions: many(permissions),
}))
