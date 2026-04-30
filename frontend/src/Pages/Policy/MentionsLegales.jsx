import { Box, Container, VStack, Text, Heading, Separator } from "@chakra-ui/react"
import { Helmet } from "react-helmet"

const MentionsLegales = () => {
  return (
    <>
      <Helmet title="Mentions légales - travel Now" />
      <Box minH="100vh" bg="white">
        {/* Header */}
        <Box bg="linear-gradient(160deg, #0D1B3E 0%, #1A3260 50%, #0D1B3E 100%)" py={12} px={4}>
          <Container maxW="900px">
            <Heading as="h1" size="2xl" color="white" textAlign="center">
              Mentions légales
            </Heading>
            <Text color="blue.100" textAlign="center" mt={3} fontSize="sm">
              Informations légales et d'identification
            </Text>
          </Container>
        </Box>

        {/* Content */}
        <Container maxW="900px" py={12} px={4}>
          <VStack align="start" spacing={8}>
            
            {/* 1. Identification */}
            <Box>
              <Heading as="h2" size="lg" color="gray.800" mb={4}>
                1. Identification du prestataire
              </Heading>
              <VStack align="start" spacing={2}>
                <Text color="gray.700" fontSize="sm"><strong>Raison sociale :</strong> travel Now SARL</Text>
                <Text color="gray.700" fontSize="sm"><strong>Capital social :</strong> 50 000 TND</Text>
                <Text color="gray.700" fontSize="sm"><strong>Numéro d'immatriculation :</strong> 1234567/A</Text>
                <Text color="gray.700" fontSize="sm"><strong>Numéro de TVA :</strong> TN123456789</Text>
                <Text color="gray.700" fontSize="sm"><strong>Siège social :</strong> Avenue Habib Bourguiba, 1001 Tunis, Tunisie</Text>
                <Text color="gray.700" fontSize="sm"><strong>Téléphone :</strong> +216 71 234 567</Text>
                <Text color="gray.700" fontSize="sm"><strong>Email :</strong> contact@travelnow.com</Text>
              </VStack>
            </Box>

            <Separator borderColor="gray.200" />

            {/* 2. Responsable de la publication */}
            <Box>
              <Heading as="h2" size="lg" color="gray.800" mb={4}>
                2. Responsable de la publication
              </Heading>
              <VStack align="start" spacing={2}>
                <Text color="gray.700" fontSize="sm"><strong>Directeur de la publication :</strong> Ahmed Ben Salem</Text>
                <Text color="gray.700" fontSize="sm"><strong>Fonction :</strong> Gérant Général</Text>
                <Text color="gray.700" fontSize="sm"><strong>Email :</strong> ahmed.bensalem@travelnow.com</Text>
              </VStack>
            </Box>

            <Separator borderColor="gray.200" />

            {/* 3. Hébergement */}
            <Box>
              <Heading as="h2" size="lg" color="gray.800" mb={4}>
                3. Hébergement du site
              </Heading>
              <VStack align="start" spacing={2}>
                <Text color="gray.700" fontSize="sm"><strong>Hébergeur :</strong> OVH SAS</Text>
                <Text color="gray.700" fontSize="sm"><strong>Adresse :</strong> 2 rue Kellermann, 59100 Roubaix, France</Text>
                <Text color="gray.700" fontSize="sm"><strong>Téléphone :</strong> +33 9 72 10 10 07</Text>
                <Text color="gray.700" fontSize="sm"><strong>Site web :</strong> www.ovh.com</Text>
              </VStack>
            </Box>

            <Separator borderColor="gray.200" />

            {/* 4. Propriété intellectuelle */}
            <Box>
              <Heading as="h2" size="lg" color="gray.800" mb={4}>
                4. Propriété intellectuelle et droits d'auteur
              </Heading>
              <Text color="gray.700" lineHeight="1.8" fontSize="sm">
                L'ensemble du contenu de ce site (textes, images, vidéos, sons, logiciels, logos, marques) est la propriété exclusive de travel Now ou de ses partenaires. Toute reproduction, représentation, modification ou exploitation est interdite sans autorisation préalable écrite.
              </Text>
              <Text color="gray.700" lineHeight="1.8" fontSize="sm" mt={4}>
                Les marques "travel Now", le logo et tous les éléments visuels distinctifs sont des marques déposées et protégées par la loi.
              </Text>
            </Box>

            <Separator borderColor="gray.200" />

            {/* 5. Limitation de responsabilité */}
            <Box>
              <Heading as="h2" size="lg" color="gray.800" mb={4}>
                5. Limitation de responsabilité
              </Heading>
              <Text color="gray.700" lineHeight="1.8" fontSize="sm">
                travel Now s'efforce de fournir des informations exactes et à jour sur ce site. Cependant, travel Now ne garantit pas :
              </Text>
              <Text color="gray.700" lineHeight="1.8" fontSize="sm" mt={3} ml={4}>
                • L'exactitude ou l'exhaustivité des informations<br/>
                • L'absence d'erreurs, d'omissions ou de retards<br/>
                • Le fonctionnement ininterrompu du site<br/>
                • L'absence de virus ou de code malveillant<br/>
                • La disponibilité constante des services
              </Text>
              <Text color="gray.700" lineHeight="1.8" fontSize="sm" mt={4}>
                travel Now ne peut être tenu responsable des dommages directs, indirects, spéciaux ou consécutifs résultant de l'utilisation ou de l'impossibilité d'utiliser le site.
              </Text>
            </Box>

            <Separator borderColor="gray.200" />

            {/* 6. Cookies et données personnelles */}
            <Box>
              <Heading as="h2" size="lg" color="gray.800" mb={4}>
                6. Cookies et données personnelles
              </Heading>
              <Text color="gray.700" lineHeight="1.8" fontSize="sm">
                Ce site utilise des cookies pour améliorer votre expérience de navigation. Pour plus d'informations sur la façon dont nous traitons vos données personnelles, veuillez consulter notre <strong>Politique de confidentialité</strong>.
              </Text>
            </Box>

            <Separator borderColor="gray.200" />

            {/* 7. Liens externes */}
            <Box>
              <Heading as="h2" size="lg" color="gray.800" mb={4}>
                7. Liens externes
              </Heading>
              <Text color="gray.700" lineHeight="1.8" fontSize="sm">
                Ce site peut contenir des liens vers des sites externes. travel Now ne contrôle pas le contenu de ces sites et ne peut être tenue responsable de leur contenu, de leur fonctionnement ou de tout dommage résultant de leur utilisation.
              </Text>
            </Box>

            <Separator borderColor="gray.200" />

            {/* 8. Service clients et réclamations */}
            <Box>
              <Heading as="h2" size="lg" color="gray.800" mb={4}>
                8. Service clients et réclamations
              </Heading>
              <Text color="gray.700" lineHeight="1.8" fontSize="sm">
                Pour toute réclamation ou problème, veuillez nous contacter via :
              </Text>
              <Text color="gray.700" lineHeight="1.8" fontSize="sm" mt={3} ml={4}>
                <strong>Formulaire de contact :</strong> www.travelnow.com/contact<br/>
                <strong>Email :</strong> support@travelnow.com<br/>
                <strong>Téléphone :</strong> +216 71 234 567
              </Text>
            </Box>

            <Separator borderColor="gray.200" />

            {/* 9. Conditions d'utilisation */}
            <Box>
              <Heading as="h2" size="lg" color="gray.800" mb={4}>
                9. Conditions d'utilisation
              </Heading>
              <Text color="gray.700" lineHeight="1.8" fontSize="sm">
                L'accès et l'utilisation de ce site sont soumis à nos <strong>Conditions d'utilisation</strong>. En utilisant ce site, vous acceptez d'être lié par ces conditions.
              </Text>
            </Box>

            <Separator borderColor="gray.200" />

            {/* 10. Lois applicables */}
            <Box>
              <Heading as="h2" size="lg" color="gray.800" mb={4}>
                10. Lois applicables et juridiction compétente
              </Heading>
              <Text color="gray.700" lineHeight="1.8" fontSize="sm">
                Ces mentions légales sont régies par les lois de la Tunisie. Tout litige découlant de l'utilisation de ce site sera soumis à la juridiction exclusive des tribunaux compétents de Tunis.
              </Text>
            </Box>

            <Separator borderColor="gray.200" />

            {/* 11. Modifications */}
            <Box>
              <Heading as="h2" size="lg" color="gray.800" mb={4}>
                11. Modifications des mentions légales
              </Heading>
              <Text color="gray.700" lineHeight="1.8" fontSize="sm">
                travel Now se réserve le droit de modifier ces mentions légales à tout moment. Les modifications seront publiées sur cette page. L'utilisation continue du site implique votre acceptation des modifications.
              </Text>
            </Box>

            <Separator borderColor="gray.200" />

            {/* 12. Conformité légale */}
            <Box>
              <Heading as="h2" size="lg" color="gray.800" mb={4}>
                12. Conformité légale
              </Heading>
              <Text color="gray.700" lineHeight="1.8" fontSize="sm">
                travel Now exerce son activité conformément aux dispositions légales et réglementaires en vigueur en Tunisie, notamment :
              </Text>
              <Text color="gray.700" lineHeight="1.8" fontSize="sm" mt={3} ml={4}>
                • La Loi n° 2004-83 du 19 juillet 2004 relative à la protection des données personnelles<br/>
                • La Loi n° 2000-83 du 9 août 2000 relative au commerce électronique<br/>
                • Les codes civils et commerciaux tunisiens<br/>
                • Les normes de protection des consommateurs
              </Text>
            </Box>

            <Separator borderColor="gray.200" />

            {/* 13. Numéros de contact */}
            <Box>
              <Heading as="h2" size="lg" color="gray.800" mb={4}>
                13. Nous contacter
              </Heading>
              <VStack align="start" spacing={2}>
                <Text color="gray.700" fontSize="sm" fontWeight={700}>travel Now SARL</Text>
                <Text color="gray.700" fontSize="sm">Avenue Habib Bourguiba, 1001 Tunis, Tunisie</Text>
                <Text color="gray.700" fontSize="sm">Téléphone : +216 71 234 567</Text>
                <Text color="gray.700" fontSize="sm">Fax : +216 71 234 568</Text>
                <Text color="gray.700" fontSize="sm">Email : contact@travelnow.com</Text>
                <Text color="gray.700" fontSize="sm">Site web : www.travelnow.com</Text>
              </VStack>
            </Box>

            <Box mt={8} p={4} bg="blue.50" borderRadius="lg" borderLeft="4px solid" borderColor="blue.600">
              <Text color="blue.800" fontSize="xs" fontWeight={700}>
                <strong>Document mis à jour le :</strong> {new Date().toLocaleDateString("fr-FR")}
              </Text>
              <Text color="blue.700" fontSize="xs" mt={2}>
                Ces mentions légales ont une validité légale et reflètent les informations actuelles de travel Now.
              </Text>
            </Box>

          </VStack>
        </Container>
      </Box>
    </>
  )
}

export default MentionsLegales