import * as core from '@actions/core'
import * as os from 'os'
import * as security from './security'

async function run(): Promise<void> {
  try {
    if (os.platform() !== 'darwin') {
      throw new Error('Action requires macOS agent.')
    }

    const keychain: string = core.getInput('keychain')
    const createKeychain: boolean = core.getInput('create-keychain') === 'true'
    let keychainPassword: string = core.getInput('keychain-password')
    const p12File: string = core.getInput('p12-file')
    const p12Password: string = core.getInput('p12-password')

    if (keychainPassword === '') {
      // generate a keychain password for the temporary keychain
      keychainPassword = Math.random().toString(36)
    }

    core.setOutput('keychain-password', keychainPassword)
    core.setSecret(keychainPassword)

    await security.installCertInTemporaryKeychain(
      keychain,
      createKeychain,
      keychainPassword,
      p12File,
      p12Password
    )
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
