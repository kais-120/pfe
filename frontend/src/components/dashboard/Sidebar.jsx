import { Box, Text, VStack, Flex, Image, Link } from "@chakra-ui/react"
import { Building, Building2, CalendarCheck2, Files, Gauge, User, LogOut, Car, Plane, TicketsPlane, Bus, ScanQrCode } from 'lucide-react';
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { AxiosToken, socketBaseURL } from "../../Api/Api";
import logo from "../../assets/image.png"
import { LuScanLine } from "react-icons/lu";
import { useProfile } from "../../Context/useProfile";

const Sidebar = () => {
  const { user } = useProfile();

  const adminList = [
    { icon: Gauge,label: "Tableau de bord",link: "",end: true  },
    { icon: User,label: "Utilisateurs",link: "users",end: false },
    { icon: Files,label: "Documents partenaires",link: "document/partner",end: false },
    { icon: Building2,label: "Services",link: "service",end: false },
  ]
  const partnerSector = user?.partnerInfo?.[0]?.sector;
  const partnerLabel = partnerSector === "hôtel" ? "Mon hôtel" : partnerSector === "agence de voyage" ? "Mon agence"
  : partnerSector === "compagnies aériennes" ? "Mon compagnies" : partnerSector === "voyages circuits" ? "Mon circuits" : "Mon location";

  const partnerIcon = partnerSector === "hôtel" ? Building : partnerSector === "agence de voyage" ? TicketsPlane
  : partnerSector === "compagnies aériennes" ? Plane : (partnerSector === "voyages circuits" ? Bus :  Car)  ;

  const partnerList = [
    { icon: Gauge,label: "Tableau de bord", link: "/partner/dashboard", end: true  },
    { icon: partnerIcon, label: partnerLabel,link: "service",end: false },
    { icon: LuScanLine, label: "Validation",link: "qr-scanner",end: false },
    { icon: CalendarCheck2, label: "Réservations",link: "bookings",end: false },
  ]

  const sideBarList = user && user.role === "admin" ? adminList : partnerList;

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
      <Flex justify={"center"} align="center" gap={2.5} px={6} py={5} borderBottom="1px solid" borderColor="gray.100">
      <Link href="/">
      <Image src={logo} />
      </Link>
      </Flex>

      {/* Role label */}
      {user && (
        <Box px={6} pt={5} pb={2}>
          <Text fontSize="9px" fontWeight={700} color="gray.400"
            textTransform="uppercase" letterSpacing="widest">
            {user.role === "admin" ? "Administration" : "Espace partenaire"}
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