import { Box, Portal } from "@chakra-ui/react"
import { Combobox, useFilter, createListCollection } from "@chakra-ui/react"
import { useEffect, useState, useMemo } from "react"
import { Axios } from "./Api/Api"

function Test({ value, onChange }) {
  const [destination, setDestination] = useState([])



  useEffect(() => {
    const dataDestination = async () => {
      try {
        const res = await Axios.get("/service/get/destination")
        console.log("API Response:", res.data.destinations)
        setDestination(res.data.destinations || [])
      } catch (error) {
        console.error("error", error)
      }
    }
    dataDestination()
  }, [])

  const filteredItems = useMemo(() => {
  if (!value) return destination

  return destination.filter((item) =>
    item.toLowerCase().includes(value.toLowerCase())
  )
}, [destination, value])

  const { contains } = useFilter({ sensitivity: "base" })

  const collection = useMemo(() => {
  return createListCollection({
    items: filteredItems.map((item) => ({
      label: item,
      value: item,
    })),
    itemToString: (item) => item.label,
    itemToValue: (item) => item.value,
  })
}, [filteredItems])

  console.log("Collection items:", collection.items)

  return (
    <Box flex={1} minW="180px">
      <Combobox.Root
        width="full"
        collection={collection}
        inputValue={value}
        onInputValueChange={(e) => onChange(e.inputValue)}
        onValueChange={(e) => onChange(e.value[0]?.value ?? "")}
      >
        <Combobox.Control>
          <Combobox.Input
            placeholder="Où allez-vous ?"
            style={{
              width: "100%",
              border: "none",
              outline: "none",
              fontSize: "15px",
              fontWeight: "600",
              color: "var(--chakra-colors-gray-800)",
              background: "transparent",
              height: "32px",
            }}
          />
          <Combobox.IndicatorGroup
            style={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
            }}
          >
            <Combobox.Trigger />
          </Combobox.IndicatorGroup>
        </Combobox.Control>
        <Portal>
          <Combobox.Positioner>
            <Combobox.Content>
              <Combobox.Empty>Aucune destination trouvée</Combobox.Empty>
              {collection.items.map((item) => (
                <Combobox.Item key={item.value} item={item}>
                  {item.label}
                </Combobox.Item>
              ))}
            </Combobox.Content>
          </Combobox.Positioner>
        </Portal>
      </Combobox.Root>
    </Box>
  )
}

export default Test