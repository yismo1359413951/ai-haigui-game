import type { TApiResponse, TStoryPreview } from '../types'

// 生产环境请求走同域 `/api/*`，避免移动端直连后端被网络策略拦截。
// 开发环境由 `vite.config.ts` 的 proxy 处理 `/api/*` 到本地后端。
const BASE_URL = ''

const parseJsonSafe = async <T>(response: Response): Promise<T> => {
  const text = await response.text()
  try {
    return JSON.parse(text) as T
  } catch {
    const contentType = response.headers.get('content-type') ?? ''
    // 不直接把原始响应全塞进 Toast，避免太长；同时给控制台留线索方便你排查
    const preview = text.replace(/\s+/g, ' ').slice(0, 120)
    console.error('[api] non-json response', {
      status: response.status,
      contentType,
      preview,
    })
    throw new Error('请求失败：后端返回异常内容（通常是后端未启动或路径不匹配）')
  }
}

export const getStories = async (): Promise<TStoryPreview[]> => {
  const response = await fetch(`${BASE_URL}/api/stories`)
  const data: TApiResponse<TStoryPreview[]> = await parseJsonSafe<
    TApiResponse<TStoryPreview[]>
  >(response)
  if (!data.success || !data.data) {
    throw new Error(data.error?.message ?? '获取题目失败')
  }
  return data.data
}

export async function askAI(
  question: string,
  storyId: string,
): Promise<{ answer: string; tip?: string }> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 15000)

  try {
    const response = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, storyId }),
      signal: controller.signal,
    })

    if (response.status === 429) {
      throw new Error('发送太频繁，请稍等几秒')
    }

    const data: TApiResponse<{ answer: string; tip?: string }> =
      await parseJsonSafe<TApiResponse<{ answer: string; tip?: string }>>(
        response,
      )

    if (!data.success || !data.data) {
      throw new Error(data.error?.message ?? '请求失败，请重试')
    }

    return data.data
  } catch (err) {
    const message =
      err instanceof Error && err.name === 'AbortError'
        ? '网络开小差了，请重新发送'
        : err instanceof Error
          ? err.message
          : '出错了，请重试'
    throw new Error(message)
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function judgeAnswer(
  storyId: string,
  answer?: string,
): Promise<{
  result: 'won' | 'partial' | 'wrong' | 'revealed'
  bottom?: string
  missing?: number
}> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 15000)

  try {
    const response = await fetch(`${BASE_URL}/api/judge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        storyId,
        answer,
        action: answer ? 'judge' : 'giveup',
      }),
      signal: controller.signal,
    })

    if (response.status === 429) {
      throw new Error('发送太频繁，请稍等几秒')
    }

    const data: TApiResponse<{
      result: 'won' | 'partial' | 'wrong' | 'revealed'
      bottom?: string
      missing?: number
    }> = await parseJsonSafe<
      TApiResponse<{
        result: 'won' | 'partial' | 'wrong' | 'revealed'
        bottom?: string
        missing?: number
      }>
    >(response)

    if (!data.success || !data.data) {
      throw new Error(data.error?.message ?? '请求失败，请重试')
    }
    return data.data
  } catch (err) {
    const message =
      err instanceof Error && err.name === 'AbortError'
        ? '网络开小差了，请重试'
        : err instanceof Error
          ? err.message
          : '出错了，请重试'
    throw new Error(message)
  } finally {
    clearTimeout(timeoutId)
  }
}
