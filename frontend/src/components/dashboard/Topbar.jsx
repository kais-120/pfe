import { Avatar, Box, Flex, Text, Menu, Portal } from '@chakra-ui/react'
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AxiosToken } from '../../Api/Api';
import { LuChevronDown, LuSettings, LuLogOut, LuBell } from 'react-icons/lu';
import Cookies from 'universal-cookie';

const Topbar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const cookie = new Cookies();

  useEffect(() => {
    async function userData() {
      try {
        const response = await AxiosToken.get("/auth/profile")
        setUser(response.data.data)
      } catch {
        navigate("/")
      }
    }
    userData();
  }, [navigate]);

  const handleLogout = () => {
    cookie.remove("auth")
    window.location =  "/login"
  }

  const initials = user?.name
    ?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()

  return (
    <Box
      px={6} py={3}
      bg="white"
      borderBottom="1px solid"
      borderColor="gray.100"
      display="flex"
      alignItems="center"
      justifyContent="flex-end"
      gap={3}
      position="sticky"
      top={0}
      zIndex={50}
    >
      {/* Notification bell */}
      <Flex
        w="36px" h="36px" borderRadius="lg"
        align="center" justify="center"
        border="1px solid" borderColor="gray.200"
        color="gray.500" cursor="pointer"
        transition="all 0.15s"
        _hover={{ bg: "gray.50", color: "gray.700" }}
      >
        <LuBell size={15} />
      </Flex>

      {/* Divider */}
      <Box w="1px" h="24px" bg="gray.200" />

      {/* User menu */}
      {user && (
        <Menu.Root>
          <Menu.Trigger asChild>
            <Flex
              align="center" gap={2.5}
              px={2} py={1.5}
              borderRadius="xl"
              cursor="pointer"
              border="1px solid" borderColor="gray.200"
              transition="all 0.15s"
              _hover={{ bg: "gray.50", borderColor: "gray.300" }}
            >
              {/* Avatar */}
              <Flex
                w="30px" h="30px" borderRadius="full"
                bg="blue.600" color="white"
                align="center" justify="center"
                fontSize="xs" fontWeight={700}
                flexShrink={0}
              >
                {initials}
              </Flex>

              <Box display={{ base: "none", md: "block" }}>
                <Text fontSize="sm" fontWeight={600} color="gray.800" lineHeight={1.2}>
                  {user.name}
                </Text>
                <Text fontSize="xs" color="gray.400" lineHeight={1.2} textTransform="capitalize">
                  {user.role === "partner" ? "partenaire" : "administrateur"}
                </Text>
              </Box>

              <Box color="gray.400">
                <LuChevronDown size={14} />
              </Box>
            </Flex>
          </Menu.Trigger>

          <Portal>
            <Menu.Positioner>
              <Menu.Content
                minW="180px" borderRadius="xl"
                border="1px solid" borderColor="gray.100"
                boxShadow="0 8px 32px rgba(0,0,0,0.1)"
                py={1} mt={2}
              >
                {/* User info header */}
                <Box px={4} py={3} borderBottom="1px solid" borderColor="gray.100">
                  <Text fontWeight={700} fontSize="sm" color="gray.800">{user.name}</Text>
                  <Text fontSize="xs" color="gray.400">{user.email}</Text>
                </Box>

                <Box py={1}>
                  <Link to="/setting">
                    <Menu.Item
                      value="setting" cursor="pointer"
                      px={4} py={2.5} fontSize="sm"
                      _hover={{ bg: "gray.50" }}
                    >
                      <Flex align="center" gap={2.5} color="gray.600">
                        <LuSettings size={13} />
                        Paramètres
                      </Flex>
                    </Menu.Item>
                  </Link>
                </Box>

                <Box borderTop="1px solid" borderColor="gray.100" py={1}>
                  <Menu.Item
                    value="logout" cursor="pointer"
                    px={4} py={2.5} fontSize="sm"
                    _hover={{ bg: "red.50" }}
                    onClick={handleLogout}
                  >
                    <Flex align="center" gap={2.5} color="red.500">
                      <LuLogOut size={13} />
                      Déconnexion
                    </Flex>
                  </Menu.Item>
                </Box>
              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Menu.Root>
      )}
    </Box>
  )
}

export default Topbar