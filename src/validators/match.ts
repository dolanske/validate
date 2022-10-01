import { isNil } from 'lodash'
import { SKIP_PROTO } from '../shared'
import type { ValidationRule } from '../types'

/**
 * @Rule Input must pass the provided regex test
 * @param regex Regex validation rule
 */

const match = (regex: RegExp | string): ValidationRule => {
  const r = typeof regex === 'string' ? new RegExp(regex) : regex

  return {
    _skip: false,
    validate(value: string): boolean {
      if (isNil(value))
        return false

      return r.test(value)
    },
    /* c8 ignore next 3 */
    label(): string {
      return 'Value does not match the provided rule.'
    },
  }
}

match.skip = SKIP_PROTO

export { match }
