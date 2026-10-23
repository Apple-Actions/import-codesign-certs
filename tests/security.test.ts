import {readFileSync} from 'fs'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import {exec, getExecOutput} from '@actions/exec'
import {setOutput} from '@actions/core'
import {
  deleteKeychain,
  installCertIntoTemporaryKeychain
} from '../src/security'

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

const securityArgs = () =>
  vi
    .mocked(exec)
    .mock.calls.filter(([cmd]) => cmd === 'security')
    .map(([, args]) => args)

beforeEach(() => {
  vi.mocked(exec).mockReset().mockResolvedValue(0)
  execOutput
    .mockReset()
    .mockResolvedValue({exitCode: 0, stdout: fixture, stderr: ''})
  vi.mocked(setOutput).mockReset()
})

describe('installCertIntoTemporaryKeychain', () => {
  describe('input validation', () => {
    it('rejects a keychain name that already ends with .keychain', async () => {
      await expect(
        installCertIntoTemporaryKeychain(
          'signing_temp.keychain',
          true,
          'keychain-password',
          'certs.p12',
          'p12-password'
        )
      ).rejects.toThrow('keychain name should not end in .keychain')
      expect(exec).not.toHaveBeenCalled()
    })

    it('rejects an empty p12FilePath', async () => {
      await expect(
        installCertIntoTemporaryKeychain(
          'signing_temp',
          true,
          'keychain-password',
          '',
          'p12-password'
        )
      ).rejects.toThrow('p12FilePath must not be empty')
      expect(exec).not.toHaveBeenCalled()
    })

    it('rejects an empty p12Password', async () => {
      await expect(
        installCertIntoTemporaryKeychain(
          'signing_temp',
          true,
          'keychain-password',
          'certs.p12',
          ''
        )
      ).rejects.toThrow('p12Password must not be empty')
      expect(exec).not.toHaveBeenCalled()
    })

    it('rejects an empty keychainPassword', async () => {
      await expect(
        installCertIntoTemporaryKeychain(
          'signing_temp',
          true,
          '',
          'certs.p12',
          'p12-password'
        )
      ).rejects.toThrow('keychainPassword must not be empty')
      expect(exec).not.toHaveBeenCalled()
    })
  })

  it('runs the full security argv sequence when setupKeychain is true', async () => {
    await installCertIntoTemporaryKeychain(
      'signing_temp',
      true,
      'keychain-password',
      'certs.p12',
      'p12-password'
    )

    expect(securityArgs()).toEqual([
      ['create-keychain', '-p', 'keychain-password', 'signing_temp.keychain'],
      [
        'set-keychain-settings',
        '-lut',
        '21600',
        'signing_temp.keychain'
      ],
      [
        'unlock-keychain',
        '-p',
        'keychain-password',
        'signing_temp.keychain'
      ],
      [
        'import',
        'certs.p12',
        '-k',
        'signing_temp.keychain',
        '-f',
        'pkcs12',
        '-T',
        '/usr/bin/codesign',
        '-T',
        '/usr/bin/security',
        '-T',
        '/usr/bin/pkgbuild',
        '-T',
        '/usr/bin/productbuild',
        '-T',
        '/usr/bin/productsign',
        '-P',
        'p12-password'
      ],
      [
        'set-key-partition-list',
        '-S',
        'apple-tool:,apple:',
        '-k',
        'keychain-password',
        'signing_temp.keychain'
      ],
      [
        'list-keychains',
        '-d',
        'user',
        '-s',
        'signing_temp.keychain',
        'login.keychain'
      ]
    ])

    expect(execOutput).toHaveBeenCalledWith(
      'security',
      ['find-identity', '-v', '-p', 'codesigning', 'signing_temp.keychain'],
      {silent: true}
    )

    const call = vi
      .mocked(setOutput)
      .mock.calls.find(([name]) => name === 'identities')
    expect(JSON.parse(String(call?.[1]))).toEqual(expected)
  })

  it('skips create/settings when setupKeychain is false', async () => {
    await installCertIntoTemporaryKeychain(
      'signing_temp',
      false,
      'keychain-password',
      'certs.p12',
      'p12-password'
    )

    expect(securityArgs()).toEqual([
      [
        'unlock-keychain',
        '-p',
        'keychain-password',
        'signing_temp.keychain'
      ],
      [
        'import',
        'certs.p12',
        '-k',
        'signing_temp.keychain',
        '-f',
        'pkcs12',
        '-T',
        '/usr/bin/codesign',
        '-T',
        '/usr/bin/security',
        '-T',
        '/usr/bin/pkgbuild',
        '-T',
        '/usr/bin/productbuild',
        '-T',
        '/usr/bin/productsign',
        '-P',
        'p12-password'
      ],
      [
        'set-key-partition-list',
        '-S',
        'apple-tool:,apple:',
        '-k',
        'keychain-password',
        'signing_temp.keychain'
      ],
      [
        'list-keychains',
        '-d',
        'user',
        '-s',
        'signing_temp.keychain',
        'login.keychain'
      ]
    ])
  })
})

describe('deleteKeychain', () => {
  it('deletes the keychain via security', async () => {
    await deleteKeychain('signing_temp')
    expect(securityArgs()).toEqual([
      ['delete-keychain', 'signing_temp.keychain']
    ])
  })

  it('rejects a keychain name that already ends with .keychain', async () => {
    await expect(deleteKeychain('signing_temp.keychain')).rejects.toThrow(
      'keychain name should not end in .keychain'
    )
    expect(exec).not.toHaveBeenCalled()
  })
})
