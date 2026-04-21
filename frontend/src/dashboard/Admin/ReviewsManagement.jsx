import { useEffect, useState, useCallback } from 'react';
import {
  Table,
  Box,
  Badge,
  Button,
  Input,
  Flex,
  Pagination,
  ButtonGroup,
  IconButton,
  Text,
  Skeleton,
  VStack,
  HStack,
  Drawer,
  Grid,
  Separator,
  RatingGroup,
  Spinner,
} from '@chakra-ui/react';
import { toaster } from '../../components/ui/toaster';
import { FiStar, FiAlertCircle, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { Helmet } from 'react-helmet';
import { AxiosToken } from '../../Api/Api';
import { LuChevronsLeft, LuChevronsRight, LuEye, LuSearch } from 'react-icons/lu';

const PAGE_SIZE = 8;

const RATING_COLOR = {
  1: 'red',
  2: 'orange',
  3: 'yellow',
  4: 'green',
  5: 'blue',
};

const StarRating = ({ rating, size = 2 }) => {
  return (
    <HStack spacing="1px">
      {[...Array(5)].map((_, i) => (
        <Box
          key={i}
          as={FiStar}
          boxSize={size}
          fill={i < rating ? 'currentColor' : 'none'}
          color={i < rating ? '#F6AD55' : '#CBD5E0'}
        />
      ))}
    </HStack>
  );
};

const ReviewsManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [activeTab, setActiveTab] = useState('all');


  // Fetch reviews from API
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await AxiosToken.get('/review/admin/reviews');
        setReviews(response.data.reviews || []);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        toaster.create({
          description: 'Erreur lors du chargement des avis',
          type: 'error',
          closable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const handleAcceptClaim = async (id) => {
    try{
      await AxiosToken.put(`/review/claim/accept/${id}`);
      toaster.create({
        description:'Réclamation approuvée. L\'avis a été masqué.',
        type:"success",
        closable: true,
      });
    }catch{

    }
  }
  const handleRefuseClaim = async (id) => {
    try{
      await AxiosToken.put(`/review/claim/refuse/${id}`);
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId && r.claim
            ? {
                ...r,
                claim: {
                  ...r.claim,
                  status,
                },
              }
            : r
        )
      );
      toaster.create({
        description: 'Réclamation rejetée. L\'avis reste visible.',
        closable: true,
      });
    }catch{
      toaster.create({
        description: 'Error.',
        type:"error",
        closable: true,
      });
    }
  }

  // Transform API data to match component structure
  const transformedReviews = reviews.map((review) => ({
    id: review.id,
    rating: review.rate,
    comment: review.review,
    clientName: review.clientReview?.name || 'Client inconnu',
    hotelName: review.reviewHotel?.name || 'Hôtel inconnu',
    partnerName: review.reviewHotel?.partnerHotel?.name || 'Partenaire inconnu',
    date: review.createdAt,
    claim: review.claim
      ? {
          id: review.claim.id,
          reason: review.claim.reason,
          message: review.claim.message,
          status: review.claim.status?.toLowerCase() === 'en attente' ? 'pending' : review.claim.status?.toLowerCase() || 'pending',
          partnerName: review.reviewHotel?.partnerHotel?.name || 'Partenaire inconnu',
          claimedAt: review.claim.createdAt,
        }
      : null,
  }));

  // Filter by search
  const filtered = transformedReviews.filter((r) =>
    r.clientName?.toLowerCase().includes(search.toLowerCase()) ||
    r.hotelName?.toLowerCase().includes(search.toLowerCase()) ||
    r.comment?.toLowerCase().includes(search.toLowerCase())
  );

  // Apply tab filter
  const tabFiltered = filtered.filter((r) => {
    if (activeTab === 'pending') return r.claim?.status === 'en attente';
    if (activeTab === 'approved') return r.claim?.status === 'approuvée';
    if (activeTab === 'rejected') return r.claim?.status === 'rejetée';
    if (activeTab === 'no-claim') return !r.claim;
    return true; // 'all'
  });

  // Paginate
  const totalPages = Math.ceil(tabFiltered.length / PAGE_SIZE);
  const paginated = tabFiltered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page on search
  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  // Handle tab change
  const handleTabChange = (value) => {
    setActiveTab(value);
    setPage(1);
  };

  // Calculate stats
  const stats = {
    total: transformedReviews.length,
    pending: transformedReviews.filter((r) => r.claim?.status === 'en attente').length,
    approved: transformedReviews.filter((r) => r.claim?.status === 'approuvée').length,
    rejected: transformedReviews.filter((r) => r.claim?.status === 'rejetée').length,
    noClaim: transformedReviews.filter((r) => !r.claim).length,
  };

  // Open detail drawer - FIXED
  const handleViewReview = useCallback((review) => {
    setSelectedReview(review);
    setTimeout(() => setIsDrawerOpen(true), 0);
  }, []);

  // Close drawer - FIXED
  const handleDrawerClose = useCallback(() => {
    setIsDrawerOpen(false);
    setTimeout(() => setSelectedReview(null), 200);
  }, []);

  // Handle claim action
  const handleClaimAction = useCallback(
    (action, reviewId, claimId) => {
      const status = action === 'approve' ? 'approved' : 'rejected';

      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId && r.claim
            ? {
                ...r,
                claim: {
                  ...r.claim,
                  status,
                },
              }
            : r
        )
      );

      if (selectedReview) {
        setSelectedReview((prev) => ({
          ...prev,
          claim: {
            ...prev.claim,
            status,
          },
        }));
      }

      const message =
        action === 'approve'
          ? 'Réclamation approuvée. L\'avis a été masqué.'
          : 'Réclamation rejetée. L\'avis reste visible.';

      toaster.create({
        description: message,
        type: action === 'approve' ? 'success' : 'info',
        closable: true,
      });

      setActionLoading(null);
    },
    [selectedReview]
  );

  const initials = (name) =>
    name?.split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() ?? '?';

  return (
    <>
      <Helmet title="Avis"></Helmet>
      <Box>
        {/* Page title */}
        <Box mb={6}>
          <Text
            fontSize="xs"
            fontWeight={700}
            color="blue.500"
            textTransform="uppercase"
            letterSpacing="widest"
            mb={1}
          >
            Modération
          </Text>
          <Text fontSize="2xl" fontWeight={900} color="gray.900" letterSpacing="-0.5px">
            Gestion des Avis
          </Text>
        </Box>

        {/* Stats Cards */}
        <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4} mb={6}>
          <Box
            bg="white"
            borderRadius="2xl"
            border="1px solid"
            borderColor="gray.100"
            boxShadow="0 1px 8px rgba(0,0,0,0.05)"
            p={4}
          >
            <VStack align="start" spacing={2}>
              <Text fontSize="xs" fontWeight={700} color="gray.600" textTransform="uppercase">
                Total Avis
              </Text>
              <Text fontSize="32px" fontWeight={900} color="gray.900">
                {loading ? <Spinner size="sm" /> : stats.total}
              </Text>
            </VStack>
          </Box>

          <Box
            bg="white"
            borderRadius="2xl"
            border="1px solid"
            borderColor="gray.100"
            boxShadow="0 1px 8px rgba(0,0,0,0.05)"
            p={4}
          >
            <VStack align="start" spacing={2}>
              <Text fontSize="xs" fontWeight={700} color="gray.600" textTransform="uppercase">
                Réclamations En Attente
              </Text>
              <Text fontSize="32px" fontWeight={900} color="red.600">
                {loading ? <Spinner size="sm" /> : stats.pending}
              </Text>
            </VStack>
          </Box>

          <Box
            bg="white"
            borderRadius="2xl"
            border="1px solid"
            borderColor="gray.100"
            boxShadow="0 1px 8px rgba(0,0,0,0.05)"
            p={4}
          >
            <VStack align="start" spacing={2}>
              <Text fontSize="xs" fontWeight={700} color="gray.600" textTransform="uppercase">
                Approuvées
              </Text>
              <Text fontSize="32px" fontWeight={900} color="green.600">
                {loading ? <Spinner size="sm" /> : stats.approved}
              </Text>
            </VStack>
          </Box>

          <Box
            bg="white"
            borderRadius="2xl"
            border="1px solid"
            borderColor="gray.100"
            boxShadow="0 1px 8px rgba(0,0,0,0.05)"
            p={4}
          >
            <VStack align="start" spacing={2}>
              <Text fontSize="xs" fontWeight={700} color="gray.600" textTransform="uppercase">
                Rejetées
              </Text>
              <Text fontSize="32px" fontWeight={900} color="gray.600">
                {loading ? <Spinner size="sm" /> : stats.rejected}
              </Text>
            </VStack>
          </Box>
        </Grid>

        {/* Main card */}
        <Box
          bg="white"
          borderRadius="2xl"
          border="1px solid"
          borderColor="gray.100"
          boxShadow="0 1px 8px rgba(0,0,0,0.05)"
          overflow="hidden"
        >
          {/* Toolbar */}
          <Flex
            px={5}
            py={4}
            borderBottom="1px solid"
            borderColor="gray.100"
            justify="space-between"
            align="center"
            flexWrap="wrap"
            gap={3}
          >
            {/* Search */}
            <Flex
              align="center"
              gap={2}
              border="1.5px solid"
              borderColor="gray.200"
              borderRadius="xl"
              px={3}
              h="40px"
              bg="gray.50"
              maxW="300px"
              w="full"
              transition="all 0.15s"
              _focusWithin={{
                borderColor: 'blue.400',
                bg: 'white',
                boxShadow: '0 0 0 3px rgba(49,130,206,0.12)',
              }}
            >
              <Box color="gray.400" flexShrink={0}>
                <LuSearch size={14} />
              </Box>
              <Input
                border="none"
                bg="transparent"
                px={0}
                h="full"
                fontSize="sm"
                color="gray.800"
                flex={1}
                placeholder="Rechercher un avis…"
                value={search}
                outline="none"
                onChange={handleSearch}
                _focus={{ boxShadow: 'none' }}
                _placeholder={{ color: 'gray.300' }}
              />
            </Flex>

            <Flex align="center" gap={3}>
              {!loading && (
                <Text fontSize="sm" color="gray.400">
                  {tabFiltered.length} avis
                </Text>
              )}
            </Flex>
          </Flex>

          {/* Filter Buttons */}
          <Flex
            bg="gray.50"
            borderBottomWidth="1px"
            borderColor="gray.100"
            gap={0}
            overflowX="auto"
            px={5}
          >
            {[
              { value: 'all', label: `Tous (${stats.total})`, color: 'blue.600' },
              { value: 'pending', label: `En attente (${stats.pending})`, color: 'red.600' },
              { value: 'approved', label: `Approuvées (${stats.approved})`, color: 'green.600' },
              { value: 'rejected', label: `Rejetées (${stats.rejected})`, color: 'gray.600' },
              { value: 'no-claim', label: `Sans réclamation (${stats.noClaim})`, color: 'blue.400' },
            ].map((tab) => (
              <Button
                key={tab.value}
                onClick={() => handleTabChange(tab.value)}
                px={4}
                py={3}
                fontSize="sm"
                fontWeight={600}
                bg="transparent"
                color={activeTab === tab.value ? tab.color : 'gray.600'}
                borderBottomWidth={activeTab === tab.value ? '2px' : '0px'}
                borderBottomColor={activeTab === tab.value ? tab.color : 'transparent'}
                borderRadius="0px"
                _hover={{ bg: 'gray.100' }}
                whiteSpace="nowrap"
                flexShrink={0}
              >
                {tab.label}
              </Button>
            ))}
          </Flex>

          {/* Table */}
          <Box overflowX="auto">
            <Table.Root size="sm">
              <Table.Header>
                <Table.Row bg="gray.50">
                  {['#', 'Client', 'Hôtel', 'Note', 'Réclamation', 'Action'].map((h, i) => (
                    <Table.ColumnHeader
                      key={i}
                      px={5}
                      py={3}
                      fontSize="xs"
                      fontWeight={700}
                      color="gray.500"
                      textTransform="uppercase"
                      letterSpacing="wider"
                      textAlign={h === 'Action' ? 'right' : 'left'}
                    >
                      {h}
                    </Table.ColumnHeader>
                  ))}
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <Table.Row key={i}>
                      {[1, 2, 3, 4, 5, 6, 7].map((j) => (
                        <Table.Cell key={j} px={5} py={3.5}>
                          <Skeleton
                            h="16px"
                            borderRadius="md"
                            w={j === 1 ? '20px' : j === 7 ? '60px' : '120px'}
                          />
                        </Table.Cell>
                      ))}
                    </Table.Row>
                  ))
                ) : paginated.length === 0 ? (
                  <Table.Row>
                    <Table.Cell colSpan={7} px={5} py={16} textAlign="center">
                      <VStack gap={2}>
                        <Text fontWeight={600} color="gray.600">Aucun avis trouvé</Text>
                        <Text fontSize="sm" color="gray.400">
                          {search ? 'Essayez une autre recherche.' : 'Aucun avis à modérer.'}
                        </Text>
                      </VStack>
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  paginated.map((review, index) => {
                    const rowNum = (page - 1) * PAGE_SIZE + index + 1;
                    const ratingColor = RATING_COLOR[review.rating] ?? 'gray';
                    const hasClaim = review.claim?.status === 'en attente';

                    return (
                      <Table.Row
                        key={review.id}
                        borderTop="1px solid"
                        borderColor="gray.50"
                        _hover={{ bg: 'gray.50' }}
                        transition="background 0.1s"
                      >
                        <Table.Cell px={5} py={3.5}>
                          <Text fontSize="xs" color="gray.400" fontWeight={600}>
                            {rowNum}
                          </Text>
                        </Table.Cell>

                        <Table.Cell px={5} py={3.5}>
                          <Flex align="center" gap={2}>
                            <Flex
                              w="28px"
                              h="28px"
                              borderRadius="full"
                              bg="blue.100"
                              color="blue.700"
                              align="center"
                              justify="center"
                              fontSize="9px"
                              fontWeight={700}
                              flexShrink={0}
                            >
                              {initials(review.clientName)}
                            </Flex>
                            <Text fontSize="sm" fontWeight={600} color="gray.800">
                              {review.clientName}
                            </Text>
                          </Flex>
                        </Table.Cell>

                        <Table.Cell px={5} py={3.5}>
                          <Text fontSize="sm" color="gray.600">
                            {review.hotelName}
                          </Text>
                        </Table.Cell>

                        <Table.Cell px={5} py={3.5}>
                          <HStack spacing={2}>
                            <RatingGroup.Root
                              colorPalette="yellow"
                              readOnly
                              count={5}
                              defaultValue={review.rating}
                              size="sm"
                            >
                              <RatingGroup.HiddenInput />
                              <RatingGroup.Control />
                            </RatingGroup.Root>
                            <Badge colorScheme={ratingColor} fontSize="xs" fontWeight={600}>
                              {review.rating}/5
                            </Badge>
                          </HStack>
                        </Table.Cell>

                        <Table.Cell px={5} py={3.5}>
                          {hasClaim ? (
                            <Badge colorScheme="red" fontSize="xs" fontWeight={600}>
                              <HStack spacing={1}>
                                <Box as={FiAlertCircle} boxSize={3} />
                                <span>En attente</span>
                              </HStack>
                            </Badge>
                          ) : review.claim ? (
                            <Badge
                              colorScheme={
                                review.claim.status === 'approuvée' ? 'green' : 'gray'
                              }
                              fontSize="xs"
                              fontWeight={600}
                            >
                              {review.claim.status}
                            </Badge>
                          ) : (
                            <Text fontSize="xs" color="gray.400">
                              Aucune
                            </Text>
                          )}
                        </Table.Cell>

                        <Table.Cell px={5} py={3.5} textAlign="right">
                          <IconButton
                            size="xs"
                            variant="ghost"
                            color="blue.400"
                            borderRadius="lg"
                            _hover={{ bg: 'blue.50', color: 'blue.500' }}
                            aria-label="Voir les détails"
                            onClick={() => handleViewReview(review)}
                          >
                            <LuEye size={13} />
                          </IconButton>
                        </Table.Cell>
                      </Table.Row>
                    );
                  })
                )}
              </Table.Body>
            </Table.Root>
          </Box>

          {/* Pagination */}
          {!loading && tabFiltered.length > PAGE_SIZE && (
            <Flex
              px={5}
              py={4}
              borderTop="1px solid"
              borderColor="gray.100"
              justify="space-between"
              align="center"
            >
              <Text fontSize="xs" color="gray.400">
                Page {page} / {totalPages} · {tabFiltered.length} résultats
              </Text>
              <Pagination.Root
                count={tabFiltered.length}
                pageSize={PAGE_SIZE}
                page={page}
                onPageChange={(e) => setPage(e.page)}
              >
                <ButtonGroup size="sm" variant="ghost" gap={1}>
                  <Pagination.PrevTrigger asChild>
                    <IconButton
                      borderRadius="lg"
                      color="gray.500"
                      _hover={{ bg: 'gray.100' }}
                      isDisabled={page === 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      <LuChevronsLeft />
                    </IconButton>
                  </Pagination.PrevTrigger>

                  <Pagination.Items
                    render={(p) => (
                      <IconButton
                        borderRadius="lg"
                        bg={p.value === page ? 'blue.50' : 'transparent'}
                        color={p.value === page ? 'blue.600' : 'gray.500'}
                        fontWeight={p.value === page ? 700 : 400}
                        border={p.value === page ? '1.5px solid' : 'none'}
                        borderColor="blue.200"
                        onClick={() => setPage(p.value)}
                      >
                        {p.value}
                      </IconButton>
                    )}
                  />

                  <Pagination.NextTrigger asChild>
                    <IconButton
                      borderRadius="lg"
                      color="gray.500"
                      _hover={{ bg: 'gray.100' }}
                      isDisabled={page === totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                      <LuChevronsRight />
                    </IconButton>
                  </Pagination.NextTrigger>
                </ButtonGroup>
              </Pagination.Root>
            </Flex>
          )}
        </Box>

        {isDrawerOpen && selectedReview && (
          <Drawer.Root open={isDrawerOpen} onOpenChange={(details) => {
            if (!details.isOpen) {
              handleDrawerClose();
            }
          }} placement="end">
            <Drawer.Backdrop />
            <Drawer.Positioner>
              <Drawer.Content borderRadius="2xl">
                <Drawer.Header borderBottomWidth="1px" borderColor="gray.200" pb={4}>
                  <Flex justify="space-between" align="center" flex={1}>
                    <Box>
                      <Text fontSize="xs" fontWeight={700} color="blue.500" textTransform="uppercase" mb={1}>
                        Détails de l'avis
                      </Text>
                      <Text fontSize="md" fontWeight={900} color="gray.900">
                        Avis #{selectedReview.id}
                      </Text>
                    </Box>
                    <Drawer.CloseTrigger asChild>
                      <Button size="sm" variant="ghost" onClick={handleDrawerClose}>
                        ✕
                      </Button>
                    </Drawer.CloseTrigger>
                  </Flex>
                </Drawer.Header>

                <Drawer.Body py={6}>
                  <VStack spacing={6} align="stretch">
                    {/* Review Info Section */}
                    <Box>
                      <Text fontSize="xs" fontWeight={700} color="blue.500" textTransform="uppercase" mb={3}>
                        Informations sur l'avis
                      </Text>
                      <Box
                        bg="gray.50"
                        borderRadius="xl"
                        border="1px solid"
                        borderColor="gray.200"
                        p={4}
                      >
                        <VStack spacing={4} align="stretch">
                          {/* Rating */}
                          <Box>
                            <Text fontSize="xs" fontWeight={600} color="gray.600" mb={2} textTransform="uppercase">
                              Note
                            </Text>
                            <RatingGroup.Root
                              colorPalette="yellow"
                              readOnly
                              count={5}
                              defaultValue={selectedReview.rating}
                              size="md"
                            >
                              <RatingGroup.HiddenInput />
                              <RatingGroup.Control />
                            </RatingGroup.Root>
                            {/* <StarRating rating={selectedReview.rating} size={20} /> */}
                          </Box>

                          <Separator />

                          {/* Comment */}
                          <Box>
                            <Text fontSize="xs" fontWeight={600} color="gray.600" mb={2} textTransform="uppercase">
                              Commentaire
                            </Text>
                            <Text fontSize="sm" lineHeight="1.6" color="gray.700">
                              {selectedReview.comment}
                            </Text>
                          </Box>

                          <Separator />

                          {/* Booking Details */}
                          <Box>
                            <Text fontSize="xs" fontWeight={600} color="gray.600" mb={3} textTransform="uppercase">
                              Détails de la réservation
                            </Text>
                            <VStack spacing={2} align="stretch" fontSize="sm">
                              <HStack justify="space-between">
                                <Text color="gray.600">Client</Text>
                                <Text fontWeight={600} color="gray.800">
                                  {selectedReview.clientName}
                                </Text>
                              </HStack>
                              <HStack justify="space-between">
                                <Text color="gray.600">Hôtel</Text>
                                <Text fontWeight={600} color="gray.800">
                                  {selectedReview.hotelName}
                                </Text>
                              </HStack>
                            
                              <HStack justify="space-between">
                                <Text color="gray.600">Date de l'avis</Text>
                                <Text fontWeight={600} color="gray.800">
                                  {new Date(selectedReview.date).toLocaleDateString('fr-FR')}
                                </Text>
                              </HStack>
                            </VStack>
                          </Box>
                        </VStack>
                      </Box>
                    </Box>

                    {/* Claim Section */}
                    {selectedReview.claim ? (
                      <Box>
                        <HStack spacing={2} mb={3}>
                          <Text fontSize="xs" fontWeight={700} color="blue.500" textTransform="uppercase">
                            Réclamation
                          </Text>
                          <Badge
                            colorScheme={
                              selectedReview.claim.status === 'en attente'
                                ? 'red'
                                : selectedReview.claim.status === 'approuvée'
                                  ? 'green'
                                  : 'gray'
                            }
                            fontSize="xs"
                            fontWeight={600}
                            textTransform="capitalize"
                          >
                            {selectedReview.claim.status === 'en attente'
                              ? 'En attente'
                              : selectedReview.claim.status === 'approuvée'
                                ? 'Approuvée'
                                : 'Rejetée'}
                          </Badge>
                        </HStack>

                        <Box
                          bg={
                            selectedReview.claim.status === 'en attente'
                              ? 'red.50'
                              : selectedReview.claim.status === 'approuvée'
                                ? 'green.50'
                                : 'gray.50'
                          }
                          borderRadius="xl"
                          border="1px solid"
                          borderColor={
                            selectedReview.claim.status === 'en attente'
                              ? 'red.200'
                              : selectedReview.claim.status === 'approuvée'
                                ? 'green.200'
                                : 'gray.200'
                          }
                          p={4}
                        >
                          <VStack spacing={4} align="stretch">
                            {/* Claim Reason */}
                            <Box>
                              <Text fontSize="xs" fontWeight={600} color="gray.600" mb={2} textTransform="uppercase">
                                Motif de la réclamation
                              </Text>
                              <Badge colorScheme="blue" fontSize="sm" py={1} px={2}>
                                {selectedReview.claim.reason}
                              </Badge>
                            </Box>

                            <Separator />

                            {/* Partner Message */}
                            <Box>
                              <Text fontSize="xs" fontWeight={600} color="gray.600" mb={2} textTransform="uppercase">
                                Message du partenaire
                              </Text>
                              <Box
                                p={3}
                                bg="white"
                                border="1px solid"
                                borderColor="gray.200"
                                borderRadius="lg"
                              >
                                <Text fontSize="sm" color="gray.700" lineHeight="1.5">
                                  {selectedReview.claim.message}
                                </Text>
                              </Box>
                            </Box>

                            <Separator />

                            {/* Partner Info */}
                            <VStack spacing={2} align="stretch" fontSize="sm">
                              <HStack justify="space-between">
                                <Text color="gray.600">Réclamé par</Text>
                                <Text fontWeight={600} color="gray.800">
                                  {selectedReview.claim.partnerName}
                                </Text>
                              </HStack>
                              <HStack justify="space-between">
                                <Text color="gray.600">Date de réclamation</Text>
                                <Text fontWeight={600} color="gray.800">
                                  {new Date(selectedReview.claim.claimedAt).toLocaleDateString('fr-FR')}
                                </Text>
                              </HStack>
                            </VStack>

                            {/* Action Buttons */}
                            {selectedReview.claim.status === 'en attente' && (
                              <HStack spacing={3} pt={2}>
                                <Button
                                  flex={1}
                                  colorScheme="green"
                                  size="sm"
                                  fontWeight={600}
                                  borderRadius="lg"
                                  isLoading={actionLoading === 'approve'}
                                  onClick={() => handleAcceptClaim(selectedReview.id)}
                                >
                                  <HStack spacing={1.5}>
                                    <Box as={FiCheckCircle} boxSize={4} />
                                    <span>Approuver</span>
                                  </HStack>
                                </Button>
                                <Button
                                  flex={1}
                                  colorScheme="red"
                                  variant="outline"
                                  size="sm"
                                  fontWeight={600}
                                  borderRadius="lg"
                                  isLoading={actionLoading === 'reject'}
                                  onClick={async () => {
                                    setActionLoading('reject');
                                    await new Promise((r) => setTimeout(r, 800));
                                    handleClaimAction('reject', selectedReview.id, selectedReview.claim.id);
                                  }}
                                >
                                  <HStack spacing={1.5}>
                                    <Box as={FiXCircle} boxSize={4} />
                                    <span>Rejeter</span>
                                  </HStack>
                                </Button>
                              </HStack>
                            )}

                            {selectedReview.claim.status === 'approuvée' && (
                              <Box
                                p={3}
                                bg="green.100"
                                borderRadius="lg"
                                border="1px solid"
                                borderColor="green.300"
                              >
                                <HStack spacing={2}>
                                  <Box as={FiCheckCircle} color="green.600" />
                                  <Text fontSize="sm" color="green.700" fontWeight={500}>
                                    Réclamation approuvée. L'avis a été masqué.
                                  </Text>
                                </HStack>
                              </Box>
                            )}

                            {selectedReview.claim.status === 'rejetée' && (
                              <Box
                                p={3}
                                bg="blue.100"
                                borderRadius="lg"
                                border="1px solid"
                                borderColor="blue.300"
                              >
                                <HStack spacing={2}>
                                  <Box as={FiXCircle} color="blue.600" />
                                  <Text fontSize="sm" color="blue.700" fontWeight={500}>
                                    Réclamation rejetée. L'avis reste visible.
                                  </Text>
                                </HStack>
                              </Box>
                            )}
                          </VStack>
                        </Box>
                      </Box>
                    ) : (
                      <Box p={4} bg="blue.50" borderRadius="lg" border="1px dashed" borderColor="blue.300">
                        <HStack spacing={2}>
                          <Box as={FiAlertCircle} color="blue.600" />
                          <Text fontSize="sm" color="blue.700" fontWeight={500}>
                            Aucune réclamation associée à cet avis.
                          </Text>
                        </HStack>
                      </Box>
                    )}
                  </VStack>
                </Drawer.Body>
              </Drawer.Content>
            </Drawer.Positioner>
          </Drawer.Root>
        )}
      </Box>
    </>
  );
};

export default ReviewsManagement;