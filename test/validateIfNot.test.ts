import { expect, test } from 'vitest'
import { computed, reactive } from 'vue-demi'
import { minLength, type, useValidation, validateIfNot } from '../index'

test('[Helpers] validateIfNot', () => {
  const form = reactive({
    first: 'Hello world',
    second: [1, 2, 3, 4],
  })

  const rules = computed(() => ({
    first: {
      shouldValidate: validateIfNot(false, type.num),
    },
    second: {
      shouldNotValidate: validateIfNot(
        () => typeof form.first === 'number',
        minLength(2),
      ),
    },
  }))

  const { validate } = useValidation(form, rules)

  validate()
    .then((e) => {
      expect(e.second.invalid).toBeFalsy()
    })
    .catch((e) => {
      expect(e.first.invalid).toBeTruthy()
    })
})
