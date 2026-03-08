import { Box, Flex } from "@chakra-ui/react";
import Topbar from "../components/dashboard/Topbar";
import Sidebar from "../components/dashboard/Sidebar";
import { Outlet } from "react-router-dom";

const Home = () => {
  return (
    <Flex direction="column" height="100vh">
      
      {/* Topbar */}
      <Topbar />

      {/* Main Area */}
      <Flex flex="1">
        <Sidebar />

        <Box bg={"#f5f6fa"} flex="1" p={6}>
          <Outlet />
        </Box>
      </Flex>

    </Flex>
  );
};

export default Home;