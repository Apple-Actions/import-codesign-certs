import * as core from '@actions/core'
import * as os from 'os'
import * as fs from 'fs'
import * as tmp from 'tmp'
import * as security from './security'

async function run(): Promise<void> {
  try {
    if (os.platform() !== 'darwin') {
      throw new Error('Action requires macOS agent.')
    }

    const keychain: string = core.getInput('keychain')
    const createKeychain: boolean = core.getInput('create-keychain') === 'true'
    let keychainPassword: string = core.getInput('keychain-password')
    let p12Filepath: string = core.getInput('p12-filepath')
    const p12FileBase64: string = core.getInput('p12-file-base64')
    const p12Password: string = core.getInput('p12-password')

    if (p12Filepath === '' && p12FileBase64 === '') {
      throw new Error(
        'At least one of p12-filepath or p12-file-base64 must be provided'
      )
    }

    if (p12FileBase64 !== '') {
      const buffer = Buffer.from(p12FileBase64, 'base64')
      const tempFile = tmp.fileSync()
      p12Filepath = tempFile.name
      fs.writeFileSync(p12Filepath, buffer)
    }

    if (keychainPassword === '') {
      // generate a keychain password for the temporary keychain
      keychainPassword = Math.random().toString(36)
    }

    core.setOutput('keychain-password', keychainPassword)
    core.setSecret(keychainPassword)

    await security.installCertIntoTemporaryKeychain(
      keychain,
      createKeychain,
      keychainPassword,
      p12Filepath,
      p12Password
    )
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
