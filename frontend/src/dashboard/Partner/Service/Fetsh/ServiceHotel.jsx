import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  Image,
  SimpleGrid,
  Badge,
  Stack,
  Flex,
  Button,
  Dialog,
  Carousel,
  IconButton,
  HStack
} from "@chakra-ui/react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import { AxiosToken, imageURL } from "../../../../Api/Api";

// const hotel = {
//   name: "Hotel Paradise",
//   description:
//     "Hôtel 4 étoiles situé au centre-ville avec piscine, wifi gratuit et parking privé. Chambres modernes avec vue sur la mer, restaurant gastronomique, spa, salle de sport et service 24h/24 pour les clients.",
//   images: [
//     "https://images.unsplash.com/photo-1566073771259-6a8506099945",
//     "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa",
//     "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b",
//     "https://images.unsplash.com/photo-1590490360182-c33d57733427"
//   ],
//   equipments: ["Wifi", "Piscine", "Parking", "Restaurant", "Climatisation"],
//   reviews: [
//     {
//       name: "Ahmed",
//       comment: "Très bon hôtel, personnel accueillant.",
//       rating: 5
//     },
//     {
//       name: "Sonia",
//       comment: "Chambres propres et bonne localisation.",
//       rating: 4
//     }
//   ]
// };
const ServiceHotel = ()=> {

  const [hotel,setHotel] = useState(null)

  const [showMore, setShowMore] = useState(false);

  const navigate = useNavigate();

  useEffect(()=>{
    const fetchData = async () => {
      const response = await AxiosToken.get("/service/hotel/get");
      setHotel(response.data.hotel)
    }
    fetchData();
  },[])
  console.log(hotel)

  if (!hotel) {
  return (
    <Container maxW="6xl" py={20} textAlign="center">
      <Heading size="md" mb={4}>
        Aucun hôtel disponible
      </Heading>

      <Text color="gray.500" mb={6}>
        Aucun hôtel n'a encore été ajouté.
      </Text>

      <Button onClick={()=>navigate("add")} colorScheme="blue">
        Ajouter un hôtel
      </Button>
    </Container>
  );
}

  return (
    <Container maxW="6xl" py={10}>

    <Flex justify="space-between" align="center" mb={6}>
      <Heading>{hotel?.name}</Heading>

      <Button colorScheme="blue">
        Edit Hotel
      </Button>
    </Flex>

      <Carousel.Root slideCount={hotel?.images.length}>
        <Carousel.Control justifyContent="center" gap="4" width="full">
        <Carousel.PrevTrigger asChild>
          <IconButton size="xs" variant="outline">
            <LuChevronLeft />
          </IconButton>
        </Carousel.PrevTrigger>

        <Carousel.ItemGroup width="full">
          {hotel?.images.map((item, index) => (
            <Carousel.Item key={index} index={index}>
              <Image
                aspectRatio="16/9"
                src={`${imageURL}/services/${item.image_url}`}
                w="100%"
                h="100%"
                objectFit="cover"
              />
            </Carousel.Item>
          ))}
        </Carousel.ItemGroup>

        <Carousel.NextTrigger asChild>
          <IconButton size="xs" variant="outline">
            <LuChevronRight />
          </IconButton>
        </Carousel.NextTrigger>
      </Carousel.Control>

      <Carousel.IndicatorGroup>
        {hotel.images.map((item, index) => (
          <Carousel.Indicator
            key={index}
            index={index}
            unstyled
            _current={{
              outline: "2px solid currentColor",
              outlineOffset: "2px",
            }}
          >
            <Image
              w="20"
              aspectRatio="16/9"
              src={`${imageURL}/services/${item.image_url}`}
              objectFit="cover"
            />
          </Carousel.Indicator>
        ))}
      </Carousel.IndicatorGroup>

      </Carousel.Root>

      <Heading size="md" mb={3}>
        Description
      </Heading>

      <Text color="gray.600">
        {hotel.description.length <= 120 ? hotel.description 
        :
          showMore
          ? hotel.description
          : hotel.description.slice(0,120) + "..."}
      </Text>
      {
        hotel.description.length > 120 &&
        <Button
        mt={2}
        size="sm"
        variant="link"
        colorScheme="blue"
        onClick={()=>setShowMore(!showMore)}
        >
        {showMore ? "Voir moins" : "Voir plus"}
      </Button>
      }


      <Heading size="md" mt={10} mb={4}>
        Équipements
      </Heading>

      <SimpleGrid columns={[2,3,5]} spacing={4} mb={10}>
        {hotel.equipments.map((item,i)=>(
          <Badge
            key={i}
            p={2}
            textAlign="center"
            borderRadius="md"
            colorScheme="blue"
          >
            {item}
          </Badge>
        ))}
      </SimpleGrid>


      <Heading size="md" mb={4}>
        Chambres
      </Heading>

      <Stack spacing={6}>
  {hotel.rooms && hotel.rooms.length > 0 ? (
    hotel.rooms.map((room, i) => (
      <Box
            key={room.id}
            p={4}
            borderWidth="1px"
            borderRadius="md"
            shadow="sm"
          >
            <Text fontWeight="bold">{room.name}</Text>
            <Text>Capacité: {room.capacity}</Text>
            <Text>prix/jour: {room.price_by_day} TND</Text>
            <Text>Chambre disponible: {room.count}</Text>

            <HStack mt={3} spacing={3}>
              <Button
                bg="blue"
                size="sm"
                onClick={() => onEdit(room)}
              >
                Edit
              </Button>
              <Button
                bg="red"
                size="sm"
                onClick={() => handleDelete(room.id)}
              >
                Delete
              </Button>
            </HStack>
          </Box>
    ))
  ) : (
    <Box>
      <Text>Il n'a pas des chambres</Text>
    </Box>
  )}
  <Button onClick={()=>navigate("hotel/room/add")}>Ajouter Chambre</Button>
</Stack>
      <Heading size="md" mt={4}>
        Avis clients
      </Heading>

      <Stack spacing={6}>
        {hotel.reviews ? hotel?.reviews?.map((review,i)=>(
          <Box
            key={i}
            p={4}
            borderWidth="1px"
            borderRadius="lg"
          >
            <Flex mb={2}>
              <Heading size="sm">
                {review.name}
              </Heading>
            </Flex>

            <Text fontSize="sm" color="gray.600">
              {review.comment}
            </Text>

            <Text mt={2} color="yellow.500">
              {"⭐".repeat(review.rating)}
            </Text>
          </Box>
        ))
        :
        <Box><Text>il n' a pas des avis </Text></Box>
      }
      </Stack>

    </Container>
  );
}

export default ServiceHotel;