import {getInput, setFailed} from '@actions/core'
import {deleteKeychain} from './security'

async function run(): Promise<void> {
  try {
    const keychain: string = getInput('keychain')

    await deleteKeychain(keychain)
  } catch (error) {
    if (error instanceof Error) {
      setFailed(error.message)
    } else {
      setFailed(`Action failed with error ${error}`)
    }
  }
}

run()
