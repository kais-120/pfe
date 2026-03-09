import { Avatar, Box, Group, IconButton, Menu, Portal, Text } from '@chakra-ui/react'
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AxiosToken } from '../../Api/Api';
import { LuChevronDown } from 'react-icons/lu';


const Topbar = () => {
     const [user,setUser] = useState(null);
    const navigate = useNavigate();
    useEffect(()=>{
        async function userData() {
            try{
            const response = await AxiosToken.get("/auth/profile")
            setUser(response.data.data)
            }catch{
                // cookie.remove("auth");
                navigate("/")
            }
        }
        userData();
    },[navigate]);
  return (
    
    <Box padding={3} className='flex items-center justify-end'>
        {
        user && (
            <>        
            <Menu.Root>
                
        <Menu.Trigger asChild>
            <Avatar.Root>
            <Avatar.Fallback focusRing="outside" name={user.name} />
            </Avatar.Root>
        </Menu.Trigger>

        </Menu.Root>
        <Menu.Root>
            <Group attached>
                <Menu.Trigger asChild>
                    <Box className='flex items-center cursor-pointer'>
                    <Text  marginStart={3} marginEnd={2}>{user.name}</Text>
                    <LuChevronDown />
                    </Box>
                </Menu.Trigger>
            </Group>
            <Portal>
            <Menu.Positioner>
            <Menu.Content>
                <Link to="/setting">
                <Menu.Item value="setting">Paramètres</Menu.Item>
                </Link>

                <Menu.Item value="logout">
                Déconnexion
                </Menu.Item>
            </Menu.Content>
            </Menu.Positioner>
        </Portal>

        </Menu.Root>
        </>
        )}
    </Box>
  )
}

export default Topbar