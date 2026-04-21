import { useEffect, useState } from "react"
import { AxiosToken, imageURL } from "../../Api/Api"
import {
  Box, Button, Dialog, Portal, CloseButton,
  Textarea, Text, Flex, Grid, VStack, Badge,
  Skeleton, SkeletonText, Drawer,
  HStack,
  Timeline,
} from "@chakra-ui/react"
import { toaster } from "../../components/ui/toaster"
import { useNavigate, useParams } from "react-router-dom"
import {
  LuArrowLeft, LuClock,
  LuFileText, LuCalendar, LuUser, LuCreditCard,
  LuBanknote, LuBuilding2, LuZoomIn, LuCheck, LuX,
  LuShieldAlert,
  LuHistory,
} from "react-icons/lu"
import { BadgeCheck, BadgeX, LucideCheckCircle, LucideCheckCircle2, LucideXCircle } from "lucide-react"

const STATUS_STYLE = {
  "en attente": { colorScheme: "yellow", Icon: LuClock, label: "En attente" },
  "accepté": { colorScheme: "green", Icon: LucideCheckCircle, label: "Accepté" },
  "refusé": { colorScheme: "red", Icon: LucideXCircle, label: "Refusé" },
}

const formatDate = (date) =>
  new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })

/* ── Section card wrapper ───────────────────────────────────────── */
function SectionCard({ title, icon: Icon, iconColor = "blue", children }) {
  return (
    <Box
      bg="white" borderRadius="2xl"
      border="1px solid" borderColor="gray.100"
      boxShadow="0 1px 8px rgba(0,0,0,0.05)"
      overflow="hidden"
    >
      <Flex
        align="center" gap={2.5}
        px={6} py={4}
        borderBottom="1px solid" borderColor="gray.100"
        bg="gray.50"
      >
        <Flex
          w="28px" h="28px" borderRadius="lg"
          bg={`${iconColor}.50`} color={`${iconColor}.500`}
          align="center" justify="center" flexShrink={0}
        >
          <Icon size={14} />
        </Flex>
        <Text fontSize="sm" fontWeight={700} color="gray.700">{title}</Text>
      </Flex>
      <Box px={6} py={5}>{children}</Box>
    </Box>
  )
}

/* ── Info row ───────────────────────────────────────────────────── */
function InfoRow({ label, value }) {
  return (
    <Flex
      py={3}
      borderBottom="1px solid" borderColor="gray.50"
      _last={{ borderBottom: "none" }}
      align="center"
    >
      <Text fontSize="xs" fontWeight={600} color="gray.400"
        textTransform="uppercase" letterSpacing="wider" w="40%">
        {label}
      </Text>
      <Text fontSize="sm" fontWeight={500} color="gray.800" flex={1}>
        {value || <Text as="span" color="gray.300">—</Text>}
      </Text>
    </Flex>
  )
}

/* ── Clickable image preview with lightbox ──────────────────────── */
function ImagePreview({ src, label }) {
  const fullSrc = `${imageURL}/partner_files/${src}`

  if (!src) {
    return (
      <Box>
        <Text fontSize="xs" fontWeight={600} color="gray.400"
          textTransform="uppercase" letterSpacing="wider" mb={2}>
          {label}
        </Text>
        <Flex
          h="90px" borderRadius="xl"
          border="2px dashed" borderColor="gray.200"
          align="center" justify="center" bg="gray.50"
        >
          <Text fontSize="xs" color="gray.300">Manquant</Text>
        </Flex>
      </Box>
    )
  }

  return (
    <Box>
      <Text fontSize="xs" fontWeight={600} color="gray.400"
        textTransform="uppercase" letterSpacing="wider" mb={2}>
        {label}
      </Text>
      <Dialog.Root>
        <Dialog.Trigger asChild>
          <Box
            position="relative" h="90px" borderRadius="xl"
            overflow="hidden" cursor="pointer"
            border="1.5px solid" borderColor="gray.200"
            transition="all 0.15s"
            _hover={{ borderColor: "blue.300", boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }}
            role="group"
          >
            <Box
              as="img" src={fullSrc} alt={label}
              w="100%" h="100%"
              style={{ objectFit: "cover" }}
            />
            {/* Hover overlay */}
            <Flex
              position="absolute" inset={0}
              bg="blackAlpha.500"
              align="center" justify="center"
              opacity={0}
              _groupHover={{ opacity: 1 }}
              transition="opacity 0.15s"
            >
              <LuZoomIn size={20} color="white" />
            </Flex>
          </Box>
        </Dialog.Trigger>
        <Portal>
          <Dialog.Backdrop bg="blackAlpha.800" />
          <Dialog.Positioner>
            <Dialog.Content
              maxW="800px" bg="transparent"
              boxShadow="none" border="none"
            >
              <Dialog.Body p={0} display="flex" justifyContent="center" alignItems="center">
                <Box
                  as="img" src={fullSrc} alt={label}
                  borderRadius="2xl"
                  style={{ maxWidth: "90vw", maxHeight: "85vh", objectFit: "contain" }}
                />
              </Dialog.Body>
              <Dialog.CloseTrigger asChild>
                <CloseButton
                  size="sm" position="fixed" top={4} right={4}
                  bg="white" color="gray.700" borderRadius="full"
                  boxShadow="md"
                />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Box>
  )
}

/* ── Page skeleton ──────────────────────────────────────────────── */
function PageSkeleton() {
  return (
    <Box maxW="860px" mx="auto">
      <Skeleton h="32px" w="200px" borderRadius="lg" mb={2} />
      <Skeleton h="16px" w="140px" borderRadius="md" mb={8} />
      <VStack gap={4} align="stretch">
        <Skeleton h="200px" borderRadius="2xl" />
        <Skeleton h="160px" borderRadius="2xl" />
        <Skeleton h="120px" borderRadius="2xl" />
      </VStack>
    </Box>
  )
}

/* ── Main component ─────────────────────────────────────────────── */
const PartnerDocumentInfo = () => {
  const [partnerFiles, setPartnerFiles] = useState(null)
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(true)
  const [actioning, setActioning] = useState(false)
  const [history, setHistory] = useState(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [historyLoad, setHistoryLoad] = useState(false)

  const navigate = useNavigate()
  const { id } = useParams()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await AxiosToken.get(`/user/admin/partner/document/${id}`)
        setPartnerFiles(response.data.partnerFiles)
      } catch {
        console.error("Failed to load document")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const handleAccept = async () => {
    try {
      setActioning(true)
      await AxiosToken.put(`/user/admin/partner/document/accept/${id}`)
      toaster.create({ description: "Dossier approuvé avec succès.", type: "success", closable: true })
      setTimeout(() => navigate("/dashboard/document/partner"), 1800)
    } catch {
      setActioning(false)
    }
  }

  const handleRefuse = async () => {
    try {
      setActioning(true)
      await AxiosToken.put(`/user/admin/partner/document/refuse/${id}`, { reason })
      toaster.create({ description: "Dossier refusé.", type: "info", closable: true })
      setTimeout(() => navigate("/dashboard/document/partner"), 1800)
    } catch {
      setActioning(false)
    }
  }

  const fetchHistory = async () => {
    try {
      setHistoryLoad(true)
      setHistoryOpen(true)
      const res = await AxiosToken.get(`/user/admin/partner/document/history/${id}`)
      setHistory(res.data.history)
    } catch {
      console.error("Failed to load history")
    } finally {
      setHistoryLoad(false)
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // BUILD TIMELINE EVENTS FROM HISTORY
  // ═══════════════════════════════════════════════════════════════
  const buildTimelineEvents = () => {
    if (!history) return []

    const events = []

    // Add submission event (start)
    events.push({
      type: "submitted",
      timestamp: history.createdAt || new Date().toISOString(),
      icon: LuFileText,
      color: "blue",
      title: "Dossier soumis",
      description: "Soumission initiale du dossier",
      data: null,
    })

    // Add all rejection events (in reverse order from API - oldest to newest)
    if (history.RefuseReason && Array.isArray(history.RefuseReason)) {
      const sortedRefusals = [...history.RefuseReason].sort(
        (a, b) => new Date(a.rejected_at) - new Date(b.rejected_at)
      )
      sortedRefusals.forEach((refusal, index) => {
        events.push({
          type: "rejected",
          timestamp: refusal.rejected_at,
          icon: LuX,
          color: "red",
          title: `Refus #${index + 1}`,
          description: refusal.message,
          data: refusal,
          rejectedBy: refusal.responsibleRejected,
        })
      })
    }

    // Add final outcome
    events.push({
      type: history.status === "accepté" ? "accepted" : "rejected_final",
      timestamp: history.finalizedAt || new Date().toISOString(),
      icon: history.status === "accepté" ? LuCheck : LuX,
      color: history.status === "accepté" ? "green" : "red",
      title: history.status === "accepté" ? "Dossier approuvé" : "Dossier refusé définitivement",
      description:
        history.status === "accepté"
          ? "Le compte partenaire a été activé avec succès."
          : `Refusé après ${history.RefuseReason?.length || 0} tentatives`,
      data: null,
      acceptedBy:history.responsibleAccepted,

    })

    return events
  }

  const timelineEvents = buildTimelineEvents()


  if (loading) return <PageSkeleton />

  const status = partnerFiles?.status
  const statusStyle = STATUS_STYLE[status] ?? { colorScheme: "gray", Icon: LuFileText, label: status }
  const StatusIcon = statusStyle.Icon
  const isPending = status === "en attente"

  return (
    <Box maxW="860px" mx="auto">

      {/* Back + header */}
      <Flex
        as="button" type="button"
        align="center" gap={1.5}
        color="gray.400" fontSize="sm" mb={6}
        _hover={{ color: "blue.500" }} transition="color 0.15s"
        onClick={() => navigate(-1)}
      >
        <LuArrowLeft size={14} />
        Retour aux dossiers
      </Flex>

      {/* History Drawer */}
      <Drawer.Root open={historyOpen} onOpenChange={(e) => setHistoryOpen(e.open)} placement="end">
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content maxW="480px">
              {/* Header */}
              <Drawer.Header borderBottom="1px solid" borderColor="gray.100" pb={4}>
                <Flex align="center" gap={2.5}>
                  <Flex
                    w="30px"
                    h="30px"
                    borderRadius="lg"
                    bg="blue.50"
                    color="blue.500"
                    align="center"
                    justify="center"
                    flexShrink={0}
                  >
                    <LuHistory size={14} />
                  </Flex>
                  <Drawer.Title fontSize="md" fontWeight={700} color="gray.900">
                    Historique du dossier
                  </Drawer.Title>
                </Flex>
                <Drawer.CloseTrigger asChild>
                  <CloseButton size="sm" position="absolute" top={4} right={4} />
                </Drawer.CloseTrigger>
              </Drawer.Header>

              {/* Body - Timeline */}
              <Drawer.Body px={5} py={5}>
                {historyLoad ? (
                  <VStack gap={4} align="stretch">
                    <Skeleton h="80px" borderRadius="xl" />
                    <Skeleton h="120px" borderRadius="xl" />
                    <Skeleton h="80px" borderRadius="xl" />
                  </VStack>
                ) : (
                  <Timeline.Root
                    size="md"
                    colorScheme="blue"
                    variant="solid"
                    gap={0}
                    gapX={0}
                    gapY={0}
                  >
                    {timelineEvents.map((event, index) => {
                      const Icon = event.icon
                      const isLast = index === timelineEvents.length - 1

                      // Determine colors
                      let indicatorBg, indicatorColor, contentBg, contentBorder
                      if (event.color === "blue") {
                        indicatorBg = "blue.100"
                        indicatorColor = "blue.600"
                        contentBg = "blue.50"
                        contentBorder = "blue.200"
                      } else if (event.color === "red") {
                        indicatorBg = "red.100"
                        indicatorColor = "red.600"
                        contentBg = "red.50"
                        contentBorder = "red.200"
                      } else if (event.color === "green") {
                        indicatorBg = "green.100"
                        indicatorColor = "green.600"
                        contentBg = "green.50"
                        contentBorder = "green.200"
                      }

                      return (
                        <Timeline.Item key={`${event.type}-${index}`}>
                          <Timeline.Connector>
                            <Timeline.Separator />
                            <Timeline.Indicator
                              bg={indicatorBg}
                              color={indicatorColor}
                              borderWidth={2}
                              borderColor="white"
                              boxShadow="0 0 0 3px"
                              boxShadowColor={indicatorBg}
                            >
                              <Icon size={16} />
                            </Timeline.Indicator>
                          </Timeline.Connector>

                          <Timeline.Content
                            bg={contentBg}
                            borderWidth="1px"
                            borderColor={contentBorder}
                            borderRadius="xl"
                            p={4}
                            mt={-1}
                            mb={isLast ? 0 : 4}
                            boxShadow="0 1px 4px rgba(0,0,0,0.04)"
                          >
                            {/* Title and Date */}
                            <Flex justify="space-between" align="flex-start" gap={2} mb={2}>
                              <Text fontSize="sm" fontWeight={700} color={`${event.color}.700`}>
                                {event.title}
                              </Text>
                              <Text fontSize="xs" color="gray.500" whiteSpace="nowrap">
                                {formatDate(event.timestamp)}
                              </Text>
                            </Flex>

                            {/* Main description */}
                            {event.description && (
                              <Text
                                fontSize="sm"
                                color="gray.700"
                                lineHeight="1.6"
                                whiteSpace="pre-line"
                                mb={event.rejectedBy ? 2 : 0}
                              >
                                {event.description}
                              </Text>
                            )}

                            {/* Rejected by info - only for rejections */}
                            {event.rejectedBy && (
                              <Box
                                bg="white"
                                borderRadius="lg"
                                p={2.5}
                                borderLeft="3px"
                                borderLeftColor={`${event.color}.300`}
                                mt={2}
                              >
                                <Text fontSize="xs" fontWeight={600} color="gray.600" mb={1}>
                                  Par: {event.rejectedBy.name}
                                </Text>
                                <VStack gap={0} align="flex-start">
                                  <Text fontSize="xs" color="gray.500">
                                    {event.rejectedBy.email}
                                  </Text>
                                  <Text fontSize="xs" color="gray.500">
                                    {event.rejectedBy.phone}
                                  </Text>
                                </VStack>
                              </Box>
                            )}

                            {/* Final status badge */}
                            {event.type === "accepted" && (
                              <Box
                              bg="white"
                                borderRadius="lg"
                                p={2.5}
                                borderLeft="3px"
                                borderLeftColor={`${event.color}.300`}
                                mt={2}
                          
                              >

                                <Text fontSize="xs" fontWeight={600} color="gray.600" mb={1}>
                                  Par: {event.acceptedBy.name}
                                </Text>
                                <VStack gap={0} align="flex-start">
                                  <Text fontSize="xs" color="gray.500">
                                    {event.acceptedBy.email}
                                  </Text>
                                  <Text fontSize="xs" color="gray.500">
                                    {event.acceptedBy.phone}
                                  </Text>
                                </VStack>


                              <Badge
                                color="green"
                                variant="subtle"
                                fontSize="xs"
                                mt={2}
                                fontWeight={600}
                              >
                                <LuCheck/> Approuvé
                              </Badge>
                              
                            </Box>
                            )}
                            {event.type === "rejected_final" && (
                              <Badge
                                colorScheme="red"
                                variant="subtle"
                                fontSize="xs"
                                mt={2}
                                fontWeight={600}
                              >
                                ✕ Refusé définitivement
                              </Badge>
                            )}
                          </Timeline.Content>
                        </Timeline.Item>
                      )
                    })}
                  </Timeline.Root>
                )}
              </Drawer.Body>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>

      <Flex justify="space-between" align="flex-start" mb={7} gap={4} flexWrap="wrap">
        <Box>
          <Text fontSize="xs" fontWeight={700} color="blue.500"
            textTransform="uppercase" letterSpacing="widest" mb={1}>
            Vérification partenaire
          </Text>
          <Text fontSize="2xl" fontWeight={900} color="gray.900" letterSpacing="-0.5px">
            Dossier #{partnerFiles?.id?.slice?.(0, 8) ?? partnerFiles?.id}
          </Text>
          <Text fontSize="sm" color="gray.400" mt={0.5}>
            Partenaire : <Text as="span" fontWeight={600} color="gray.600">{partnerFiles?.users?.name}</Text>
          </Text>
        </Box>
        <Flex align="center" gap={3}>
          <Button
            variant="outline" borderRadius="xl" size="sm"
            borderColor="gray.200" color="gray.600"
            fontWeight={600} px={4}
            _hover={{ bg: "gray.50", borderColor: "blue.300", color: "blue.500" }}
            onClick={fetchHistory}
          >
            <Flex align="center" gap={2}>
              <LuHistory size={13} />
              Historique
            </Flex>
          </Button>
          <Badge
            colorScheme={statusStyle.colorScheme}
            borderRadius="full" px={3} py={1.5}
            fontSize="sm" fontWeight={700}
          >
            <Flex align="center" gap={1.5}>
              <StatusIcon size={13} />
              {statusStyle.label}
            </Flex>
          </Badge>
        </Flex>
      </Flex>

      <VStack gap={4} align="stretch">

        {/* Informations générales */}
        <SectionCard title="Informations générales" icon={LuUser} iconColor="blue">
          <InfoRow label="Partenaire" value={partnerFiles?.users?.name} />
          <InfoRow label="Email" value={partnerFiles?.users?.email} />
          <InfoRow label="Numéro CIN" value={partnerFiles?.cin} />
          <InfoRow label="Matricule fiscal" value={partnerFiles?.matricule_fiscale} />
          <InfoRow label="RIP bancaire" value={partnerFiles?.rip} />
          <InfoRow label="Secteur" value={partnerFiles?.sector} />
        </SectionCard>

        {/* Documents */}
        <SectionCard title="Documents soumis" icon={LuFileText} iconColor="purple">
          <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(4, 1fr)" }} gap={4}>
            <ImagePreview src={partnerFiles?.cin_recto} label="CIN Recto" />
            <ImagePreview src={partnerFiles?.cin_verso} label="CIN Verso" />
            <ImagePreview src={partnerFiles?.matricule_fiscale_image} label="Matricule fiscal" />
            <ImagePreview src={partnerFiles?.register_commerce} label="Registre commerce" />
            {partnerFiles?.autorisation_ontt && (
              <ImagePreview src={partnerFiles?.autorisation_ontt} label="Autorisation ONTT" />
            )}
          </Grid>
        </SectionCard>

        {/* Timeline */}
        <SectionCard title="Historique" icon={LuCalendar} iconColor="gray">
          <Grid templateColumns="1fr 1fr" gap={6}>
            <Box>
              <Text fontSize="xs" fontWeight={600} color="gray.400"
                textTransform="uppercase" letterSpacing="wider" mb={1}>
                Date de soumission
              </Text>
              <Text fontSize="sm" fontWeight={600} color="gray.800">
                {partnerFiles?.createdAt ? formatDate(partnerFiles.createdAt) : "—"}
              </Text>
            </Box>
            <Box>
              <Text fontSize="xs" fontWeight={600} color="gray.400"
                textTransform="uppercase" letterSpacing="wider" mb={1}>
                Dernière mise à jour
              </Text>
              <Text fontSize="sm" fontWeight={600} color="gray.800">
                {partnerFiles?.updatedAt ? formatDate(partnerFiles.updatedAt) : "—"}
              </Text>
            </Box>
          </Grid>
        </SectionCard>

        {/* Actions */}
        {isPending && (
          <Box
            bg="white" borderRadius="2xl"
            border="1px solid" borderColor="gray.100"
            boxShadow="0 1px 8px rgba(0,0,0,0.05)"
            px={6} py={5}
          >
            <Text fontSize="sm" fontWeight={700} color="gray.700" mb={4}>
              Décision
            </Text>
            <Flex gap={3} flexWrap="wrap">

              {/* Accept */}
              <Button
                colorScheme="green" borderRadius="xl"
                fontWeight={700} px={6}
                loading={actioning}
                loadingText="Traitement…"
                onClick={handleAccept}
              >
                <Flex align="center" gap={2}>
                  <LuCheck size={14} />
                  Approuver le dossier
                </Flex>
              </Button>

              {/* Refuse — with dialog */}
              <Dialog.Root>
                <Dialog.Trigger asChild>
                  <Button
                    variant="outline" colorScheme="red"
                    borderRadius="xl" fontWeight={700} px={6}
                    borderColor="red.200" color="red.500"
                    _hover={{ bg: "red.50" }}
                    isDisabled={actioning}
                  >
                    <Flex align="center" gap={2}>
                      <LuX size={14} />
                      Refuser le dossier
                    </Flex>
                  </Button>
                </Dialog.Trigger>
                <Portal>
                  <Dialog.Backdrop />
                  <Dialog.Positioner>
                    <Dialog.Content borderRadius="2xl" overflow="hidden">

                      <Box bg="red.50" px={6} py={5}
                        borderBottom="1px solid" borderColor="red.100">
                        <Flex align="center" gap={3}>
                          <Flex w="36px" h="36px" borderRadius="xl"
                            bg="red.100" color="red.500"
                            align="center" justify="center" flexShrink={0}>
                            <LuShieldAlert size={16} />
                          </Flex>
                          <Dialog.Title fontSize="md" fontWeight={700} color="gray.900">
                            Refuser le dossier
                          </Dialog.Title>
                        </Flex>
                      </Box>

                      <Dialog.Body px={6} py={5}>
                        <Text fontSize="sm" color="gray.600" lineHeight="1.7" mb={4}>
                          Le partenaire recevra un email avec la raison du refus. Merci d'être précis pour lui permettre de corriger son dossier.
                        </Text>
                        <Box>
                          <Text fontSize="xs" fontWeight={700} color="gray.600"
                            textTransform="uppercase" letterSpacing="wider" mb={2}>
                            Raison du refus
                          </Text>
                          <Textarea
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            placeholder="Ex: Document CIN illisible, matricule fiscal manquant…"
                            rows={4}
                            border="1.5px solid" borderColor="gray.200"
                            borderRadius="xl" fontSize="sm"
                            _focus={{
                              borderColor: "red.300",
                              boxShadow: "0 0 0 3px rgba(245,101,101,0.12)"
                            }}
                            resize="vertical"
                          />
                        </Box>
                      </Dialog.Body>

                      <Dialog.Footer
                        px={6} py={4}
                        borderTop="1px solid" borderColor="gray.100"
                        gap={3}
                      >
                        <Dialog.ActionTrigger asChild>
                          <Button variant="outline" borderRadius="xl"
                            size="sm" color="gray.500">
                            Annuler
                          </Button>
                        </Dialog.ActionTrigger>
                        <Button
                          colorScheme="red" borderRadius="xl"
                          size="sm" fontWeight={700}
                          isDisabled={!reason.trim()}
                          loading={actioning}
                          loadingText="Refus…"
                          onClick={handleRefuse}
                        >
                          <Flex align="center" gap={1.5}>
                            <LuX size={13} />
                            Confirmer le refus
                          </Flex>
                        </Button>
                      </Dialog.Footer>

                      <Dialog.CloseTrigger asChild>
                        <CloseButton size="sm" position="absolute" top={3} right={3} />
                      </Dialog.CloseTrigger>
                    </Dialog.Content>
                  </Dialog.Positioner>
                </Portal>
              </Dialog.Root>

            </Flex>
          </Box>
        )}

        {/* Already processed banner */}
        {!isPending && (
          <Flex
            align="center" gap={3}
            bg={status === "accepté" ? "green.50" : "red.50"}
            border="1px solid"
            borderColor={status === "accepté" ? "green.200" : "red.200"}
            borderRadius="2xl" px={6} py={4}
          >
            <Box color={status === "accepté" ? "green.500" : "red.500"}>
              <StatusIcon size={18} />
            </Box>
            <Text fontSize="sm" fontWeight={600}
              color={status === "accepté" ? "green.700" : "red.700"}>
              Ce dossier a déjà été {status === "accepté" ? "approuvé" : "refusé"}.
              Aucune action supplémentaire n'est requise.
            </Text>
          </Flex>
        )}

      </VStack>
    </Box>
  )
}

export default PartnerDocumentInfo