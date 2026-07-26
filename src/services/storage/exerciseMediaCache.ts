const EXERCISE_MEDIA_CACHE_NAME =
  'gymcontrol-exercise-media-v1'

function supportsCacheStorage() {
  return (
    typeof window !== 'undefined' &&
    'caches' in window
  )
}

function createExerciseRequest(url: string) {
  return new Request(url, {
    method: 'GET',
    mode: 'cors',
    credentials: 'omit',
    cache: 'no-cache',
  })
}

async function fetchExerciseGif(
  url: string,
): Promise<Response | null> {
  try {
    const response = await fetch(
      createExerciseRequest(url),
    )

    if (!response.ok) {
      return null
    }

    const contentType =
      response.headers.get('content-type') ?? ''

    if (
      contentType &&
      !contentType.startsWith('image/')
    ) {
      return null
    }

    return response
  } catch (error) {
    console.warn(
      `Não foi possível baixar o GIF: ${url}`,
      error,
    )

    return null
  }
}

export async function isExerciseGifCached(
  url: string,
): Promise<boolean> {
  if (!supportsCacheStorage()) {
    return false
  }

  try {
    const cache = await caches.open(
      EXERCISE_MEDIA_CACHE_NAME,
    )

    const cachedResponse = await cache.match(
      createExerciseRequest(url),
    )

    return Boolean(cachedResponse)
  } catch (error) {
    console.warn(
      'Não foi possível consultar o cache de exercícios.',
      error,
    )

    return false
  }
}

export async function cacheExerciseGif(
  url?: string,
): Promise<boolean> {
  if (!url) {
    return false
  }

  if (!supportsCacheStorage()) {
    return false
  }

  try {
    const cache = await caches.open(
      EXERCISE_MEDIA_CACHE_NAME,
    )

    const request = createExerciseRequest(url)
    const cachedResponse = await cache.match(request)

    if (cachedResponse) {
      return true
    }

    const networkResponse = await fetchExerciseGif(url)

    if (!networkResponse) {
      return false
    }

    await cache.put(
      request,
      networkResponse.clone(),
    )

    return true
  } catch (error) {
    console.warn(
      `Não foi possível armazenar o GIF: ${url}`,
      error,
    )

    return false
  }
}

export async function getExerciseGifObjectUrl(
  url?: string,
): Promise<string | null> {
  if (!url) {
    return null
  }

  try {
    if (supportsCacheStorage()) {
      const cache = await caches.open(
        EXERCISE_MEDIA_CACHE_NAME,
      )

      const request = createExerciseRequest(url)
      const cachedResponse = await cache.match(request)

      if (cachedResponse) {
        const cachedBlob = await cachedResponse.blob()

        return URL.createObjectURL(cachedBlob)
      }
    }

    const networkResponse = await fetchExerciseGif(url)

    if (!networkResponse) {
      return null
    }

    if (supportsCacheStorage()) {
      try {
        const cache = await caches.open(
          EXERCISE_MEDIA_CACHE_NAME,
        )

        await cache.put(
          createExerciseRequest(url),
          networkResponse.clone(),
        )
      } catch (cacheError) {
        console.warn(
          'O GIF foi carregado, mas não pôde ser salvo offline.',
          cacheError,
        )
      }
    }

    const networkBlob = await networkResponse.blob()

    return URL.createObjectURL(networkBlob)
  } catch (error) {
    console.warn(
      `Não foi possível preparar o GIF: ${url}`,
      error,
    )

    return null
  }
}

export async function removeExerciseGif(
  url?: string,
): Promise<void> {
  if (!url || !supportsCacheStorage()) {
    return
  }

  try {
    const cache = await caches.open(
      EXERCISE_MEDIA_CACHE_NAME,
    )

    await cache.delete(createExerciseRequest(url))
  } catch (error) {
    console.warn(
      `Não foi possível remover o GIF: ${url}`,
      error,
    )
  }
}

export async function clearExerciseGifCache(): Promise<void> {
  if (!supportsCacheStorage()) {
    return
  }

  try {
    await caches.delete(EXERCISE_MEDIA_CACHE_NAME)
  } catch (error) {
    console.warn(
      'Não foi possível limpar o cache de GIFs.',
      error,
    )
  }
}