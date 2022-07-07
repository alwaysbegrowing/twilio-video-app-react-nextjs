import React from 'react'
import { useAppState } from '../../state'

export default function PrivateRoute({ children, ...rest }) {
  const { isAuthReady, user } = useAppState()

  const renderChildren = user || !process.env.REACT_APP_SET_AUTH

  if (!renderChildren && !isAuthReady) {
    return null
  }
  console.log('warning: i messed up this thing')

  return children
}
