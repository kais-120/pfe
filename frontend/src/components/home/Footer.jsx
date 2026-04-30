import { Box, Container, Grid, VStack, HStack, Text, Button, Badge, Flex, Image, Separator, Link, Input } from "@chakra-ui/react"
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter, FaPhone, FaEnvelope, FaMapMarkerAlt, FaStar, FaHotel, FaMapPin, FaCar } from "react-icons/fa"
import { useState } from "react"

export default function FooterPage() {
    const currentYear = new Date().getFullYear()

    return (
        <Box bg="linear-gradient(180deg, #0D1B3E 0%, #1A3260 100%)" color="white" pt={16} pb={8}>
            <Box maxW="1200px" mx="auto" px={6} mb={12}>
                <Grid
                    templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }}
                    gap={8}
                    mb={8}
                >
                    <VStack align="start" spacing={4}>
                        <Box>
                            <Text fontSize="lg" fontWeight={800} color="white" mb={1}>
                                travel Now
                            </Text>
                            <Text fontSize="xs" color="blue.100" fontWeight={700} textTransform="uppercase" letterSpacing="wider">
                                Voyages & Hébergements
                            </Text>
                        </Box>
                        <Text fontSize="sm" color="blue.200" lineHeight="1.6">
                            Explorez la Tunisie avec nos offres exclusives en hôtels, circuits touristiques et locations de véhicules.
                        </Text>
                        <HStack spacing={3} mt={2}>
                            <Box as="a" href="#" p={2} bg="whiteAlpha.10" borderRadius="lg" transition="all 0.2s" _hover={{ bg: "whiteAlpha.20" }}>
                                <FaFacebook size={14} />
                            </Box>
                            <Box as="a" href="#" p={2} bg="whiteAlpha.10" borderRadius="lg" transition="all 0.2s" _hover={{ bg: "whiteAlpha.20" }}>
                                <FaInstagram size={14} />
                            </Box>
                            <Box as="a" href="#" p={2} bg="whiteAlpha.10" borderRadius="lg" transition="all 0.2s" _hover={{ bg: "whiteAlpha.20" }}>
                                <FaTwitter size={14} />
                            </Box>
                        </HStack>
                    </VStack>

                    <VStack align="start" spacing={3}>
                        <Text fontSize="sm" fontWeight={700} color="white" textTransform="uppercase" letterSpacing="wider">
                            Services
                        </Text>
                        <VStack align="start" spacing={2} fontSize="sm">
                            <Link href="/" color="blue.200" _hover={{ color: "white", textDecoration: "underline" }} transition="color 0.2s">
                                Hôtels & Hébergements
                            </Link>
                            <Link to="/voyage" color="blue.200" _hover={{ color: "white", textDecoration: "underline" }} transition="color 0.2s">
                                Circuits Touristiques
                            </Link>
                            <Link to="/location" color="blue.200" _hover={{ color: "white", textDecoration: "underline" }} transition="color 0.2s">
                                Location de Véhicules
                            </Link>
                            <Link to="/airline" color="blue.200" _hover={{ color: "white", textDecoration: "underline" }} transition="color 0.2s">
                                Vols & Transports
                            </Link>
                            <Link to="/agency" color="blue.200" _hover={{ color: "white", textDecoration: "underline" }} transition="color 0.2s">
                                Packages Haj & Umrah
                            </Link>
                        </VStack>
                    </VStack>

                    <VStack align="start" spacing={3}>
                        <Text fontSize="sm" fontWeight={700} color="white" textTransform="uppercase" letterSpacing="wider">
                            Entreprise
                        </Text>
                        <VStack align="start" spacing={2} fontSize="sm">
                            <Link href="#" color="blue.200" _hover={{ color: "white", textDecoration: "underline" }} transition="color 0.2s">
                                À propos
                            </Link>
                            <Link href="#" color="blue.200" _hover={{ color: "white", textDecoration: "underline" }} transition="color 0.2s">
                                Devenir Partenaire
                            </Link>
                            <Link href="#" color="blue.200" _hover={{ color: "white", textDecoration: "underline" }} transition="color 0.2s">
                                Blog de Voyage
                            </Link>
                            <Link href="#" color="blue.200" _hover={{ color: "white", textDecoration: "underline" }} transition="color 0.2s">
                                Carrières
                            </Link>
                            <Link href="#" color="blue.200" _hover={{ color: "white", textDecoration: "underline" }} transition="color 0.2s">
                                Avis Clients
                            </Link>
                        </VStack>
                    </VStack>

                    <VStack align="start" spacing={4}>
                        <VStack align="start" spacing={3}>
                            <Text fontSize="sm" fontWeight={700} color="white" textTransform="uppercase" letterSpacing="wider">
                                Nous Contacter
                            </Text>
                            <Flex align="center" gap={2} fontSize="sm">
                                <Box color="blue.300" flexShrink={0}><FaPhone size={12} /></Box>
                                <Text color="blue.200">+216 71 234 567</Text>
                            </Flex>
                            <Flex align="center" gap={2} fontSize="sm">
                                <Box color="blue.300" flexShrink={0}><FaEnvelope size={12} /></Box>
                                <Link href="mailto:info@travelnow.com" color="blue.200" _hover={{ color: "white" }} transition="color 0.2s">
                                    info@travelnow.com
                                </Link>
                            </Flex>
                            <Flex align="center" gap={2} fontSize="sm">
                                <Box color="blue.300" flexShrink={0}><FaMapMarkerAlt size={12} /></Box>
                                <Text color="blue.200">Tunis, Tunisie</Text>
                            </Flex>
                        </VStack>


                    </VStack>
                </Grid>

                <Separator my={8} borderColor="whiteAlpha.10" />

                <Flex
                    direction={{ base: "column", md: "row" }}
                    justify="space-between"
                    align="center"
                    gap={4}
                    fontSize="xs"
                    color="blue.200"
                >
                    <Text>
                        © {currentYear} Travel Now. Tous droits réservés.
                    </Text>
                    <HStack spacing={6}>
                        <Link href="/politique-confidentialite" color="white">
                            Politique de confidentialité
                        </Link>
                        <Link href="/conditions-utilisation" color="white">
                            Conditions d'utilisation
                        </Link>
                        <Link href="/mentions-legales" color="white">
                            Mentions légales
                        </Link>
                    </HStack>
                </Flex>
            </Box>
        </Box>
    )
}