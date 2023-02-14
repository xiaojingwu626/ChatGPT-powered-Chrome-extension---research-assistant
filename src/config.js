import { defaults } from 'lodash-es'
import Browser from 'webextension-polyfill'

/**
 * @typedef {object} Model
 * @property {string} value
 * @property {string} desc
 */
/**
 * @type {Object.<string,Model>}
 */
export const Models = {
  normal: { value: 'text-davinci-002-render', desc: 'Normal (chatGPT)' },
  davinci: { value: 'text-davinci-003', desc: 'Use API Key (Davinci, high price, high quality)' },
  curie: { value: 'text-curie-001', desc: 'Use API Key (Curie, medium price, medium quality)' },
  babbage: { value: 'text-babbage-001', desc: 'Use API Key (Babbagem, low price, low quality)' },
  ada: { value: 'text-ada-001', desc: 'Use API Key (Ada, lowest price, lowest quality)' },
}

export const TriggerMode = {
  always: 'Always',
  questionMark: 'When query ends with question mark (?)',
  manually: 'Manually',
}

export const ThemeMode = {
  light: 'Light',
  dark: 'Dark',
  auto: 'Auto',
}

/**
 * @typedef {typeof defaultConfig} UserConfig
 */
export const defaultConfig = {
  /** @type {keyof TriggerMode}*/
  triggerMode: 'always',
  /** @type {keyof ThemeMode}*/
  themeMode: 'auto',
  /** @type {keyof Models}*/
  modelName: 'normal',
  apiKey: '',
  insertAtTop: false,
  siteRegex: 'match nothing',
  userSiteRegexOnly: false,
  inputQuery: '',
  appendQuery: '',
  prependQuery: '',
  accessToken: '',
  tokenSavedOn: 0,
}

export function isUsingApiKey(config) {
  return config.modelName !== 'normal'
}

/**
 * get user config from local storage
 * @returns {Promise<UserConfig>}
 */
export async function getUserConfig() {
  const options = await Browser.storage.local.get(Object.keys(defaultConfig))
  return defaults(options, defaultConfig)
}

/**
 * set user config to local storage
 * @param {Partial<UserConfig>} value
 */
export async function setUserConfig(value) {
  await Browser.storage.local.set(value)
}

export async function setAccessToken(accessToken) {
  await setUserConfig({ accessToken, tokenSavedOn: Date.now() })
}

const TOKEN_DURATION = 30 * 24 * 3600 * 1000
export async function clearOldAccessToken() {
  const duration = Date.now() - (await getUserConfig()).tokenSavedOn
  if (duration > TOKEN_DURATION) {
    await setAccessToken('')
  }
}
