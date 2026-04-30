import { Box, Container, VStack, Text, Heading, Separator } from "@chakra-ui/react"
import { useEffect } from "react"
import { Helmet } from "react-helmet"

const PolitiqueConfidentialite = () => {
    useEffect(()=>{
        window.scrollTo(0, 0);
    },[])
  return (
    <>
      <Helmet title="Politique de confidentialité - Travel Now" />
      <Box minH="100vh" bg="white">
        {/* Header */}
        <Box bg="linear-gradient(160deg, #0D1B3E 0%, #1A3260 50%, #0D1B3E 100%)" py={12} px={4}>
          <Container maxW="900px">
            <Heading as="h1" size="2xl" color="white" textAlign="center">
              Politique de Confidentialité
            </Heading>

          </Container>
        </Box>

        {/* Content */}
        <Container maxW="900px" py={12} px={4}>
          <VStack align="start" spacing={8}>
            
            {/* 1. Introduction */}
            <Box>
              <Heading as="h2" size="lg" color="gray.800" mb={4}>
                1. Introduction
              </Heading>
              <Text color="gray.700" lineHeight="1.8" fontSize="sm">
                travel Now ("nous", "notre" ou "nos") est engagé à protéger votre vie privée. Cette Politique de confidentialité explique comment nous collectons, utilisons, divulguons et sauvegardons vos informations lorsque vous visitez notre site web et nos applications mobiles.
              </Text>
            </Box>

            {/* 2. Informations que nous collectons */}
            <Box>
              <Heading as="h2" size="lg" color="gray.800" mb={4}>
                2. Informations que nous collectons
              </Heading>
              <VStack align="start" spacing={3}>
                <Box>
                  <Heading as="h3" size="md" color="gray.700" mb={2}>
                    2.1 Informations que vous nous fournissez
                  </Heading>
                  <Text color="gray.700" lineHeight="1.8" fontSize="sm">
                    Nous collectons les informations que vous nous fournissez directement, y compris :
                  </Text>
                  <Text color="gray.700" lineHeight="1.8" fontSize="sm" mt={2} ml={4}>
                    • Informations de compte (nom, adresse e-mail, numéro de téléphone)<br/>
                    • Informations de réservation (destinations, dates, préférences)<br/>
                    • Informations de paiement (détails de carte bancaire traités de manière sécurisée)<br/>
                    • Contenu généré par l'utilisateur (avis, commentaires, photos)
                  </Text>
                </Box>

                <Box>
                  <Heading as="h3" size="md" color="gray.700" mb={2}>
                    2.2 Informations collectées automatiquement
                  </Heading>
                  <Text color="gray.700" lineHeight="1.8" fontSize="sm">
                    Nous collectons certaines informations automatiquement lorsque vous accédez à nos services :
                  </Text>
                  <Text color="gray.700" lineHeight="1.8" fontSize="sm" mt={2} ml={4}>
                    • Données de journalisation (adresse IP, type de navigateur, pages visitées)<br/>
                    • Cookies et technologies de suivi similaires<br/>
                    • Informations sur l'appareil (type, système d'exploitation, identifiants uniques)<br/>
                    • Données de localisation (si vous les autorisez)
                  </Text>
                </Box>
              </VStack>
            </Box>

            <Separator borderColor="gray.200" />

            {/* 3. Utilisation de vos informations */}
            <Box>
              <Heading as="h2" size="lg" color="gray.800" mb={4}>
                3. Utilisation de vos informations
              </Heading>
              <Text color="gray.700" lineHeight="1.8" fontSize="sm">
                Nous utilisons vos informations pour :
              </Text>
              <Text color="gray.700" lineHeight="1.8" fontSize="sm" mt={3} ml={4}>
                • Fournir, maintenir et améliorer nos services<br/>
                • Traiter vos réservations et paiements<br/>
                • Vous envoyer des confirmations et mises à jour<br/>
                • Répondre à vos demandes et support client<br/>
                • Personnaliser votre expérience<br/>
                • Envoyer des communications marketing (avec votre consentement)<br/>
                • Détecter, prévenir et traiter les fraudes ou problèmes de sécurité<br/>
                • Respecter les obligations légales
              </Text>
            </Box>

            <Separator borderColor="gray.200" />

            {/* 4. Partage de vos informations */}
            <Box>
              <Heading as="h2" size="lg" color="gray.800" mb={4}>
                4. Partage de vos informations
              </Heading>
              <Text color="gray.700" lineHeight="1.8" fontSize="sm">
                Nous ne vendons pas vos données personnelles. Nous partageons vos informations uniquement avec :
              </Text>
              <Text color="gray.700" lineHeight="1.8" fontSize="sm" mt={3} ml={4}>
                • <strong>Prestataires de services</strong> : hôtels, agences de location de voitures, compagnies aériennes<br/>
                • <strong>Partenaires de paiement</strong> : processeurs de paiement et institutions financières<br/>
                • <strong>Prestataires techniques</strong> : hébergeurs, fournisseurs d'analyse<br/>
                • <strong>Autorités légales</strong> : si exigé par la loi
              </Text>
            </Box>

            <Separator borderColor="gray.200" />

            {/* 5. Sécurité des données */}
            <Box>
              <Heading as="h2" size="lg" color="gray.800" mb={4}>
                5. Sécurité de vos données
              </Heading>
              <Text color="gray.700" lineHeight="1.8" fontSize="sm">
                Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour protéger vos informations personnelles contre l'accès, l'altération, la divulgation ou la destruction non autorisés. Cependant, aucune transmission de données sur Internet n'est 100% sécurisée.
              </Text>
            </Box>

            <Separator borderColor="gray.200" />

            {/* 6. Vos droits */}
            <Box>
              <Heading as="h2" size="lg" color="gray.800" mb={4}>
                6. Vos droits concernant vos données
              </Heading>
              <Text color="gray.700" lineHeight="1.8" fontSize="sm">
                Selon la loi applicable, vous avez les droits suivants :
              </Text>
              <Text color="gray.700" lineHeight="1.8" fontSize="sm" mt={3} ml={4}>
                • <strong>Droit d'accès</strong> : consulter vos données personnelles<br/>
                • <strong>Droit de rectification</strong> : corriger les données inexactes<br/>
                • <strong>Droit à l'oubli</strong> : demander la suppression de vos données<br/>
                • <strong>Droit à la portabilité</strong> : recevoir vos données dans un format utilisable<br/>
                • <strong>Droit d'opposition</strong> : refuser certains traitements<br/>
                • <strong>Droit de retrait du consentement</strong> : retirer votre consentement à tout moment
              </Text>
            </Box>

            <Separator borderColor="gray.200" />

            {/* 7. Cookies */}
            <Box>
              <Heading as="h2" size="lg" color="gray.800" mb={4}>
                7. Cookies et technologies de suivi
              </Heading>
              <Text color="gray.700" lineHeight="1.8" fontSize="sm">
                Nous utilisons des cookies pour améliorer votre expérience, analyser le trafic et personnaliser le contenu. Vous pouvez contrôler les cookies via les paramètres de votre navigateur. Le refus de cookies peut affecter la fonctionnalité de certaines parties de notre site.
              </Text>
            </Box>

            <Separator borderColor="gray.200" />

            {/* 8. Contact */}
            <Box>
              <Heading as="h2" size="lg" color="gray.800" mb={4}>
                8. Nous contacter
              </Heading>
              <Text color="gray.700" lineHeight="1.8" fontSize="sm">
                Pour toute question concernant cette politique de confidentialité ou vos données personnelles, veuillez nous contacter à :
              </Text>
              <Text color="gray.700" lineHeight="1.8" fontSize="sm" mt={3} ml={4}>
                <strong>travel Now</strong><br/>
                Email : privacy@travelnow.com<br/>
                Téléphone : +216 71 234 567<br/>
                Adresse : Tunis, Tunisie
              </Text>
            </Box>

            <Separator borderColor="gray.200" />

            {/* 9. Modifications */}
            <Box>
              <Heading as="h2" size="lg" color="gray.800" mb={4}>
                9. Modifications de cette politique
              </Heading>
              <Text color="gray.700" lineHeight="1.8" fontSize="sm">
                Nous pouvons mettre à jour cette Politique de confidentialité à tout moment. Les modifications seront publiées sur cette page avec la date de la dernière mise à jour. L'utilisation continue de nos services implique votre acceptation des modifications.
              </Text>
            </Box>

          </VStack>
        </Container>
      </Box>
    </>
  )
}

export default PolitiqueConfidentialite