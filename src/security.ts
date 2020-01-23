import * as core from '@actions/core'
import * as exec from '@actions/exec'
import {ExecOptions} from '@actions/exec/lib/interfaces'

export async function installCertInTemporaryKeychain(
  keychain: string,
  setupKeychain: boolean,
  keychainPassword: string,
  p12FilePath: string,
  p12Password: string
): Promise<void> {
  let output = ''
  const options: ExecOptions = {}
  options.listeners = {
    stdout: (data: Buffer) => {
      output += data.toString()
    }
  }

  const tempKeychain = `${keychain}.keychain`
  if (setupKeychain) {
    await createKeychain(tempKeychain, keychainPassword, options)
  }
  await unlockKeychain(tempKeychain, keychainPassword, options)
  await importPkcs12(tempKeychain, p12FilePath, p12Password, options)

  core.debug(output)
  core.setOutput('security-response', output)
}

/**
 * Delete the specified keychain
 * @param keychain
 * @param options Execution options (optional)
 */
export async function deleteKeychain(
  keychain: string,
  options?: ExecOptions
): Promise<void> {
  await exec.exec(
    'security',
    ['delete-keychain', `${keychain}.keychain`],
    options
  )
}

/**
 * Import a PKCS12 file into the keychain
 * @param keychain The name of the keychain to import the P12 file into.
 * @param p12FilePath The path to the .p12 file
 * @param p12Password The password used to decrypt the .p12 file.
 * @param options Execution options (optional)
 */
async function importPkcs12(
  keychain: string,
  p12FilePath: string,
  p12Password: string,
  options?: ExecOptions
): Promise<void> {
  const importArgs: string[] = [
    'import',
    p12FilePath,
    '-k',
    keychain,
    '-f',
    'pkcs12',
    // This option allows any application to read keys.
    // This would be insecure if the keychain was retained but GitHub action
    // VMs are thrown away after use.
    '-A',
    '-P',
    p12Password
  ]

  await exec.exec('security', importArgs, options)
}

async function unlockKeychain(
  keychain: string,
  password: string,
  options: ExecOptions
): Promise<void> {
  const args: string[] = ['unlock-keychain', '-p', password, keychain]
  await exec.exec('security', args, options)
}

async function createKeychain(
  keychain: string,
  password: string,
  options: ExecOptions
): Promise<void> {
  const createArgs: string[] = ['create-keychain', '-p', password, keychain]
  await exec.exec('security', createArgs, options)

  // Set automatic keychain lock timeout to 6 hours.
  const setSettingsArgs: string[] = [
    'set-keychain-settings',
    '-lut',
    '21600',
    keychain
  ]
  await exec.exec('security', setSettingsArgs, options)
}
