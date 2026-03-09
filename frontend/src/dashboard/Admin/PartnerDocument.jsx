import { useEffect, useState } from "react"
import { Table, Box, Badge, Button } from "@chakra-ui/react"
import { AxiosToken } from "../../Api/Api"
import { useNavigate } from "react-router-dom"

const PartnerDocument = () => {


const [data,setData] = useState([])

const navigate = useNavigate();

useEffect(()=>{
    const getDocs = async ()=>{
        const res = await AxiosToken.get("/user/admin/partner/documents")
        setData(res.data.partnerFiles)
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
<Table.ColumnHeader>CIN</Table.ColumnHeader>
<Table.ColumnHeader>Partner</Table.ColumnHeader>
<Table.ColumnHeader>Email</Table.ColumnHeader>
<Table.ColumnHeader>Status</Table.ColumnHeader>
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
{doc.cin}
</Table.Cell>

<Table.Cell>
{doc.users?.name}
</Table.Cell>

<Table.Cell>
{doc.users?.email}
</Table.Cell>


<Table.Cell>
<Badge colorPalette={`${doc.status === "en attente" ? "yellow" : doc.status === "accepté" ? "green" : "red"}`}>
{doc.status}
</Badge>
</Table.Cell>

<Table.Cell>
<Button onClick={()=>handleViewDoc(doc.id)} size="xs" colorPalette="blue">
Voir
</Button>
</Table.Cell>


</Table.Row>
))}

</Table.Body>
</Table.Root>

</Box>
)
}

export default PartnerDocument