import { Avatar, Menu, Portal } from '@chakra-ui/react'
import React from 'react'

const Test = () => {
  return (
    <div className='flex justify-end'>
        <Menu.Root>
      <Menu.Trigger rounded="full" focusRing="outside">
        <Avatar.Root size="sm">
          <Avatar.Fallback name="Segun Adebayo" />
          <Avatar.Image src="https://bit.ly/sage-adebayo" />
        </Avatar.Root>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            <Menu.Item value="account">Account</Menu.Item>
            <Menu.Item value="settings">Settings</Menu.Item>
            <Menu.Item value="logout">Logout</Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
    </div>
  )
}

export default Test