import {readFileSync} from 'fs'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import {exec, getExecOutput} from '@actions/exec'
import {setOutput} from '@actions/core'
import {listIdentities, parseIdentities} from '../src/identities'
import {installCertIntoTemporaryKeychain} from '../src/security'

vi.mock('@actions/exec', () => ({exec: vi.fn(), getExecOutput: vi.fn()}))
vi.mock('@actions/core', () => ({setOutput: vi.fn()}))

const execOutput = vi.mocked(getExecOutput)
const fixture = readFileSync('tests/fixtures/find-identity.txt', 'utf8')
const expected = [
  {
    hash: '228DB28F73E1F5FC0F5E1351E1EFE33235B3268B',
    name: 'Developer ID Application: Example Org (ABCDE12345)'
  },
  {
    hash: 'AB756E2BD9CECCE343DDB291FF45FC531E2EE1F7',
    name: 'Developer ID Application: Example Org (ABCDE12345)'
  },
  {
    hash: '3EF0C1B2A3948576D6E5F4031B2A3C4D5E6F9132',
    name: 'Apple Distribution: Example Org (ABCDE12345)'
  },
  {
    hash: '4A5B6C7D8E9F0A1B2C3D4E5F6A7B8C9D0E1F2A3B',
    name: '3rd Party Mac Developer Installer: Example Org (ABCDE12345)'
  }
]

beforeEach(() => {
  vi.mocked(exec).mockReset().mockResolvedValue(0)
  execOutput
    .mockReset()
    .mockResolvedValue({exitCode: 0, stdout: fixture, stderr: ''})
  vi.mocked(setOutput).mockReset()
})

describe('parseIdentities', () => {
  it('keeps renewed certificates with the same name apart by hash', () => {
    expect(parseIdentities(fixture)).toEqual(expected)
  })

  it('ignores the summary line and repeated hashes', () => {
    const repeated = `${fixture}  5) ${expected[0].hash} "${expected[0].name}"\n`
    expect(parseIdentities(repeated)).toEqual(expected)
    expect(parseIdentities('     0 valid identities found\n')).toEqual([])
  })
})

describe('listIdentities', () => {
  it('lists only valid code-signing identities in the given keychain', async () => {
    expect(await listIdentities('signing_temp.keychain')).toEqual(expected)
    expect(execOutput).toHaveBeenCalledWith(
      'security',
      ['find-identity', '-v', '-p', 'codesigning', 'signing_temp.keychain'],
      {silent: true}
    )
  })
})

describe('installCertIntoTemporaryKeychain', () => {
  it('sets the identities output for the imported keychain', async () => {
    await installCertIntoTemporaryKeychain(
      'signing_temp',
      true,
      'keychain-password',
      'certs.p12',
      'p12-password'
    )

    const [, args] = execOutput.mock.calls[0]
    expect(args?.at(-1)).toBe('signing_temp.keychain')
    const call = vi
      .mocked(setOutput)
      .mock.calls.find(([name]) => name === 'identities')
    const identities = JSON.parse(String(call?.[1]))
    expect(identities).toEqual(expected)
    expect(new Set(identities.map((id: {hash: string}) => id.hash)).size).toBe(
      identities.length
    )
  })
})
