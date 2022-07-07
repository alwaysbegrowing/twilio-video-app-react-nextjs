import React from 'react'
import { styled, Theme } from '@material-ui/core/styles'
import Head from 'next/head'

import MenuBar from '../src/components/MenuBar/MenuBar'
import MobileTopMenuBar from '../src/components/MobileTopMenuBar/MobileTopMenuBar'
import PreJoinScreens from '../src/components/PreJoinScreens/PreJoinScreens'
import ReconnectingNotification from '../src/components/ReconnectingNotification/ReconnectingNotification'
import RecordingNotifications from '../src/components/RecordingNotifications/RecordingNotifications'
import Room from '../src/components/Room/Room'

import useHeight from '../src/hooks/useHeight/useHeight'
import useRoomState from '../src/hooks/useRoomState/useRoomState'

const Container = styled('div')({
  display: 'grid',
  gridTemplateRows: '1fr auto',
})

const Main = styled('main')(({ theme }: { theme: Theme }) => ({
  overflow: 'hidden',
  paddingBottom: `${theme.footerHeight}px`, // Leave some space for the footer
  background: 'black',
  [theme.breakpoints.down('sm')]: {
    paddingBottom: `${theme.mobileFooterHeight + theme.mobileTopBarHeight}px`, // Leave some space for the mobile header and footer
  },
}))

export default function App() {
  const roomState = useRoomState()

  // Here we would like the height of the main container to be the height of the viewport.
  // On some mobile browsers, 'height: 100vh' sets the height equal to that of the screen,
  // not the viewport. This looks bad when the mobile browsers location bar is open.
  // We will dynamically set the height with 'window.innerHeight', which means that this
  // will look good on mobile browsers even after the location bar opens or closes.
  const height = useHeight()

  return (
    <Container style={{ height }}>
      <Head>
        <meta charSet="utf-8" />
        <title>Focus | An always be growing initiative - abg.garden</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      {roomState === 'disconnected' ? (
        <PreJoinScreens />
      ) : (
        <Main>
          <ReconnectingNotification />
          <RecordingNotifications />
          <MobileTopMenuBar />
          <Room />
          <MenuBar />
        </Main>
      )}
    </Container>
  )
}
