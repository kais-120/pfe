import { Box, Flex } from "@chakra-ui/react";
import Topbar from "../components/dashboard/Topbar";
import Sidebar from "../components/dashboard/Sidebar";
import { Outlet } from "react-router-dom";

const Home = () => {
  return (
    <Flex h="100vh" overflow="hidden" bg="#f5f6fa">

      {/* Sidebar — fixed left */}
      <Sidebar />

      {/* Right side — topbar + scrollable content */}
      <Flex direction="column" flex={1} overflow="hidden">

        {/* Topbar */}
        <Topbar />

        {/* Page content */}
        <Box
          flex={1}
          overflowY="auto"
          px={8}
          py={7}
          bg="#f5f6fa"
        >
          <Outlet />
        </Box>

      </Flex>
    </Flex>
  );
};

export default Home;