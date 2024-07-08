import Schema from 'async-validator'

export function useValidator(schema) {
  const validator = new Schema(schema)
  return validator
}
