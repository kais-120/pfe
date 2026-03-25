import { Link, NavLink, useNavigate } from "react-router-dom"
import { Avatar, Box, Flex, HStack, Menu, Portal, Text } from "@chakra-ui/react"
import { useEffect, useRef, useState } from "react"
import { AxiosToken } from "../../Api/Api"
import Cookies from "universal-cookie"
import { FaHotel, FaPlane, FaCar, FaGlobe, FaTags, FaCog, FaTachometerAlt, FaSignOutAlt, FaCalendarCheck } from "react-icons/fa"
import { HiChevronDown } from "react-icons/hi"
import logo from "../../assets/image.png"

const NAV_LINKS = [
  { name: "Hôtels",path: "/",icon: FaHotel},
  { name: "Vols",path: "/flights",icon: FaPlane},
  { name: "Location de voiture", path: "/location",icon: FaCar},
  { name: "Agences",path: "/agencies",  icon: FaGlobe},
  { name: "Offres",path: "/offers",icon: FaTags},
]

const getDashboardLink = (role) => {
  if (role === "client")  return { path: "/booking",label: "Mes réservations", icon: FaCalendarCheck }
  if (role === "partner") return { path: "/partner/dashboard",label: "Tableau de bord",  icon: FaTachometerAlt }
  return { path: "/dashboard",label: "Tableau de bord",  icon: FaTachometerAlt }
}

export default function Header() {
  const [user, setUser] = useState(null)
  const [scrolled, setScrolled] = useState(false)
  const cookie = new Cookies()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    if (!cookie.get("auth")) return
    AxiosToken.get("/auth/profile")
      .then(r => setUser(r.data.data))
      .catch(() => navigate("/"))
  }, [navigate])

  const handleLogout = () => {
    cookie.remove("auth")
    navigate("/login")
  }

  const dashboard = user ? getDashboardLink(user.role) : null

  return (
    <Box
      as="header"
      position="sticky"
      top={0}
      zIndex={100}
      px={{ base: 4, md: 8 }}
      py={0}
      transition="background 0.2s, box-shadow 0.2s"
      bg={scrolled ? "rgba(15, 76, 129, 0.97)" : "blue.700"}
      boxShadow={scrolled ? "0 2px 20px rgba(0,0,0,0.18)" : "none"}
      backdropFilter="blur(12px)"
    >
      <Flex align="center" justify="space-between" h="68px" gap={4}>

        {/* Logo */}
        <Link to="/" style={{ flexShrink: 0 }}>
          <img width={"120px"} src={logo} alt="logo" />
        </Link>

        {/* Nav links */}
        <HStack
          as="nav"
          spacing={1}
          display={{ base: "none", lg: "flex" }}
          flex={1}
          justify="center"
        >
          {NAV_LINKS.map(({ name, path, icon: Icon }) => (
            <NavLink key={path} to={path}>
              {({ isActive }) => (
                <Flex
                  align="center"
                  gap={2}
                  px={4}
                  py="9px"
                  borderRadius="lg"
                  fontSize="sm"
                  fontWeight={isActive ? 600 : 400}
                  color={isActive ? "white" : "whiteAlpha.800"}
                  bg={isActive ? "whiteAlpha.200" : "transparent"}
                  _hover={{ bg: "whiteAlpha.150", color: "white" }}
                  transition="all 0.15s"
                  position="relative"
                  letterSpacing="0.01em"
                >
                  <Box as={Icon} boxSize="13px" opacity={isActive ? 1 : 0.75} />
                  <Text as="span">{name}</Text>
                  {isActive && (
                    <Box
                      position="absolute"
                      bottom="-2px"
                      left="50%"
                      transform="translateX(-50%)"
                      w="20px"
                      h="2px"
                      bg="white"
                      borderRadius="full"
                    />
                  )}
                </Flex>
              )}
            </NavLink>
          ))}
        </HStack>

        {/* Auth section */}
        <Box flexShrink={0}>
          {user ? (
            <UserMenu user={user} dashboard={dashboard} onLogout={handleLogout} />
          ) : (
            <GuestMenu />
          )}
        </Box>

      </Flex>
    </Box>
  )
}


function UserMenu({ user, dashboard, onLogout }) {
  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        <Flex
          as="button"
          align="center"
          gap={2}
          px={3}
          py={1.5}
          borderRadius="full"
          border="1.5px solid"
          borderColor="whiteAlpha.400"
          _hover={{ bg: "whiteAlpha.150", borderColor: "whiteAlpha.600" }}
          transition="all 0.15s"
          cursor="pointer"
          color="white"
        >
          <Avatar.Root size="sm" boxSize="30px">
            <Avatar.Fallback
              name={user.name}
              bg="blue.300"
              color="blue.900"
              fontSize="xs"
              fontWeight={600}
            />
          </Avatar.Root>
          <Text fontSize="sm" fontWeight={500} maxW="100px" noOfLines={1}>
            {user.name}
          </Text>
          <Box as={HiChevronDown} boxSize="14px" opacity={0.7} />
        </Flex>
      </Menu.Trigger>

      <Portal>
        <Menu.Positioner>
          <Menu.Content
            minW="200px"
            borderRadius="xl"
            border="1px solid"
            borderColor="gray.100"
            boxShadow="lg"
            overflow="hidden"
            py={1}
            mt={2}
          >
            {/* User info header */}
            <Box px={4} py={3} borderBottom="1px solid" borderColor="gray.100">
              <Text fontWeight={600} fontSize="sm" color="gray.800" noOfLines={1}>
                {user.name}
              </Text>
              <Text fontSize="xs" color="gray.500" mt={0.5} noOfLines={1}>
                {user.email}
              </Text>
            </Box>

            <Box py={1}>
              <MenuLink to="/setting" icon={FaCog} label="Paramètres" />
              {dashboard && (
                <MenuLink to={dashboard.path} icon={dashboard.icon} label={dashboard.label} />
              )}
            </Box>

            <Box borderTop="1px solid" borderColor="gray.100" py={1}>
              <Menu.Item
                value="logout"
                onClick={onLogout}
                cursor="pointer"
                px={4}
                py={2.5}
                _hover={{ bg: "red.50" }}
                color="red.600"
                fontSize="sm"
                display="flex"
                alignItems="center"
                gap={3}
              >
                <Box onClick={onLogout} as={FaSignOutAlt} boxSize="13px" />
                Déconnexion
              </Menu.Item>
            </Box>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  )
}


function GuestMenu() {
  return (
    <HStack spacing={2}>
      <Link to="/login">
        <Flex
          as="span"
          px={4}
          py={2}
          borderRadius="lg"
          fontSize="sm"
          fontWeight={500}
          color="white"
          border="1.5px solid"
          borderColor="whiteAlpha.500"
          _hover={{ bg: "whiteAlpha.150", borderColor: "whiteAlpha.700" }}
          transition="all 0.15s"
          cursor="pointer"
        >
          Connexion
        </Flex>
      </Link>

      <Menu.Root>
        <Menu.Trigger asChild>
          <Flex
            as="button"
            align="center"
            gap={1.5}
            px={4}
            py={2}
            borderRadius="lg"
            fontSize="sm"
            fontWeight={600}
            color="blue.700"
            bg="white"
            _hover={{ bg: "blue.50" }}
            transition="all 0.15s"
            cursor="pointer"
            border="none"
          >
            Inscription
            <Box as={HiChevronDown} boxSize="13px" />
          </Flex>
        </Menu.Trigger>

        <Portal>
          <Menu.Positioner>
            <Menu.Content
              minW="160px"
              borderRadius="xl"
              border="1px solid"
              borderColor="gray.100"
              boxShadow="lg"
              py={1}
              mt={2}
            >
              <Link to="/signup">
                <Menu.Item
                  value="client"
                  cursor="pointer"
                  px={4}
                  py={2.5}
                  fontSize="sm"
                  _hover={{ bg: "gray.50" }}
                >
                  Client
                </Menu.Item>
              </Link>
              <Link to="/signup/partner">
                <Menu.Item
                  value="partner"
                  cursor="pointer"
                  px={4}
                  py={2.5}
                  fontSize="sm"
                  _hover={{ bg: "gray.50" }}
                >
                  Partenaire
                </Menu.Item>
              </Link>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
    </HStack>
  )
}


/* ── Reusable menu link item ─────────────────────────────────────── */
function MenuLink({ to, icon: Icon, label }) {
  return (
    <Link to={to}>
      <Menu.Item
        value={label}
        cursor="pointer"
        px={4}
        py={2.5}
        fontSize="sm"
        _hover={{ bg: "gray.50" }}
        color="gray.700"
        display="flex"
        alignItems="center"
        gap={3}
      >
        <Box as={Icon} boxSize="13px" color="gray.400" />
        {label}
      </Menu.Item>
    </Link>
  )
}