import { Box, Flex, Grid, Text } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { LuArrowDownRight, LuArrowUpRight, LuBanknote, LuTicket } from 'react-icons/lu'
import { AxiosToken } from '../../../Api/Api';

const StatusCard = () => {
    const [status, setStatus] = useState([]);
    useEffect(() => {
        const dataFetch = async () => {
          try {
            const res = await AxiosToken.get("/dashboard/partner/status");
            setStatus(res.data.data)
          } catch (err) {
            console.error(err)
          }
        }
        dataFetch()
      }, [])
      const STATS_CONFIG = [
        { key: "payment", label: "Revenus totaux", Icon: LuBanknote, accent: "#2563EB", bg: "#EFF6FF" },
        { key: "booking", label: "Réservations totales", Icon: LuTicket, accent: "#7C3AED", bg: "#F5F3FF" },
      ]
      const mergedStats = STATS_CONFIG.map((stat) => {
        const apiData = status.find((s) => s.label === stat.key);
    
        return {
          ...stat,
          value: apiData?.value || "0",
          ...(stat.key !== "note" && { delta: apiData?.delta || 0 }),
        };
      });
  return (
    <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4} mb={6}>
          {mergedStats.map(({ label, value, delta, Icon, accent, bg }) => {
            const up = delta > 0
            return (
              <Box key={label} bg="white" borderRadius="2xl" p={4}
                border="1px solid" borderColor="gray.100"
                boxShadow="0 1px 8px rgba(0,0,0,0.04)"
                transition="box-shadow 0.2s"
                _hover={{ boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
                <Flex justify="space-between" align="flex-start" mb={3}>
                  <Flex w="38px" h="38px" borderRadius="xl"
                    bg={bg} align="center" justify="center" flexShrink={0}>
                    <Icon size={17} color={accent} />
                  </Flex>
                    <Flex align="center" gap={0.5}
                      bg={up ? "#ECFDF5" : "#FEF2F2"}
                      borderRadius="full" px={1.5} py={0.5}>
                      {up
                        ? <LuArrowUpRight size={10} color="#065F46" />
                        : <LuArrowDownRight size={10} color="#991B1B" />}
                      <Text fontSize="10px" fontWeight={700}
                        color={up ? "#065F46" : "#991B1B"}>
                        {Math.abs(delta)}{"%"}
                      </Text>
                    </Flex>
                  
                </Flex>
                <Text fontSize="xl" fontWeight={900} color="gray.900" lineHeight={1} mb={0.5}>
                  {value}
                </Text>
                <Text fontSize="11px" color="gray.400">{label}</Text>
              </Box>
            )
          })}
        </Grid>
  )
}

export default StatusCard