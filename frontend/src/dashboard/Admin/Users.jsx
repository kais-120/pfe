import { useEffect, useState } from "react"
import { Table, Box, Badge, Button, Dialog, Portal, CloseButton, Input, Flex, Pagination, ButtonGroup, IconButton } from "@chakra-ui/react"
import { AxiosToken } from "../../Api/Api"
import { useNavigate } from "react-router-dom"
import { Plus, Trash2 } from "lucide-react"
import { LuChevronLeft, LuChevronRight } from "react-icons/lu"

const Users = () => {


const [data,setData] = useState([])
const [search,setSearch] = useState("")

const navigate = useNavigate();

useEffect(()=>{
    const getDocs = async ()=>{
        const res = await AxiosToken.get("/user/all")
        setData(res.data.users)
    }

    getDocs()
},[])
const handleViewDoc = (id) =>{
    navigate(id)
}
return (
<Box bg="white" p={5} borderRadius="lg">

{/* Header */}
<Flex justify="space-between" mb={4} gap={4}>

<Input
rounded={"lg"}
placeholder="Rechercher utilisateur..."
maxW="300px"
value={search}
onChange={(e)=>setSearch(e.target.value)}
/>

<Button
rounded={"lg"}
colorPalette="blue"
onClick={()=>navigate("create")}
>
  <Plus size={16} />
Ajouter utilisateur
</Button>

</Flex>

<Table.Root size="sm">
<Table.Header>
<Table.Row>
<Table.ColumnHeader>#</Table.ColumnHeader>
<Table.ColumnHeader>Nom et Prénom</Table.ColumnHeader>
<Table.ColumnHeader>Email</Table.ColumnHeader>
<Table.ColumnHeader>Role</Table.ColumnHeader>
<Table.ColumnHeader>Action</Table.ColumnHeader>
</Table.Row>
</Table.Header>

<Table.Body>

{data.map((doc,index)=>(
<Table.Row key={doc.id}>

<Table.Cell>
{index + 1}
</Table.Cell>

<Table.Cell>
{doc?.name}
</Table.Cell>

<Table.Cell>
{doc?.email}
</Table.Cell>


<Table.Cell>
<Badge colorPalette="yellow">
{doc.role}
</Badge>
</Table.Cell>

<Table.Cell>
  <Dialog.Root>
      <Dialog.Trigger asChild>
    <Button size="xs" colorPalette="red">
    <Trash2 />
    </Button>
     </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Supprimer l'utilisateur {doc.name}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <p>
               Êtes-vous sûr de vouloir supprimer cet utilisateur ? <br/>
                Cette action est irréversible et toutes les données associées seront supprimées définitivement.
              </p>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline">Annuler</Button>
              </Dialog.ActionTrigger>
              <Button colorPalette="red">Supprimer</Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
</Table.Cell>


</Table.Row>
))}

</Table.Body>
</Table.Root>
<Box marginTop={5} width={"full"} className="flex justify-center">
<Pagination.Root count={data.length} pageSize={10} defaultPage={1}>
      <ButtonGroup variant="ghost" size="sm">
        <Pagination.PrevTrigger asChild>
          <IconButton>
            <LuChevronLeft />
          </IconButton>
        </Pagination.PrevTrigger>

        <Pagination.Items
          render={(page) => (
            <IconButton variant={{ base: "ghost", _selected: "outline" }}>
              {page.value}
            </IconButton>
          )}
        />

        <Pagination.NextTrigger asChild>
          <IconButton>
            <LuChevronRight />
          </IconButton>
        </Pagination.NextTrigger>
      </ButtonGroup>
    </Pagination.Root>
    </Box>

</Box>
)
}

export default Users