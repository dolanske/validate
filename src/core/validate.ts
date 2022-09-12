import { reactive, watch } from "vue-demi"
import { merge } from "lodash"

import type { Errors, ValidationRule, Rule, ValidationOptions } from "../types"

/**
 *
 * @param form {Computed}
 * @param rules
 * @param options
 * @returns
 */

export function useValidation(
  form: object,
  rules: any,
  { proactive = false, autoclear = false }: ValidationOptions = {}
) {
  // const errors = reactive<Errors>({})
  const root = reactive<{
    anyError: boolean
    pending: boolean
    errors: Errors
  }>({ anyError: false, pending: false, errors: {} })

  if (autoclear) {
    watch(
      form,
      () => {
        reset()
      },
      { deep: true }
    )
  }

  if (proactive) {
    watch(
      form,
      () => {
        validate()
      },
      { deep: true }
    )
  }

  // Initial assignment
  reset()

  function _resetErrorObject() {
    merge(root.errors, {
      ...Object.keys(form).reduce(
        (a, v) => ({
          ...a,
          [v]: {
            id: null,
            value: null,
            invalid: false,
            errors: {}
          }
        }),
        {}
      )
    })

    Object.assign(root, { anyError: false, pending: false })
  }

  function reset() {
    // Resets the form
    _resetErrorObject()
  }

  async function validate(...validateOnly: string[]) {
    reset()

    root.pending = true

    return new Promise<Errors>(async (resolve, reject) => {
      for (const [key, value] of Object.entries(form)) {
        if (!Reflect.has(rules.value, key)) continue

        const itemRules: Rule = rules.value[key]

        for (const [ruleKey, ruleData] of Object.entries(itemRules)) {
          // In case we want to validate only certain fields
          if (validateOnly.length > 0 && !validateOnly.includes(ruleKey))
            continue

          const { label, validate, _skip }: ValidationRule = ruleData

          if (_skip) {
            continue
          }

          const passed = await validate(value)

          root.errors[key].id = key
          root.errors[key].value = value

          if (!passed) {
            root.anyError = true
            root.errors[key].invalid = true
            root.errors[key].errors[ruleKey] = label(value)
          }
        }
      }

      // Expose errors object either way
      if (root.anyError) {
        reject(root.errors)
      } else {
        resolve(root.errors)
      }

      root.pending = false
    })
  }

  return {
    errors: root.errors,
    reset,
    validate,
    state: root
  }
}