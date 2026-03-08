import { useEffect, useState } from "react"
import { Table, Box, Badge, Button, Dialog, Portal, CloseButton } from "@chakra-ui/react"
import { AxiosToken } from "../../Api/Api"
import { useNavigate } from "react-router-dom"

const Users = () => {


const [data,setData] = useState([])

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
{doc?.first_name} {doc?.last_name}
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
    Supprime
    </Button>
     </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Supprimer l'utilisateur {doc.first_name}</Dialog.Title>
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

</Box>
)
}

export default Users