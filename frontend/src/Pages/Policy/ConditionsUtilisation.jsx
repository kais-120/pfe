import { Box, Container, VStack, Text, Heading, Separator } from "@chakra-ui/react"
import { Helmet } from "react-helmet"

const ConditionsUtilisation = () => {
  return (
    <>
      <Helmet title="Conditions d'utilisation - travel Now" />
      <Box minH="100vh" bg="white">
        {/* Header */}
        <Box bg="linear-gradient(160deg, #0D1B3E 0%, #1A3260 50%, #0D1B3E 100%)" py={12} px={4}>
          <Container maxW="900px">
            <Heading as="h1" size="2xl" color="white" textAlign="center">
              Conditions d'utilisation
            </Heading>
          </Container>
        </Box>

        {/* Content */}
        <Container maxW="900px" py={12} px={4}>
          <VStack align="start" spacing={8}>
            
            {/* 1. Acceptation des conditions */}
            <Box>
              <Heading as="h2" size="lg" color="gray.800" mb={4}>
                1. Acceptation des conditions
              </Heading>
              <Text color="gray.700" lineHeight="1.8" fontSize="sm">
                En accédant et en utilisant le site web et les applications mobiles de travel Now, vous acceptez d'être lié par ces conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser nos services.
              </Text>
            </Box>

            {/* 2. Licence d'utilisation */}
            <Box>
              <Heading as="h2" size="lg" color="gray.800" mb={4}>
                2. Licence d'utilisation
              </Heading>
              <Text color="gray.700" lineHeight="1.8" fontSize="sm">
                travel Now vous accorde une licence limitée, non-exclusive et non-transférable pour accéder et utiliser nos services à des fins personnelles et non commerciales. Vous vous engagez à ne pas :
              </Text>
              <Text color="gray.700" lineHeight="1.8" fontSize="sm" mt={3} ml={4}>
                • Reproduire, modifier ou distribuer le contenu sans permission<br/>
                • Utiliser les services à des fins commerciales ou promotionnelles<br/>
                • Accéder au service par des moyens automatisés (scraping, bots)<br/>
                • Contourner les mesures de sécurité<br/>
                • Utiliser le service pour des activités illégales ou contraires à l'éthique
              </Text>
            </Box>

            <Separator borderColor="gray.200" />

            {/* 3. Comptes utilisateur */}
            <Box>
              <Heading as="h2" size="lg" color="gray.800" mb={4}>
                3. Comptes utilisateur
              </Heading>
              <Text color="gray.700" lineHeight="1.8" fontSize="sm">
                Lorsque vous créez un compte, vous êtes responsable de :
              </Text>
              <Text color="gray.700" lineHeight="1.8" fontSize="sm" mt={3} ml={4}>
                • Fournir des informations exactes et à jour<br/>
                • Maintenir la confidentialité de votre mot de passe<br/>
                • Toutes les activités sous votre compte<br/>
                • Notifier immédiatement les accès non autorisés
              </Text>
            </Box>

            <Separator borderColor="gray.200" />

            {/* 4. Réservations et paiements */}
            <Box>
              <Heading as="h2" size="lg" color="gray.800" mb={4}>
                4. Réservations et paiements
              </Heading>
              <VStack align="start" spacing={3}>
                <Box>
                  <Heading as="h3" size="md" color="gray.700" mb={2}>
                    4.1 Processus de réservation
                  </Heading>
                  <Text color="gray.700" lineHeight="1.8" fontSize="sm">
                    Les prix affichés incluent les taxes applicables. Les informations sur les services sont fournies à titre indicatif. travel Now se réserve le droit de refuser ou d'annuler toute réservation.
                  </Text>
                </Box>

                <Box>
                  <Heading as="h3" size="md" color="gray.700" mb={2}>
                    4.2 Paiement
                  </Heading>
                  <Text color="gray.700" lineHeight="1.8" fontSize="sm">
                    Vous acceptez de payer tous les frais et taxes associés à votre réservation. Les paiements doivent être effectués au moment de la réservation. Nous acceptons les cartes de crédit et autres méthodes de paiement autorisées.
                  </Text>
                </Box>

                <Box>
                  <Heading as="h3" size="md" color="gray.700" mb={2}>
                    4.3 Sécurité des paiements
                  </Heading>
                  <Text color="gray.700" lineHeight="1.8" fontSize="sm">
                    Tous les paiements sont traités de manière sécurisée via des passerelles de paiement certifiées. Nous ne stockons jamais les détails complets de votre carte.
                  </Text>
                </Box>
              </VStack>
            </Box>

            <Separator borderColor="gray.200" />

            {/* 5. Annulations et remboursements */}
            <Box>
              <Heading as="h2" size="lg" color="gray.800" mb={4}>
                5. Annulations et remboursements
              </Heading>
              <Text color="gray.700" lineHeight="1.8" fontSize="sm">
                Les conditions d'annulation varient selon le prestataire de service (hôtel, circuit, location de voiture). Consultez les conditions spécifiques au moment de la réservation. Les remboursements sont traités selon la politique d'annulation applicable.
              </Text>
            </Box>

            <Separator borderColor="gray.200" />

            {/* 6. Responsabilité limitée */}
            <Box>
              <Heading as="h2" size="lg" color="gray.800" mb={4}>
                6. Limitation de responsabilité
              </Heading>
              <Text color="gray.700" lineHeight="1.8" fontSize="sm">
                travel Now agit comme intermédiaire entre vous et les prestataires de services. Nous ne sommes pas responsables de :
              </Text>
              <Text color="gray.700" lineHeight="1.8" fontSize="sm" mt={3} ml={4}>
                • La qualité des services fournis par les prestataires<br/>
                • Les dommages, pertes ou blessures pendant le voyage<br/>
                • Les annulations dues aux circonstances indépendantes de notre volonté<br/>
                • Les défaillances techniques ou interruptions du service<br/>
                • Les dommages indirects, punitifs ou accessoires
              </Text>
            </Box>

            <Separator borderColor="gray.200" />

            {/* 7. Contenu utilisateur */}
            <Box>
              <Heading as="h2" size="lg" color="gray.800" mb={4}>
                7. Contenu généré par l'utilisateur
              </Heading>
              <Text color="gray.700" lineHeight="1.8" fontSize="sm">
                Vous conservez tous les droits sur le contenu que vous créez (avis, photos, commentaires). En le partageant sur notre plateforme, vous nous accordez une licence pour l'utiliser, le modifier et le distribuer. Vous garantissez que votre contenu ne viole aucune loi et ne porte atteinte à aucun droit tiers.
              </Text>
            </Box>

            <Separator borderColor="gray.200" />

            {/* 8. Propriété intellectuelle */}
            <Box>
              <Heading as="h2" size="lg" color="gray.800" mb={4}>
                8. Propriété intellectuelle
              </Heading>
              <Text color="gray.700" lineHeight="1.8" fontSize="sm">
                Tout le contenu du site (textes, images, logos, code) est la propriété de travel Now ou de nos fournisseurs de contenu et est protégé par les lois sur le droit d'auteur. Vous ne pouvez pas utiliser ce contenu sans permission.
              </Text>
            </Box>

            <Separator borderColor="gray.200" />

            {/* 9. Interdictions */}
            <Box>
              <Heading as="h2" size="lg" color="gray.800" mb={4}>
                9. Activités interdites
              </Heading>
              <Text color="gray.700" lineHeight="1.8" fontSize="sm">
                Vous ne pouvez pas :
              </Text>
              <Text color="gray.700" lineHeight="1.8" fontSize="sm" mt={3} ml={4}>
                • Utiliser le service à des fins frauduleuses ou illégales<br/>
                • Harceler, menacer ou abuser d'autres utilisateurs<br/>
                • Publier du contenu offensant, violent ou discriminatoire<br/>
                • Tenter d'accéder à des informations non autorisées<br/>
                • Transmettre des virus ou logiciels malveillants<br/>
                • Violer les droits d'autres personnes
              </Text>
            </Box>

            <Separator borderColor="gray.200" />

            {/* 10. Résiliation */}
            <Box>
              <Heading as="h2" size="lg" color="gray.800" mb={4}>
                10. Résiliation des comptes
              </Heading>
              <Text color="gray.700" lineHeight="1.8" fontSize="sm">
                travel Now se réserve le droit de suspendre ou de fermer votre compte si vous violez ces conditions ou engagez des activités nuisibles. Vous pouvez demander la suppression de votre compte à tout moment.
              </Text>
            </Box>

            <Separator borderColor="gray.200" />

            {/* 11. Lois applicables */}
            <Box>
              <Heading as="h2" size="lg" color="gray.800" mb={4}>
                11. Lois applicables
              </Heading>
              <Text color="gray.700" lineHeight="1.8" fontSize="sm">
                Ces conditions sont régies par les lois de la Tunisie. Tout litige sera résolu selon les juridictions compétentes de Tunis.
              </Text>
            </Box>

            <Separator borderColor="gray.200" />

            {/* 12. Contact */}
            <Box>
              <Heading as="h2" size="lg" color="gray.800" mb={4}>
                12. Nous contacter
              </Heading>
              <Text color="gray.700" lineHeight="1.8" fontSize="sm">
                Pour toute question concernant ces conditions, veuillez nous contacter à :
              </Text>
              <Text color="gray.700" lineHeight="1.8" fontSize="sm" mt={3} ml={4}>
                <strong>travel Now</strong><br/>
                Email : support@travelnow.com<br/>
                Téléphone : +216 71 234 567<br/>
                Adresse : Tunis, Tunisie
              </Text>
            </Box>

          </VStack>
        </Container>
      </Box>
    </>
  )
}

export default ConditionsUtilisation