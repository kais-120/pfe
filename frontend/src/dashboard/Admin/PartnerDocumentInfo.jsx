import { useEffect, useState } from "react";
import { AxiosToken, imageURL } from "../../Api/Api";
import {
  DialogRoot,
  DialogTrigger,
  DialogContent,
  DialogBody,
  DialogBackdrop,
  DialogCloseTrigger,
  Portal,
  DialogPositioner,
  Button,
  ButtonGroup,
  Dialog,
  CloseButton,
  Textarea,
  Text
} from "@chakra-ui/react";
import { toaster } from "../../components/ui/toaster"

import { useNavigate, useParams } from "react-router-dom";

const PartnerDocumentInfo = () => {

  const [partnerFiles,setPartnerFiles] =useState();
  const [reasons,setReasons] =useState("");
  const [loading,setLoading] =useState(false);

  const navigate = useNavigate()
  const { id } = useParams(); 

  useEffect(()=>{
    const fetchData = async () => {
      try{
        setLoading(true)
        const response = await AxiosToken.get(`/user/admin/partner/document/${id}`);
        setPartnerFiles(response.data.partnerFiles)
        setLoading(false)
      }catch{
        console.log("err")
      }
    }
    fetchData()
  },[id]);
  const handleRefuseStatus = async () => {
    try{
      await AxiosToken.put(`/user/admin/partner/document/refuse/${id}`,{reason:reasons})
      toaster.create({
        description: "Le document a été refusé.",
          type: "info",
          closable: true,
      })
      setTimeout(()=>{
        navigate("/dashboard/document/partner")
      },2000)
      
    }catch{
      console.log("err")
    }
  }
  const handleAcceptStatus = async () => {
    try{
      await AxiosToken.put(`/user/admin/partner/document/accept/${id}`)
      toaster.create({
        description: "Le document a été approuvé avec succès.",
          type: "success",
          closable: true,
      })
      setTimeout(()=>{
        navigate("/dashboard/document/partner")
      },2000)
      
    }catch{
      console.log("err")
    }
  }

  const InfoRow = ({ label, value }) => (
    <div className="flex !py-3 border-b !border-gray-100 last:border-0">
      <span className="!w-1/3 text-sm !font-medium !text-gray-500">{label}</span>
      <span className="!w-2/3 text-sm !text-gray-900">
        {value || <span className="text-gray-400">—</span>}
      </span>
    </div>
  );

  const ImagePreview = ({ src, label }) => {
    const fullImage = `${imageURL}/partner_files/${src}`;

    return (
      <div className="!mt-2">
        <p className="!text-xs !text-gray-500 !mb-1">{label}</p>

 <DialogRoot>
        <DialogTrigger asChild>
          <div className="!w-32 !h-20 !bg-gray-100 rounded border !border-gray-200 overflow-hidden cursor-pointer">
            <img
              src={fullImage}
              alt={label}
              className="!w-full !h-full object-cover"
            />
          </div>
        </DialogTrigger>

        <Portal>
          <DialogBackdrop bg="blackAlpha.700" />

          <DialogPositioner>
            <DialogContent maxW="700px">
              <DialogCloseTrigger />

              <DialogBody p={0} display="flex" justifyContent="center">
                <img
                  src={fullImage}
                  alt={label}
                  style={{
                    maxWidth: "90vw",
                    maxHeight: "80vh",
                    borderRadius: "10px"
                  }}
                />
              </DialogBody>
            </DialogContent>
          </DialogPositioner>
        </Portal>

      </DialogRoot>
      </div>
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
      approved: "bg-green-50 text-green-700 border-green-200",
      rejected: "bg-red-50 text-red-700 border-red-200"
    };
    return colors[status] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  if (loading) return "loading"

  return (
    <div className="!max-w-4xl !mx-auto">
      {/* Header */}
      <div className="!mb-6 flex items-center justify-between">
        <div>
          <h1 className="!text-2xl font-semibold text-gray-900">
            Partner Documents
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Partner ID: {partnerFiles?.partner_id}
          </p>
        </div>
        <span
          className={`!px-3 !py-1 !text-xs font-medium rounded-full border ${getStatusBadge(
            partnerFiles?.status
          )}`}
        >
          {partnerFiles?.status}
        </span>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl border !border-gray-200 overflow-hidden">
        
        {/* Basic Information */}
        <div className="!p-6">
          <h2 className="text-lg font-medium !text-gray-900 mb-4">
            Basic Information
          </h2>
          <div className="!space-y-1">
            <InfoRow label="Document ID" value={partnerFiles?.id} />
            <InfoRow label="CIN Number" value={partnerFiles?.cin} />
            <InfoRow
              label="Tax Registration"
              value={partnerFiles?.matricule_fiscale}
            />
            <InfoRow label="RIP" value={partnerFiles?.rip} />
            <InfoRow label="Sector" value={partnerFiles?.sector} />
          </div>
        </div>

        {/* Documents */}
        <div className="border-t !border-gray-200 !p-6">
          <h2 className="text-lg font-medium !text-gray-900 !mb-4">
            Documents
          </h2>

          <div className="grid !grid-cols-4 !gap-6">
            <ImagePreview
              src={partnerFiles?.cin_recto}
              label="CIN (Recto)"
            />
            <ImagePreview
              src={partnerFiles?.cin_verso}
              label="CIN (Verso)"
            />
            <ImagePreview
              src={partnerFiles?.matricule_fiscale_image}
              label="Matricule fiscale"
            />
            <ImagePreview
              src={partnerFiles?.register_commerce}
              label="Register commerce"
            />
          </div>
        </div>

        {/* Timeline */}
        <div className="border-t !border-gray-200 !bg-gray-50/50 !p-6">
          <div className="flex items-center !space-x-8 !text-sm">
            <div>
              <span className="!text-gray-500">Created</span>
              <p className="font-medium !text-gray-900">
                {formatDate(partnerFiles?.createdAt)}
              </p>
            </div>
            <div>
              <span className="!text-gray-500">Last updated</span>
              <p className="font-medium !text-gray-900">
                {formatDate(partnerFiles?.updatedAt)}
              </p>
            </div>
          </div>
            <ButtonGroup marginTop={5} className="flex justify-end">
              <Button disabled={partnerFiles?.status !== "en attente"} onClick={()=>handleAcceptStatus()} bg={"green.600"}>accpet</Button>
              <Dialog.Root>
                  <Dialog.Trigger asChild>
              <Button disabled={partnerFiles?.status !== "en attente"}  bg={"red.600"}>refuse</Button>
              </Dialog.Trigger>
                    <Portal>
                      <Dialog.Backdrop />
                      <Dialog.Positioner>
                        <Dialog.Content>
                          <Dialog.Header>
                            <Dialog.Title>Refus le demande </Dialog.Title>
                          </Dialog.Header>
                          <Dialog.Body>
                                 <Text marginTop={3}>
                                  Merci d’indiquer la raison du refus ci-dessous.
                                 </Text>
                                 <Textarea value={reasons} onChange={(e)=>setReasons(e.target.value)} marginTop={3} placeholder="Ex: document non valide, informations manquantes..."></Textarea>
                            
                          </Dialog.Body>
                          <Dialog.Footer>
                            <Dialog.ActionTrigger asChild>
                              <Button variant="outline">Annuler</Button>
                            </Dialog.ActionTrigger>
                            <Button onClick={()=>handleRefuseStatus()} colorPalette="red">Refuse</Button>
                          </Dialog.Footer>
                          <Dialog.CloseTrigger asChild>
                            <CloseButton size="sm" />
                          </Dialog.CloseTrigger>
                        </Dialog.Content>
                      </Dialog.Positioner>
                    </Portal>
                  </Dialog.Root>
            </ButtonGroup>
        </div>

      </div>
    </div>
  );
};

export default PartnerDocumentInfo;