import { Box, Button, Flex, HStack, Text } from '@chakra-ui/react'
import { useEffect, useState } from 'react';
import { LuBed } from 'react-icons/lu'
import { AxiosToken } from './Api/Api';
import { useNavigate } from 'react-router-dom';
import { Bus } from 'lucide-react';

const Test = () => {
    const [circuits, setCircuits] = useState([]);
    const navigate = useNavigate();
    useEffect(() => {
        const dataFetch = async () => {
            try {
                const res = await AxiosToken.get("/dashboard/partner/my-circuit");
                setCircuits(res.data.data)
            } catch (err) {
                console.error(err)
            }
        }
        dataFetch()
    }, [])


    return (
        <Box bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.100"
            boxShadow="0 1px 8px rgba(0,0,0,0.05)" overflow="hidden">
            <Flex px={5} py={4} borderBottom="1px solid" borderColor="gray.100"
                align="center" justify="space-between" flexWrap="wrap" gap={2}>
                <Flex align="center" gap={2}>
                    <Bus size={15} color="#7C3AED" />
                    <Text fontSize="sm" fontWeight={700} color="gray.800">Mes circuits</Text>
                </Flex>
            </Flex>
            <Box overflowX="auto">
                <Box as="table" w="full" style={{ borderCollapse: "collapse" }}>
                    <Box as="thead">
                        <Box as="tr" bg="gray.50">
                            {["Service", "Nombre Packages", "Réservations", "Occupation"].map(h => (
                                <Box key={h} as="th" px={5} py={3} textAlign="left"
                                    style={{ fontSize: "10px", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                                    {h}
                                </Box>
                            ))}
                        </Box>
                    </Box>
                    <Box as="tbody">
                        {
                            circuits && circuits.length === 0 ?

                                <Box as="tr">
                                    <Box as="td" colSpan={5} textAlign="center" py={10}>
                                        <Text fontSize="sm" color="gray.400">
                                            Aucune donnée pour le moment
                                        </Text>
                                    </Box>
                                </Box>
                                :

                                circuits.map((circuit, i) => {

                                    return (
                                        <Box key={circuit.circuit_id} as="tr"
                                            style={{ borderTop: "1px solid #F8FAFC", background: "white" }}
                                            onMouseEnter={e => e.currentTarget.style.background = "#FAFAFA"}
                                            onMouseLeave={e => e.currentTarget.style.background = "white"}>
                                            <Box as="td" px={5} py={3.5}>
                                                <Flex align="center" gap={2}>
                                                    <Flex w="28px" h="28px" borderRadius="lg" bg="#F5F3FF"
                                                        align="center" justify="center" flexShrink={0}>
                                                        <LuBed size={13} color="#7C3AED" />
                                                    </Flex>
                                                    <Text style={{ fontSize: "12px", fontWeight: 600, color: "#1E293B" }}>
                                                        {circuit.title}
                                                    </Text>
                                                </Flex>
                                            </Box>
                                            <Box as="td" px={5} py={3.5}>
                                                <Flex align="center" gap={1.5} px={2} py={0.5} borderRadius="full" display="inline-flex"
                                                >
                                            
                                                    <Text style={{ fontSize: "12px", fontWeight: 800, color: "#1E293B" }}>
                                                        {circuit?.package}
                                                    </Text>
                                                </Flex>
                                            </Box>
                                            <Box as="td" px={5} py={3.5}>
                                                <Text style={{ fontSize: "12px", fontWeight: 800, color: "#1E293B" }}>
                                                    {circuit.booked}
                                                </Text>
                                            </Box>
                                           
                                            <Box as="td" px={5} py={3.5}>
                                                <Flex align="center" gap={2}>
                                                    <Box flex={1} bg="gray.100" borderRadius="full" h="5px" overflow="hidden" maxW="80px">
                                                        <Box h="100%" borderRadius="full"
                                                            bg={circuit.status ? "#7C3AED" : "#CBD5E1"}
                                                            style={{ width: `${circuit.occupation}%`, transition: "width 0.4s" }} />
                                                    </Box>
                                                    <Text style={{ fontSize: "10px", fontWeight: 700, color: "#64748B" }}>{circuit.occupation}%</Text>
                                                </Flex>
                                            </Box>
                                        </Box>
                                    )
                                })}
                    </Box>
                </Box>
            </Box>
            <Flex px={5} py={3.5} borderTop="1px solid" borderColor="gray.100" gap={2} flexWrap="wrap">
                <Button onClick={()=>navigate("service/voyage/circuit/add")} size="xs" colorScheme="purple" borderRadius="lg" fontWeight={700}>
                    + Ajouter un circuit
                </Button>
                <Button size="xs" variant="outline" borderRadius="lg" fontWeight={600}>
                    Gérer les disponibilités
                </Button>
            </Flex>
        </Box>
    )
}

export default Test