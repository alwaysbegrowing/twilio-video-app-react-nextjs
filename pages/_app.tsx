import type { AppProps } from 'next/app'
import React from 'react'
import '../styles/globals.css'

import { CssBaseline } from '@material-ui/core'
import { MuiThemeProvider } from '@material-ui/core/styles'

import AppStateProvider, { useAppState } from '../src/state'
import ErrorDialog from '../src/components/ErrorDialog/ErrorDialog'
import theme from '../src/theme'
import '../src/types'
import { ChatProvider } from '../src/components/ChatProvider'
import { VideoProvider } from '../src/components/VideoProvider'
import useConnectionOptions from '../src/utils/useConnectionOptions/useConnectionOptions'
import UnsupportedBrowserWarning from '../src/components/UnsupportedBrowserWarning/UnsupportedBrowserWarning'

const VideoApp = (props: { children: any }) => {
  const { error, setError } = useAppState()
  const connectionOptions = useConnectionOptions()

  return (
    <VideoProvider options={connectionOptions} onError={setError}>
      <ErrorDialog dismissError={() => setError(null)} error={error} />
      <ChatProvider>{props.children}</ChatProvider>
    </VideoProvider>
  )
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <UnsupportedBrowserWarning>
        <AppStateProvider>
          <VideoApp>
            <Component {...pageProps} />
          </VideoApp>
        </AppStateProvider>
      </UnsupportedBrowserWarning>
    </MuiThemeProvider>
  )
}
