import App from './shared/App.js'

App.start().catch(() => {})

export const index = (): boolean => process.stdout.write('Application start')
