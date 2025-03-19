import {getInput, setFailed, setOutput, setSecret, warning} from '@actions/core'
import {platform} from 'os'
import {writeFileSync} from 'fs'
import {fileSync} from 'tmp'
import {deleteKeychain, installCertIntoTemporaryKeychain} from './security'

async function run(): Promise<void> {
  try {
    if (platform() !== 'darwin') {
      throw new Error('Action requires macOS agent.')
    }

    const keychain: string = getInput('keychain')
    const createKeychain: boolean = getInput('create-keychain') === 'true'
    let keychainPassword: string = getInput('keychain-password')
    let p12Filepath: string = getInput('p12-filepath')
    const p12FileBase64: string = getInput('p12-file-base64')
    const p12Password: string = getInput('p12-password')
    const deleteKeychainIfExists: boolean =
      getInput('delete-keychain-if-exists') === 'true'

    if (p12Filepath === '' && p12FileBase64 === '') {
      throw new Error(
        'At least one of p12-filepath or p12-file-base64 must be provided'
      )
    }

    if (p12FileBase64 !== '') {
      const buffer = Buffer.from(p12FileBase64, 'base64')
      const tempFile = fileSync()
      p12Filepath = tempFile.name
      writeFileSync(p12Filepath, buffer)
    }

    if (keychainPassword === '') {
      // generate a keychain password for the temporary keychain
      keychainPassword = Math.random().toString(36)
    }

    setOutput('keychain-password', keychainPassword)
    setSecret(keychainPassword)

    if (deleteKeychainIfExists) {
      try {
        await deleteKeychain(keychain)
      } catch (error) {
        warning(`Failed to delete keychain: ${error}`)
      }
    }

    await installCertIntoTemporaryKeychain(
      keychain,
      createKeychain,
      keychainPassword,
      p12Filepath,
      p12Password
    )
  } catch (error) {
    if (error instanceof Error) {
      setFailed(error.message)
    } else {
      setFailed(`Action failed with error ${error}`)
    }
  }
}

run()
