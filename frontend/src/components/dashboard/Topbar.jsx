import { Avatar, Box, Menu, Portal, Text } from '@chakra-ui/react'
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AxiosToken } from '../../Api/Api';

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
    console.log(user)
  return (
    
    <Box padding={3} className='flex items-center justify-end'>
        {
        user && (
            <>        
            <Menu.Root>
        <Menu.Trigger asChild>
            <Avatar.Root className="!cursor-pointer">
            <Avatar.Fallback focusRing="outside" name={user.first_name + " " + user.last_name} />
            </Avatar.Root>
        </Menu.Trigger>

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
        <Text marginStart={3}>{user.first_name + " " + user.last_name}</Text>
        </>
        )}
    </Box>
  )
}

export default Topbar