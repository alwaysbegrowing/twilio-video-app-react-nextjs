import React, { useState, useRef, useCallback } from 'react'
import { makeStyles, Typography, Button, MenuItem, Link } from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import { useAppState } from '../../../state'
import UserAvatar from './UserAvatar/UserAvatar'
import Menu from '@material-ui/core/Menu'
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext'

const useStyles = makeStyles({
  userContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    margin: '1em',
    display: 'flex',
    alignItems: 'center',
  },
  userButton: {
    color: 'white',
  },
  logoutLink: {
    color: 'white',
    cursor: 'pointer',
    padding: '10px 20px',
  },
})

const UserMenu: React.FC = () => {
  const classes = useStyles()
  const { user, signOut } = useAppState()
  const { localTracks } = useVideoContext()

  const [menuOpen, setMenuOpen] = useState(false)
  const anchorRef = useRef<HTMLButtonElement>(null)

  const handleSignOut = useCallback(() => {
    localTracks.forEach((track) => track.stop())
    signOut?.()
  }, [localTracks, signOut])

  if (process.env.REACT_APP_SET_AUTH === 'passcode') {
    return (
      <div className={classes.userContainer}>
        <Link onClick={handleSignOut} className={classes.logoutLink}>
          Logout
        </Link>
      </div>
    )
  }

  return null
}

export default UserMenu
