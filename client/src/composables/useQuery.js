import { omit } from 'lodash-es'
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export function useQuery(options = {}) {
  const route = useRoute()
  const router = useRouter()

  const query = ref({
    ...route.query,
    limit: Number(route.query.limit) || 10,
    page: Number(route.query.page) || 1,
  })

  watch(
    query,
    function (newQuery) {
      if (options?.exclude && options.exclude.length > 0) {
        const omitQuery = omit(newQuery, options.exclude)
        router.push({
          query: {
            ...omitQuery,
          },
        })
        return
      }
      router.push({
        query: {
          ...newQuery,
        },
      })
    },
    {
      deep: true,
      immediate: true,
    }
  )

  return { query }
}
