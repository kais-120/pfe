import { Box, Text, VStack } from "@chakra-ui/react"
import { Building, Building2, CalendarCheck2, Files, Gauge, User } from 'lucide-react';
import { useEffect, useState } from "react";
import {  NavLink } from "react-router-dom";
import { AxiosToken } from "../../Api/Api";

const Sidebar = () => {
  const [user,setUser] = useState({});

  useEffect(()=>{
    const fetchData = async () => {
      try{

        const response = await AxiosToken.get(`/auth/profile`);
        setUser(response.data.data.role)
      }catch{
        console.error("err")
      }
    }
    fetchData()
  },[])
   const adminList = [
        {icon:Gauge,label:"Table de board",link:"",end:true},
        {icon:User,label:"Utilisateurs",link:"users",end:false},
        {icon:Files,label:"Documents partenaires",link:"document/partner",end:false},
        {icon:Building2,label:"Services",link:"service",end:false},
    ]
   const partnerList = [
        {icon:Gauge,label:"Table de board",link:"/partner/dashboard",end:true},
        {icon:Building,label:"Service",link:"service",end:false},
        {icon:CalendarCheck2,label:"Réservation",link:"bookings",end:false},
    ]
    const sideBarList = user && user === "admin" ? adminList : partnerList;
  return (
    !user ? "loading"
    :
   <Box
      w="240px"
      h="100vh"
      bg="white"
      borderRight="1px solid #eee"
      p="6"
    >

      {/* Logo */}
      <Text fontSize="xl" fontWeight="bold" mb="8">
        H-care
      </Text>

      {/* Menu */}
      <VStack align="stretch" gap="2">
        {sideBarList.map((item, index) => {

          const Icon = item.icon
          return (
            <NavLink key={index} to={item.link} end={item.end}>
              {({ isActive }) => (
                <Box
                  display="flex"
                  alignItems="center"
                  gap="3"
                  px="3"
                  py="2"
                  borderRadius="8px"
                  bg={isActive ? "gray.100" : "transparent"}
                  fontWeight={isActive ? "bold" : "normal"}
                  _hover={{ bg: "gray.100" }}
                >
                <Icon strokeWidth={isActive ? 3 : 2.5} color={isActive ? "blue" : "black"} />
                  {item.label}
                </Box>
              )}
            </NavLink>
          );
        })}

      </VStack>
    </Box>
  )
}

export default Sidebar