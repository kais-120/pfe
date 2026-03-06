import { Box, List } from "@chakra-ui/react"

const Sidebar = () => {
  return (
    <Box width={"200px"} height={"100vh"}>
        <List.Root>
            <List.Item>Tableau de board</List.Item>
            <List.Item>Ut</List.Item>
        </List.Root>
    </Box>
  )
}

export default Sidebar