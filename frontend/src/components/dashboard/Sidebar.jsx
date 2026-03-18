import { Box, Text, VStack, Flex } from "@chakra-ui/react"
import { Building, Building2, CalendarCheck2, Files, Gauge, User, LogOut } from 'lucide-react';
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { AxiosToken } from "../../Api/Api";

const Sidebar = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await AxiosToken.get(`/auth/profile`);
        setUser(response.data.data.role)
      } catch {
        console.error("err")
      }
    }
    fetchData()
  }, [])

  const adminList = [
    { icon: Gauge,     label: "Tableau de bord",       link: "",                 end: true  },
    { icon: User,      label: "Utilisateurs",           link: "users",            end: false },
    { icon: Files,     label: "Documents partenaires",  link: "document/partner", end: false },
    { icon: Building2, label: "Services",               link: "service",          end: false },
  ]

  const partnerList = [
    { icon: Gauge,          label: "Tableau de bord", link: "/partner/dashboard", end: true  },
    { icon: Building,       label: "Mon hôtel",       link: "service",            end: false },
    { icon: CalendarCheck2, label: "Réservations",    link: "bookings",           end: false },
  ]

  const sideBarList = user === "admin" ? adminList : partnerList;

  return (
    <Box
      w="240px"
      h="100vh"
      bg="white"
      borderRight="1px solid"
      borderColor="gray.100"
      display="flex"
      flexDirection="column"
      position="sticky"
      top={0}
      flexShrink={0}
    >
      {/* Logo */}
      <Flex align="center" gap={2.5} px={6} py={5} borderBottom="1px solid" borderColor="gray.100">
        <Flex
          w="32px" h="32px" borderRadius="lg"
          bg="blue.600" align="center" justify="center"
          flexShrink={0}
        >
          <Building size={16} color="white" strokeWidth={2} />
        </Flex>
        <Text fontSize="lg" fontWeight={800} color="gray.900" letterSpacing="-0.3px">
          H-Care
        </Text>
      </Flex>

      {/* Role label */}
      {user && (
        <Box px={6} pt={5} pb={2}>
          <Text fontSize="9px" fontWeight={700} color="gray.400"
            textTransform="uppercase" letterSpacing="widest">
            {user === "admin" ? "Administration" : "Espace partenaire"}
          </Text>
        </Box>
      )}

      {/* Nav items */}
      <VStack align="stretch" gap={1} px={3} flex={1}>
        {!user
          ? Array.from({ length: 3 }).map((_, i) => (
              <Box key={i} h="40px" borderRadius="lg" bg="gray.100" />
            ))
          : sideBarList.map((item, index) => {
              const Icon = item.icon
              return (
                <NavLink key={index} to={item.link} end={item.end}>
                  {({ isActive }) => (
                    <Flex
                      align="center"
                      gap={3}
                      px={3}
                      py={2.5}
                      borderRadius="xl"
                      bg={isActive ? "blue.50" : "transparent"}
                      color={isActive ? "blue.600" : "gray.600"}
                      fontWeight={isActive ? 600 : 400}
                      fontSize="sm"
                      transition="all 0.15s"
                      _hover={{
                        bg: isActive ? "blue.50" : "gray.50",
                        color: isActive ? "blue.600" : "gray.800",
                      }}
                      position="relative"
                    >
                      {/* Active indicator bar */}
                      {isActive && (
                        <Box
                          position="absolute"
                          left={0}
                          top="20%"
                          h="60%"
                          w="3px"
                          bg="blue.600"
                          borderRadius="full"
                        />
                      )}
                      <Icon
                        size={16}
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                      {item.label}
                    </Flex>
                  )}
                </NavLink>
              )
            })
        }
      </VStack>

    </Box>
  )
}

export default Sidebar