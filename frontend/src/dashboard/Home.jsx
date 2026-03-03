import { Box, Flex } from "@chakra-ui/react";
import Topbar from "../components/dashboard/Topbar";
import Sidebar from "../components/dashboard/Sidebar";

const Home = () => {
  return (
    <Flex direction="column" height="100vh">
      
      {/* Topbar */}
      <Topbar />

      {/* Main Area */}
      <Flex flex="1">
        <Sidebar />

        <Box flex="1" p={6}>
          Content Here
        </Box>
      </Flex>

    </Flex>
  );
};

export default Home;