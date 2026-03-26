import type { TMessage } from '../types'

const OPEN_ENDED_TIP =
  '请把问题改成可以用是/否回答的形式，例如把"为什么他要这么做"改成"他这么做是为了钱吗？"'

const MULTI_QUESTION_TIP = '一次只能问一个问题哦'
const ROLEPLAY_TIP = '我只能回答是、否、无关'

export const createAssistantReply = (
  question: string,
): { type: TMessage['type']; content: string } => {
  if (/(为什么|怎么|如何)/.test(question)) {
    return { type: 'invalid', content: OPEN_ENDED_TIP }
  }

  const qMarks = (question.match(/[?？]/g) ?? []).length
  if (qMarks >= 2) {
    return { type: 'invalid', content: MULTI_QUESTION_TIP }
  }

  if (/(假设|如果|角色扮演)/.test(question)) {
    return { type: 'invalid', content: ROLEPLAY_TIP }
  }

  const pool: Array<{ type: TMessage['type']; content: string }> = [
    { type: 'yes', content: '✅ 是' },
    { type: 'no', content: '❌ 否' },
    { type: 'irrelevant', content: '🔘 无关' },
  ]

  return pool[Math.floor(Math.random() * pool.length)]!
}

