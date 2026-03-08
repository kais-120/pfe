import { Box, List } from "@chakra-ui/react"
import { Files, Gauge, User } from 'lucide-react';
import { Link } from "react-router-dom";

const Sidebar = () => {
   const adminList = [
        {icon:<Gauge />,label:"Table de board",link:""},
        {icon:<User />,label:"Utilisateurs",link:"users"},
        {icon:<Files />,label:"Documents partenaires",link:"document/partner"},


    ]
   const partnerList = [
        {icon:<Gauge />,label:"Table de board",link:"/partner/dashboard"},
        {icon:<User />,label:"offre",link:"offre"},
        {icon:<Files />,label:"Documents partenaires",link:"document/partner"},


    ]
  return (
    <Box width={"200px"} height={"100vh"}>
        <List.Root>
          {partnerList.map((element, index) => (
            <List.Item key={index}>
              <Link className="flex items-center !gap-2" to={element.link}>
              {element.icon}
              {element.label}
              </Link>
            </List.Item>
          ))}
        </List.Root>
    </Box>
  )
}

export default Sidebar