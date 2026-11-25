/**
 * GET  /api/app/inbox/:number   one issue, read fresh (GitHub's list can lag a minute)
 * POST /api/app/inbox/:number   {comment} to comment, {comment, decide: true} to decide
 *
 * Deciding posts Paul's words and then adds the `decided` label, in that order, so the agents never see
 * a decided issue without the decision in it. Nothing here closes an issue or removes a label: the
 * agents' own run does that when it delivers the answer (agent-network/src/inbox.ts).
 */
import { guarded, json, one } from '../_guard'
import { addComment, addLabels, getIssue, GithubError } from '../../../_lib/github'
import { integer, readJson, text } from '../../../_lib/validate'
import { notify } from '../../../_lib/notify'

const issueNumber = (raw: string) => integer(raw, 'issue number', { min: 1, max: 1_000_000 })

export const onRequestGet = guarded(async ({ env, params }) => {
  try {
    return json({ issue: await getIssue(env, issueNumber(one(params, 'number'))) })
  } catch (err) {
    if (err instanceof GithubError) return json({ error: err.message }, err.status)
    throw err
  }
})

export const onRequestPost = guarded(async ({ request, env, params }) => {
  const number = issueNumber(one(params, 'number'))
  const body = await readJson(request)
  const comment = text(body.comment, 'comment', { min: 2, max: 8000 })
  const decide = body.decide === true

  try {
    const before = await getIssue(env, number)
    if (decide && before.kind !== 'decision') {
      return json({ error: 'only a decision issue can be decided' }, 409)
    }
    await addComment(env, number, comment)
    if (decide) {
      await addLabels(env, number, ['decided'])
      // The feed keeps a record of what was decided; no push, because Paul is holding the phone.
      await notify(env, {
        kind: 'decision',
        title: `Decided #${number}`,
        body: before.question,
        url: `/app#inbox/${number}`,
        source: 'inbox',
        project: before.project,
        priority: 'low',
      }).catch(() => undefined)
    }
    return json({ ok: true, issue: await getIssue(env, number) })
  } catch (err) {
    if (err instanceof GithubError) return json({ error: err.message }, err.status)
    throw err
  }
})
