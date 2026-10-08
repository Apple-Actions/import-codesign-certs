import {getExecOutput} from '@actions/exec'

export interface Identity {
  hash: string
  name: string
}

const IDENTITY_LINE = /^\s*\d+\)\s+([0-9A-F]{40})\s+"(.+)"\s*$/

/**
 * Parse the output of `security find-identity`.
 * @param text The command's stdout.
 * @returns The identities, one per SHA-1 hash, in the order listed.
 */
export function parseIdentities(text: string): Identity[] {
  const identities = new Map<string, Identity>()
  for (const line of text.split('\n')) {
    const match = IDENTITY_LINE.exec(line)
    if (match && !identities.has(match[1])) {
      identities.set(match[1], {hash: match[1], name: match[2]})
    }
  }
  return [...identities.values()]
}

/**
 * List the valid code-signing identities in a keychain.
 * @param keychain The keychain to search, including its .keychain suffix.
 */
export async function listIdentities(keychain: string): Promise<Identity[]> {
  const {stdout} = await getExecOutput(
    'security',
    ['find-identity', '-v', '-p', 'codesigning', keychain],
    {silent: true}
  )
  return parseIdentities(stdout)
}
