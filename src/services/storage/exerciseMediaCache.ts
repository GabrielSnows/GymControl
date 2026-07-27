import { openDB, type DBSchema } from 'idb'

const EXERCISE_MEDIA_CACHE_NAME =
  'gymcontrol-exercise-media-v2'

const EXERCISE_MEDIA_DATABASE_NAME =
  'gymcontrol-exercise-media'

const EXERCISE_MEDIA_DATABASE_VERSION = 1

const EXERCISE_MEDIA_STORE_NAME = 'exerciseMedia'

type StoredExerciseMedia = {
  url: string
  blob: Blob
  contentType: string
  cachedAt: string
}

interface ExerciseMediaDatabase extends DBSchema {
  exerciseMedia: {
    key: string
    value: StoredExerciseMedia
  }
}

/*
 * Mantém o Object URL disponível enquanto o aplicativo estiver aberto.
 * Isso evita reconstruir o mesmo arquivo toda vez que o componente monta.
 */
const exerciseObjectUrls = new Map<string, string>()

/*
 * Evita que dois componentes iniciem simultaneamente o download
 * do mesmo GIF.
 */
const pendingGifRequests = new Map<
  string,
  Promise<string | null>
>()

const exerciseMediaDatabasePromise =
  openDB<ExerciseMediaDatabase>(
    EXERCISE_MEDIA_DATABASE_NAME,
    EXERCISE_MEDIA_DATABASE_VERSION,
    {
      upgrade(database) {
        if (
          !database.objectStoreNames.contains(
            EXERCISE_MEDIA_STORE_NAME,
          )
        ) {
          database.createObjectStore(
            EXERCISE_MEDIA_STORE_NAME,
            {
              keyPath: 'url',
            },
          )
        }
      },
    },
  )

function supportsCacheStorage() {
  return (
    typeof window !== 'undefined' &&
    window.isSecureContext &&
    'caches' in window
  )
}

function createExerciseRequest(url: string) {
  return new Request(url, {
    method: 'GET',
    credentials: 'same-origin',

    /*
     * Não use "no-cache" aqui.
     * O comportamento padrão permite reaproveitar o cache HTTP.
     */
    cache: 'default',
  })
}

function isImageResponse(response: Response) {
  const contentType =
    response.headers.get('content-type') ?? ''

  return (
    response.ok &&
    (
      contentType.startsWith('image/') ||
      contentType === ''
    )
  )
}

async function fetchExerciseGif(
  url: string,
): Promise<Response | null> {
  try {
    const response = await fetch(
      createExerciseRequest(url),
    )

    if (!isImageResponse(response)) {
      console.warn(
        `A resposta recebida não é um GIF válido: ${url}`,
      )

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

async function getGifFromCacheStorage(
  url: string,
): Promise<Blob | null> {
  if (!supportsCacheStorage()) {
    return null
  }

  try {
    const cache = await caches.open(
      EXERCISE_MEDIA_CACHE_NAME,
    )

    const cachedResponse = await cache.match(
      createExerciseRequest(url),
    )

    if (!cachedResponse) {
      return null
    }

    return cachedResponse.blob()
  } catch (error) {
    console.warn(
      'Não foi possível consultar o Cache Storage.',
      error,
    )

    return null
  }
}

async function saveGifToCacheStorage(
  url: string,
  response: Response,
): Promise<boolean> {
  if (!supportsCacheStorage()) {
    return false
  }

  try {
    const cache = await caches.open(
      EXERCISE_MEDIA_CACHE_NAME,
    )

    await cache.put(
      createExerciseRequest(url),
      response.clone(),
    )

    return true
  } catch (error) {
    console.warn(
      'Não foi possível salvar o GIF no Cache Storage.',
      error,
    )

    return false
  }
}

async function getGifFromIndexedDb(
  url: string,
): Promise<Blob | null> {
  try {
    const database =
      await exerciseMediaDatabasePromise

    const storedMedia = await database.get(
      EXERCISE_MEDIA_STORE_NAME,
      url,
    )

    return storedMedia?.blob ?? null
  } catch (error) {
    console.warn(
      'Não foi possível consultar o GIF no IndexedDB.',
      error,
    )

    return null
  }
}

async function saveGifToIndexedDb(
  url: string,
  blob: Blob,
): Promise<void> {
  try {
    const database =
      await exerciseMediaDatabasePromise

    await database.put(
      EXERCISE_MEDIA_STORE_NAME,
      {
        url,
        blob,
        contentType: blob.type || 'image/gif',
        cachedAt: new Date().toISOString(),
      },
    )
  } catch (error) {
    console.warn(
      'Não foi possível salvar o GIF no IndexedDB.',
      error,
    )
  }
}

async function getStoredGifBlob(
  url: string,
): Promise<Blob | null> {
  /*
   * Em produção HTTPS, Cache Storage será consultado primeiro.
   * Em desenvolvimento pelo IP local, o IndexedDB será usado.
   */
  const cacheStorageBlob =
    await getGifFromCacheStorage(url)

  if (cacheStorageBlob) {
    return cacheStorageBlob
  }

  return getGifFromIndexedDb(url)
}

async function downloadAndStoreGif(
  url: string,
): Promise<Blob | null> {
  const networkResponse =
    await fetchExerciseGif(url)

  if (!networkResponse) {
    return null
  }

  /*
   * O clone precisa ser criado antes de consumir o body
   * da resposta original.
   */
  const responseForCache =
    networkResponse.clone()

  const blob = await networkResponse.blob()

  await Promise.all([
    saveGifToCacheStorage(
      url,
      responseForCache,
    ),

    saveGifToIndexedDb(url, blob),
  ])

  return blob
}

function createAndRememberObjectUrl(
  url: string,
  blob: Blob,
) {
  const currentObjectUrl =
    exerciseObjectUrls.get(url)

  if (currentObjectUrl) {
    return currentObjectUrl
  }

  const objectUrl =
    URL.createObjectURL(blob)

  exerciseObjectUrls.set(url, objectUrl)

  return objectUrl
}

async function prepareExerciseGif(
  url: string,
): Promise<string | null> {
  const currentObjectUrl =
    exerciseObjectUrls.get(url)

  if (currentObjectUrl) {
    return currentObjectUrl
  }

  const storedBlob =
    await getStoredGifBlob(url)

  if (storedBlob) {
    return createAndRememberObjectUrl(
      url,
      storedBlob,
    )
  }

  const downloadedBlob =
    await downloadAndStoreGif(url)

  if (!downloadedBlob) {
    return null
  }

  return createAndRememberObjectUrl(
    url,
    downloadedBlob,
  )
}

export async function isExerciseGifCached(
  url: string,
): Promise<boolean> {
  if (exerciseObjectUrls.has(url)) {
    return true
  }

  const storedBlob =
    await getStoredGifBlob(url)

  return Boolean(storedBlob)
}

export async function cacheExerciseGif(
  url?: string,
): Promise<boolean> {
  if (!url) {
    return false
  }

  const objectUrl =
    await getExerciseGifObjectUrl(url)

  return Boolean(objectUrl)
}

export async function getExerciseGifObjectUrl(
  url?: string,
): Promise<string | null> {
  if (!url) {
    return null
  }

  const existingObjectUrl =
    exerciseObjectUrls.get(url)

  if (existingObjectUrl) {
    return existingObjectUrl
  }

  const existingRequest =
    pendingGifRequests.get(url)

  if (existingRequest) {
    return existingRequest
  }

  const requestPromise =
    prepareExerciseGif(url).finally(() => {
      pendingGifRequests.delete(url)
    })

  pendingGifRequests.set(
    url,
    requestPromise,
  )

  return requestPromise
}

export async function removeExerciseGif(
  url?: string,
): Promise<void> {
  if (!url) {
    return
  }

  const objectUrl =
    exerciseObjectUrls.get(url)

  if (objectUrl) {
    URL.revokeObjectURL(objectUrl)
    exerciseObjectUrls.delete(url)
  }

  pendingGifRequests.delete(url)

  try {
    if (supportsCacheStorage()) {
      const cache = await caches.open(
        EXERCISE_MEDIA_CACHE_NAME,
      )

      await cache.delete(
        createExerciseRequest(url),
      )
    }

    const database =
      await exerciseMediaDatabasePromise

    await database.delete(
      EXERCISE_MEDIA_STORE_NAME,
      url,
    )
  } catch (error) {
    console.warn(
      `Não foi possível remover o GIF: ${url}`,
      error,
    )
  }
}

export async function clearExerciseGifCache(): Promise<void> {
  for (const objectUrl of exerciseObjectUrls.values()) {
    URL.revokeObjectURL(objectUrl)
  }

  exerciseObjectUrls.clear()
  pendingGifRequests.clear()

  try {
    if (supportsCacheStorage()) {
      await caches.delete(
        EXERCISE_MEDIA_CACHE_NAME,
      )
    }

    const database =
      await exerciseMediaDatabasePromise

    await database.clear(
      EXERCISE_MEDIA_STORE_NAME,
    )
  } catch (error) {
    console.warn(
      'Não foi possível limpar o cache de GIFs.',
      error,
    )
  }
}