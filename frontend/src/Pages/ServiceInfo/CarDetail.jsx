import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Flex,
  Grid,
  Text,
  Button,
  Badge,
  Image,
  Skeleton,
  HStack,
  VStack,
  Separator,
  DatePicker,
  parseDate,
  Portal,
} from "@chakra-ui/react";
import {
  FaArrowLeft,
  FaChevronLeft,
  FaChevronRight,
  FaUsers,
  FaGasPump,
  FaCalendarAlt,
  FaStar,
  FaSnowflake,
  FaRoute,
  FaBluetooth,
  FaWifi,
  FaCheck,
} from "react-icons/fa";
import Header from "../../components/home/Header";
import { Axios, AxiosToken, imageURL } from "../../Api/Api";
import { Helmet } from "react-helmet";
import LoadingScreen from "../../components/LoadingScreen";
import { LuCalendar, LuClock, LuBaggageClaim, LuShieldCheck } from "react-icons/lu";
import Cookies from "universal-cookie";
import { useProfile } from "../../Context/useProfile";
import { Tooltip } from "../../components/ui/tooltip";

const CATEGORY_LABELS = {
  economy: "Économique",
  sedan: "Berline",
  suv: "SUV",
  luxury: "Luxe",
  electric: "Électrique",
  utility: "Utilitaire",
};

const FUEL_LABELS = {
  petrol: "Essence",
  diesel: "Diesel",
  electric: "Électrique",
  hybrid: "Hybride",
};

const FEATURE_META = {
  AC: { Icon: FaSnowflake, label: "Climatisation" },
  GPS: { Icon: FaRoute, label: "GPS" },
  Bluetooth: { Icon: FaBluetooth, label: "Bluetooth" },
  WiFi: { Icon: FaWifi, label: "Wi-Fi" },
};

/* ── Image gallery ──────────────────────────────────────────────── */
function CarImageGallery({ images }) {
  const [active, setActive] = useState(0);

  if (!images?.length) return (
    <Box
      height="420px"
      borderRadius="2xl"
      overflow="hidden"
      bg="gray.100"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Text color="gray.400">Aucune image disponible</Text>
    </Box>
  );

  const prev = () => setActive((i) => (i - 1 + images.length) % images.length);
  const next = () => setActive((i) => (i + 1) % images.length);

  return (
    <Box>
      <Box position="relative" height="420px" borderRadius="2xl"
        overflow="hidden" mb={4}>
        <Image
          src={`${imageURL}/services/${images[active].image_url}`}
          alt="Car"
          w="100%" h="100%" objectFit="cover"
        />
        <Badge
          position="absolute" bottom={4} right={4}
          bg="blackAlpha.700" color="white"
          borderRadius="full" px={3} py={1} fontSize="xs">
          {active + 1} / {images.length}
        </Badge>
        {images.length > 1 && (
          <>
            <Button
              position="absolute" left={4} top="50%"
              transform="translateY(-50%)"
              borderRadius="full" bg="white" color="gray.700"
              w="42px" h="42px" p={0}
              boxShadow="md" onClick={prev}>
              <FaChevronLeft />
            </Button>
            <Button
              position="absolute" right={4} top="50%"
              transform="translateY(-50%)"
              borderRadius="full" bg="white" color="gray.700"
              w="42px" h="42px" p={0}
              boxShadow="md" onClick={next}>
              <FaChevronRight />
            </Button>
          </>
        )}
      </Box>

      {/* Thumbnails */}
      <Flex gap={3} overflowX="auto" pb={2}>
        {images.map((img, i) => (
          <Box
            key={img.id} flexShrink={0}
            w="90px" h="60px" borderRadius="lg" overflow="hidden"
            cursor="pointer" border="3px solid"
            borderColor={i === active ? "blue.500" : "transparent"}
            onClick={() => setActive(i)}>
            <Image
              src={`${imageURL}/services/${img.image_url}`}
              w="100%" h="100%" objectFit="cover" />
          </Box>
        ))}
      </Flex>
    </Box>
  );
}

/* ── DateField ──────────────────────────────────────────────────── */
function DateField({ label, value, onChange }) {
  const today = new Date().toISOString().split("T")[0];
  return (
    <Box>
      <Text fontSize="xs" color="gray.500" fontWeight={600} mb={1.5}>{label}</Text>
      <DatePicker.Root
        locale="fr-FR"
        min={parseDate(today)}
        value={value ? [parseDate(value)] : []}
        onValueChange={(details) => {
          const date = details.value?.[0];
          if (date) {
            const jsDate = new Date(date.year, date.month - 1, date.day + 1);
            onChange(jsDate.toISOString().split("T")[0]);
          }
        }}
      >
        <DatePicker.Control
          px={3} h="42px"
          border="1px solid" borderColor="gray.200"
          borderRadius="lg" bg="gray.50"
          _focusWithin={{
            borderColor: "blue.400",
            boxShadow: "0 0 0 2px rgba(49,130,206,0.12)",
          }}
        >
          <DatePicker.Input
            outline="none" border="none"
            bg="transparent" fontSize="sm" color="gray.700"
          />
          <DatePicker.IndicatorGroup>
            <DatePicker.Trigger>
              <LuCalendar size={14} />
            </DatePicker.Trigger>
          </DatePicker.IndicatorGroup>
        </DatePicker.Control>
        <Portal>
          <DatePicker.Positioner>
            <DatePicker.Content>
              <DatePicker.View view="day">
                <DatePicker.Header />
                <DatePicker.DayTable />
              </DatePicker.View>
              <DatePicker.View view="month">
                <DatePicker.Header />
                <DatePicker.MonthTable />
              </DatePicker.View>
              <DatePicker.View view="year">
                <DatePicker.Header />
                <DatePicker.YearTable />
              </DatePicker.View>
            </DatePicker.Content>
          </DatePicker.Positioner>
        </Portal>
      </DatePicker.Root>
    </Box>
  );
}

/* ── Main ───────────────────────────────────────────────────────── */
export default function CarDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const state = location.state || {};
  const [pickupDate, setPickupDate] = useState(state.pickupDate || "");
  const [returnDate, setReturnDate] = useState(state.returnDate || "");
  const {user} = useProfile();
  useEffect(() => {
    const fetchCar = async () => {
      try {
        setLoading(true);
        const res = await Axios.get(`/service/vehicle/get/${id}`);
        setCar(res.data.vehicle);
      } catch {
        setError("Impossible de charger les détails de la voiture.");
      } finally {
        setLoading(false);
      }
    };
    fetchCar();
  }, [id]);

  const days =
    pickupDate && returnDate
      ? Math.ceil((new Date(returnDate) - new Date(pickupDate)) / (1000 * 3600 * 24))
      : 0;

  const totalPrice = days > 0 ? car?.price_per_day * days : 0;

  const handleBookNow = async () => {
    try {
      const res = await AxiosToken.post(`/booking/location/${id}`, {
        pickup_date: pickupDate,
        return_date: returnDate,
        total_price: totalPrice
      });
      window.location = res.data.url
    } catch {
      console.error("error")
    }
  };

  if (loading) return <LoadingScreen />;
  console.log(error)
  if (error || !car) return (
    <>
      <Header />
      <Flex direction="column" align="center" justify="center" py={32} gap={4}>
        <Text color="gray.500">{error || "Voiture introuvable"}</Text>
        <Button onClick={() => navigate(-1)} colorScheme="blue">Retour</Button>
      </Flex>
    </>
  );

  const features = car.features || [];

  return (
    <>
      <Helmet title={`${car.brand} ${car.model}`} />
      <Header />

      <Box maxW="1100px" mx="auto" px={{ base: 4, md: 6 }} py={8}>

        {/* Back */}
        <Button variant="ghost" size="sm" color="gray.500" mb={6}
          onClick={() => navigate(-1)}>
          <FaArrowLeft style={{ marginRight: "8px" }} />
          Retour aux voitures
        </Button>

        <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={10}>

          {/* ── LEFT COLUMN ── */}
          <Box>

            {/* Gallery */}
            <CarImageGallery images={car.images || []} />

            <Box mt={10}>

              {/* Title block */}
              <Text fontSize="3xl" fontWeight={900} mb={2}>
                {car.brand} {car.model}
              </Text>
              <Text fontSize="lg" color="gray.600" mb={8}>
                {car.year} • {CATEGORY_LABELS[car.category] || car.category}
              </Text>

              <VStack align="stretch" spacing={8}>

                {/* Description */}
                {car.description && (
                  <Box>
                    <Text fontWeight={700} mb={3}>Description</Text>
                    <Text color="gray.600" lineHeight="1.8">
                      {car.description}
                    </Text>
                  </Box>
                )}

                {/* Key specs — HStack grid matching FlightDetail SpecRow style */}
                <Box>
                  <Text fontWeight={700} mb={4}>Informations du véhicule</Text>
                  <Grid templateColumns="repeat(auto-fit, minmax(160px, 1fr))" gap={6}>
                    <HStack gap={4}>
                      <Box color="blue.500" fontSize="22px"><FaUsers /></Box>
                      <Box>
                        <Text fontSize="sm" color="gray.500">Capacité</Text>
                        <Text fontWeight={600}>{car.seats} personnes</Text>
                      </Box>
                    </HStack>

                    <HStack gap={4}>
                      <Box color="blue.500" fontSize="22px"><FaGasPump /></Box>
                      <Box>
                        <Text fontSize="sm" color="gray.500">Carburant</Text>
                        <Text fontWeight={600}>{FUEL_LABELS[car.fuel] || car.fuel}</Text>
                      </Box>
                    </HStack>

                    <HStack gap={4}>
                      <Box color="blue.500" fontSize="22px"><FaCalendarAlt /></Box>
                      <Box>
                        <Text fontSize="sm" color="gray.500">Année</Text>
                        <Text fontWeight={600}>{car.year}</Text>
                      </Box>
                    </HStack>

                    {car.category && (
                      <HStack gap={4}>
                        <Box color="blue.500" fontSize="22px"><FaStar /></Box>
                        <Box>
                          <Text fontSize="sm" color="gray.500">Catégorie</Text>
                          <Text fontWeight={600}>
                            {CATEGORY_LABELS[car.category] || car.category}
                          </Text>
                        </Box>
                      </HStack>
                    )}
                  </Grid>
                </Box>

                {/* Availability bar — mirrors FlightDetail occupancy */}
                {car.available !== undefined && (
                  <Box>
                    <Text fontWeight={700} mb={3}>Disponibilité</Text>
                    <Box bg="gray.50" borderRadius="xl" p={4}
                      border="1px solid" borderColor="gray.100">
                      <Flex justify="space-between" align="center">
                        <Text fontSize="sm" color="gray.600">Statut</Text>
                        <Badge
                          colorScheme={car.available ? "green" : "red"}
                          borderRadius="full" px={3} py={0.5} fontWeight={600}>
                          {car.available ? "Disponible" : "Indisponible"}
                        </Badge>
                      </Flex>
                    </Box>
                  </Box>
                )}

                {/* Features — HStack grid matching FlightDetail services */}
                {features.length > 0 && (
                  <Box>
                    <Text fontWeight={700} mb={4}>Équipements</Text>
                    <Grid templateColumns="repeat(auto-fit, minmax(160px, 1fr))" gap={4}>
                      {features.map((feat) => {
                        const meta = FEATURE_META[feat] || { Icon: FaStar, label: feat };
                        return (
                          <HStack key={feat} gap={3}>
                            <Box color="blue.500" fontSize="18px">
                              <meta.Icon />
                            </Box>
                            <Text fontWeight={500}>{meta.label}</Text>
                          </HStack>
                        );
                      })}
                    </Grid>
                  </Box>
                )}

              </VStack>
            </Box>
          </Box>

          {/* ── RIGHT COLUMN — sticky booking card ── */}
          <Box position="sticky" top="100px" alignSelf="flex-start">
            <Box
              bg="white"
              border="1px solid"
              borderColor="gray.200"
              borderRadius="3xl"
              p={8}
              boxShadow="xl"
              overflow="hidden"
            >
              {/* Price block */}
              <Flex justify="space-between" align="baseline" mb={8}>
                <Box>
                  <Text fontSize="4xl" fontWeight={900} color="blue.600" lineHeight="1">
                    {car.price_per_day}
                  </Text>
                  <Text fontSize="lg" color="blue.600" fontWeight={600}>TND</Text>
                  <Text color="gray.500" mt={1}>par jour</Text>
                </Box>


              </Flex>

              <Separator mb={8} />

              <VStack spacing={5} align="stretch">

                {/* Summary rows — mirrors FlightDetail sidebar rows */}
                <Flex justify="space-between">
                  <Text fontSize="sm" color="gray.500">Marque</Text>
                  <Text fontSize="sm" fontWeight={700} color="gray.800">
                    {car.brand}
                  </Text>
                </Flex>
                <Flex justify="space-between">
                  <Text fontSize="sm" color="gray.500">Modèle</Text>
                  <Text fontSize="sm" fontWeight={700} color="gray.800">
                    {car.model}
                  </Text>
                </Flex>
                <Flex justify="space-between">
                  <Text fontSize="sm" color="gray.500">Carburant</Text>
                  <Text fontSize="sm" fontWeight={700} color="gray.800">
                    {FUEL_LABELS[car.fuel] || car.fuel}
                  </Text>
                </Flex>
                <Flex justify="space-between">
                  <Text fontSize="sm" color="gray.500">Capacité</Text>
                  <Text fontSize="sm" fontWeight={700} color="gray.800">
                    {car.seats} personnes
                  </Text>
                </Flex>

                <Separator />

                {/* Date pickers */}
                <DateField
                  label="Date de prise en charge"
                  value={pickupDate}
                  onChange={setPickupDate}
                />

                <DateField
                  label="Date de retour"
                  value={returnDate}
                  onChange={setReturnDate}
                />

                {/* Duration badge */}
                {days > 0 && (
                  <Flex align="center" gap={2} pt={1}
                    borderTop="1px solid" borderColor="gray.100">
                    <Badge colorScheme="blue" borderRadius="full"
                      px={2.5} py={0.5} fontSize="xs">
                      {days} jour{days > 1 ? "s" : ""}
                    </Badge>
                    <Text fontSize="xs" color="gray.400">
                      du{" "}
                      {new Date(pickupDate).toLocaleDateString("fr-FR", {
                        day: "numeric", month: "long",
                      })}{" "}
                      au{" "}
                      {new Date(returnDate).toLocaleDateString("fr-FR", {
                        day: "numeric", month: "long",
                      })}
                    </Text>
                  </Flex>
                )}

                {/* Warn if no dates */}
                {(!pickupDate || !returnDate) && (
                  <Box bg="orange.50" borderRadius="xl" p={3}
                    border="1px solid" borderColor="orange.200">
                    <Text fontSize="xs" color="orange.600" fontWeight={600} textAlign="center">
                      Veuillez sélectionner vos dates pour continuer
                    </Text>
                  </Box>
                )}

                {/* CTA */}
                <Tooltip content={!user ?
                "Vous devez vous connecter pour réserver"
                : user?.role !== "client"
                ? "Seuls les clients peuvent effectuer une réservation"
                : undefined
              
              }>
                <Button
                  colorScheme="blue"
                  size="lg"
                  height="60px"
                  fontSize="lg"
                  fontWeight={700}
                  borderRadius="2xl"
                  onClick={handleBookNow}
                  disabled={!pickupDate || !returnDate || !user || user?.role !== "client"}
                  mt={2}
                  _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
                  transition="all 0.2s"
                >
                  {days > 0
                    ? `Réserver · ${totalPrice} TND`
                    : "Réserver maintenant"}
                </Button>
                </Tooltip>

                <Text fontSize="xs" color="gray.500" textAlign="center" mt={1}>
                  Annulation gratuite jusqu'à 24h avant la prise en charge
                </Text>

              </VStack>
            </Box>
          </Box>

        </Grid>
      </Box>
    </>
  );
}