import { Box, Flex, Text, Menu, Portal } from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AxiosToken, socketBaseURL } from '../../Api/Api';
import { LuChevronDown, LuSettings, LuLogOut, LuBell, LuCheck, LuFileText, LuInfo } from 'react-icons/lu';
import Cookies from 'universal-cookie';
import { io } from 'socket.io-client';
import { Banknote, CalendarCheck } from 'lucide-react';

const NOTIF_META = {
  document: { Icon: LuFileText,color: "blue", bg: "blue.50"   },
  booking: { Icon: CalendarCheck, color: "red",  bg: "red.50"    },
  payment:{ Icon: Banknote,color: "gray", bg: "gray.50"   },
}
const getMeta = (type) => NOTIF_META[type] ?? NOTIF_META.info

const formatTime = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000)
  if (diff < 60) return "À l'instant"
  if (diff < 3600)  return `Il y a ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`
  return new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
}

const Topbar = () => {
  const [user,setUser] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [notifOpen,setNotifOpen] = useState(false)
  const notifRef = useRef(null)
  const navigate = useNavigate()
  const cookie   = new Cookies()

  const unreadCount = notifications.filter(n => !n.is_read).length

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target))
        setNotifOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await AxiosToken.get("/auth/profile")
        setUser(res.data.data)
      } catch {
        navigate("/")
        window.location.reload();
      }
    }
    loadUser()
  }, [navigate])

  const fetchNotifications = async () => {
    try {
      const res = await AxiosToken.get("/notification")
      setNotifications(res.data.notifications ?? [])
    } catch {
      console.error("Failed to load notifications")
    }
  }

  useEffect(() => { fetchNotifications() }, [])
  console.log(notifications)

  useEffect(() => {
    if (!user) return
    const socket = io(socketBaseURL)
    socket.on("connect", () => {
      if (user.role === "admin") socket.emit("join-admin")
      if (user.role === "partner") socket.emit("join-partner", user.id);
    })
    socket.on("newNotification", () => fetchNotifications())
    return () => { socket.off("newNotification"); socket.disconnect() }
  }, [user])

  const markRead = async (id) => {
    try {
      await AxiosToken.put(`/notification/${id}/read`)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    } catch { console.error("err") }
  }

  const markAllRead = async () => {
    try {
      await AxiosToken.put("/notification/read-all")
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    } catch { console.error("err") }
  }

  const handleLogout = () => { cookie.remove("auth"); window.location = "/login" }
  const initials = user?.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()

  return (
    <Box px={6} py={3} bg="white"
      borderBottom="1px solid" borderColor="gray.100"
      display="flex" alignItems="center" justifyContent="flex-end"
      gap={3} position="sticky" top={0} zIndex={50}>

      {/* ── Notification bell + panel ── */}
      <Box position="relative" ref={notifRef}>

        {/* Bell button */}
        <Flex w="36px" h="36px" borderRadius="lg"
          align="center" justify="center"
          border="1px solid"
          borderColor={notifOpen ? "blue.300" : "gray.200"}
          bg={notifOpen ? "blue.50" : "white"}
          color={notifOpen ? "blue.500" : "gray.500"}
          cursor="pointer" transition="all 0.15s" position="relative"
          _hover={{ bg: "gray.50", color: "gray.700" }}
          onClick={() => setNotifOpen(o => !o)}>
          <LuBell size={15} />
          {unreadCount > 0 && (
            <Box position="absolute" top="-4px" right="-4px"
              bg="red.500" color="white" borderRadius="full"
              minW="16px" h="16px" px={1}
              display="flex" alignItems="center" justifyContent="center"
              fontSize="9px" fontWeight={800} border="1.5px solid white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Box>
          )}
        </Flex>

        {/* Notification panel */}
        {notifOpen && (
          <Box position="absolute" top="calc(100% + 8px)" right={0} zIndex={1000}
            bg="white" border="1px solid" borderColor="gray.100"
            borderRadius="2xl" boxShadow="0 8px 40px rgba(0,0,0,0.12)"
            w="360px" overflow="hidden">

            {/* Header */}
            <Flex px={5} py={4} borderBottom="1px solid" borderColor="gray.100"
              align="center" justify="space-between">
              <Flex align="center" gap={2}>
                <Text fontWeight={800} fontSize="sm" color="gray.900">Notifications</Text>
                {unreadCount > 0 && (
                  <Box bg="blue.100" color="blue.600" borderRadius="full"
                    px={2} py={0.5} fontSize="xs" fontWeight={700}>
                    {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
                  </Box>
                )}
              </Flex>
              {unreadCount > 0 && (
                <Flex as="button" align="center" gap={1}
                  color="blue.500" fontSize="xs" fontWeight={600}
                  cursor="pointer" _hover={{ color: "blue.700" }}
                  onClick={markAllRead}>
                  <LuCheck size={12} />Tout marquer lu
                </Flex>
              )}
            </Flex>

            {/* Notification list */}
            <Box maxH="380px" overflowY="auto">
              {notifications.length === 0 ? (
                <Flex direction="column" align="center" py={10} gap={2}>
                  <Text fontSize="sm" fontWeight={600} color="gray.600">Aucune notification</Text>
                  <Text fontSize="xs" color="gray.400">Vous êtes à jour !</Text>
                </Flex>
              ) : (
                notifications.map((notif, i) => {
                  const meta = getMeta(notif.type)
                  const NotifIcon = meta.Icon
                  return (
                    <Flex key={notif.id}
                      px={4} py={3.5} align="flex-start" gap={3}
                      bg={notif.is_read ? "white" : "blue.50"}
                      borderBottom={i < notifications.length - 1 ? "1px solid" : "none"}
                      borderColor="gray.50"
                      cursor={notif.is_read ? "default" : "pointer"}
                      transition="background 0.1s"
                      _hover={{ bg: notif.is_read ? "gray.50" : "blue.100" }}
                      onClick={() => !notif.is_read && markRead(notif.id)}>

                      {/* Icon */}
                      <Flex w="34px" h="34px" borderRadius="xl"
                        bg={meta.bg} color={`${meta.color}.500`}
                        align="center" justify="center" flexShrink={0}>
                        <NotifIcon size={15} />
                      </Flex>

                      {/* Content */}
                      <Box flex={1} minW={0}>
                        <Flex align="center" justify="space-between" gap={2} mb={0.5}>
                          <Text fontSize="sm"
                            fontWeight={notif.is_read ? 500 : 700}
                            color="gray.800" noOfLines={1}>
                            {notif.title}
                          </Text>
                          <Text fontSize="9px" color="gray.400" flexShrink={0}>
                            {formatTime(notif.createdAt)}
                          </Text>
                        </Flex>
                        <Text fontSize="xs" color="gray.500" noOfLines={2} lineHeight="1.5">
                          {notif.message}
                        </Text>
                      </Box>

                      {/* Unread dot */}
                      {!notif.is_read && (
                        <Box w="7px" h="7px" borderRadius="full"
                          bg="blue.500" flexShrink={0} mt={1.5} />
                      )}
                    </Flex>
                  )
                })
              )}
            </Box>

            {/* Footer */}
            {notifications.length > 0 && (
              <Flex px={5} py={3} borderTop="1px solid" borderColor="gray.100" justify="center">
                <Text as="button" fontSize="xs" fontWeight={600} color="blue.500"
                  cursor="pointer" _hover={{ color: "blue.700", textDecoration: "underline" }}
                  onClick={() => { setNotifOpen(false); navigate("/dashboard/notifications") }}>
                  Voir toutes les notifications →
                </Text>
              </Flex>
            )}

          </Box>
        )}
      </Box>

      {/* Divider */}
      <Box w="1px" h="24px" bg="gray.200" />

      {/* ── User menu ── */}
      {user && (
        <Menu.Root>
          <Menu.Trigger asChild>
            <Flex align="center" gap={2.5} px={2} py={1.5} borderRadius="xl"
              cursor="pointer" border="1px solid" borderColor="gray.200"
              transition="all 0.15s" _hover={{ bg: "gray.50", borderColor: "gray.300" }}>
              <Flex w="30px" h="30px" borderRadius="full"
                bg="blue.600" color="white"
                align="center" justify="center"
                fontSize="xs" fontWeight={700} flexShrink={0}>
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
              <Box color="gray.400"><LuChevronDown size={14} /></Box>
            </Flex>
          </Menu.Trigger>

          <Portal>
            <Menu.Positioner>
              <Menu.Content minW="180px" borderRadius="xl"
                border="1px solid" borderColor="gray.100"
                boxShadow="0 8px 32px rgba(0,0,0,0.1)" py={1} mt={2}>
                <Box px={4} py={3} borderBottom="1px solid" borderColor="gray.100">
                  <Text fontWeight={700} fontSize="sm" color="gray.800">{user.name}</Text>
                  <Text fontSize="xs" color="gray.400">{user.email}</Text>
                </Box>
                <Box py={1}>
                  <Link to="/setting">
                    <Menu.Item value="setting" cursor="pointer"
                      px={4} py={2.5} fontSize="sm" _hover={{ bg: "gray.50" }}>
                      <Flex align="center" gap={2.5} color="gray.600">
                        <LuSettings size={13} />Paramètres
                      </Flex>
                    </Menu.Item>
                  </Link>
                </Box>
                <Box borderTop="1px solid" borderColor="gray.100" py={1}>
                  <Menu.Item value="logout" cursor="pointer"
                    px={4} py={2.5} fontSize="sm" _hover={{ bg: "red.50" }}
                    onClick={handleLogout}>
                    <Flex align="center" gap={2.5} color="red.500">
                      <LuLogOut size={13} />Déconnexion
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