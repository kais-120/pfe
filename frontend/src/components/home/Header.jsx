import { Link, useNavigate } from "react-router-dom"
import { Avatar, Box, List, Menu, Portal } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { AxiosToken } from "../../Api/Api";
import Cookies from "universal-cookie";

const Header = () => {
    const [user,setUser] = useState(null);
    const cookie = new Cookies();
    const navigate = useNavigate();
    useEffect(()=>{
        if(!cookie.get("auth")) return
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
    const handleLogout = () =>{
         cookie.remove("auth");
                navigate("/login")
    }
  return (
    <>

    <header className="!px-2 flex w-full h-18 shadow-2xl justify-between items-center">
        <div className="logo">
            <p>logo</p>
        </div>
        <Box className="links lg:none ">
            <List.Root unstyled={true} padding={5} className="flex">
                <List.Item padding={2}>Home</List.Item>
                <List.Item padding={2}>About</List.Item>
                <List.Item padding={2}>Contact</List.Item>
            </List.Root>
        </Box>
        <Box className="account">
            {user ?
            <Menu.Root>
                <Menu.Trigger>
                <Avatar.Root className="cursor-pointer">
                    <Avatar.Fallback focusRing="outside" name={user.first_name + " " + user.last_name}/>
                </Avatar.Root>
                </Menu.Trigger>
                <Portal>
                <Menu.Positioner>
                    <Menu.Content>
                        <Link to="/setting"><Menu.Item className="!cursor-pointer" value="setting">parametre</Menu.Item></Link>
                        <Menu.Item className="!cursor-pointer" value="logout" onClick={handleLogout}>déconnect</Menu.Item>

                    </Menu.Content>
                </Menu.Positioner>
                </Portal>
                </Menu.Root>
            :
            <List.Root unstyled={true} className="flex">
                 <Link to="/login" >
                <List.Item padding={2} marginRight={3} className="text-amber-50 rounded-[5px] bg-blue-700 cursor-pointer">
                   Login
                    </List.Item>
                   </Link>
                   <Link to="/signup">
                <List.Item padding={2} className="cursor-pointer">Sign Up</List.Item>
                </Link>
            </List.Root>
        }
        </Box>
        {/* <Drawer.Root open={open} onOpenChange={(e)=>setOpen(e.open)}>
                <Drawer.Trigger asChild>
                    <span>gel</span>
                </Drawer.Trigger>
                <Portal>
                    <Drawer.Backdrop>
                        <Drawer.Content>
                            <Drawer.Body>
                                hello
                            </Drawer.Body>
                        </Drawer.Content>
                    </Drawer.Backdrop>
                </Portal>
            </Drawer.Root> */}
    </header>
    </>

  )
}

export default Header