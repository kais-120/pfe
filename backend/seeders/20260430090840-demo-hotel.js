'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
   const data = [
    {
      name:"Magic Hotel Royal Kenz Thalasso & Spa",
      description:"Le Royal Kenz est un hôtel 4 étoiles situé dans la station balnéaire de Sousse, en Tunisie.Idéalement localisé, l'établissement 4* se trouve à seulement 200 mètres d'une plage de sable blanc, à 3 km du centre de Port El Kantaoui et à 8 km de la médina de Sousse",
      star:4,
      destination:"Sousse",
      address:"Hammam Sousse 4089",
      equipments:["wifi","piscine","gym","restaurant","climatisation","spa","parking"],
      partner_id:14,
      images:
      [
      {
        image_url:"Magic_Hotel_Royal_Kenz_Thalasso_&_Spa.jpg",
        type:"hotel",
      },
      {
        image_url:"Magic_Hotel_Royal_Kenz_Thalasso_&_Spa2.jpg",
        type:"hotel",
      },
      {
        image_url:"Magic_Hotel_Royal_Kenz_Thalasso_&_Spa3.jpg",
        type:"hotel",
      },
    ]
    },
     {
      name:"Hotel Marhaba Royal Salem",
      description:"L'hotel Marhaba Royal Salem est un établissement 4 étoiles situé à Sousse, en Tunisie, offrant un accès direct à une plage de sable blanc.Implanté au cœur d'un magnifique parc de 7 hectares, l'hôtel bénéficie d'une vue imprenable sur la mer. Il se trouve à proximité de la Marina El Kantaoui (à environ 5 km) et à seulement 19 kilomètres de l'aéroport international de Monastir",
      star:4,
      destination:"Sousse",
      address:"Boulevard 14 Janvier 4039 Sousse Tunisie",
      equipments:["wifi","piscine","gym","restaurant","climatisation","spa","parking"],
      partner_id:15,
      images:
      [
      {
        image_url:"marhaba_royal_salem.jpg",
        type:"hotel",
      },
      {
        image_url:"marhaba_royal_salem_2.jpg",
        type:"hotel",
      },
      {
        image_url:"marhaba_royal_salem_3.jpg",
        type:"hotel",
      },
    ]
    },
     {
      name:"Hotel Marhaba Salem Resort",
      description:"Le Marhaba Salem, hôtel 4 étoiles situé à Sousse en Tunisie, est l'adresse idéale pour des vacances inoubliables en bord de mer.",
      star:4,
      destination:"Sousse",
      address:"Boulevard 14 Janvier 4039 Sousse Tunisie",
      equipments:["wifi","piscine","gym","restaurant","climatisation","spa"],
      partner_id:16,
      images:
      [
      {
        image_url:"marhaba_salem_resort_1.jpg",
        type:"hotel",
      },
      {
        image_url:"marhaba_salem_resort_2.jpg",
        type:"hotel",
      },
      {
        image_url:"marhaba_salem_resort_3.jpg",
        type:"hotel",
      },
    ]
    },
     {
      name:"Hotel Nour Palace Resort et Thalasso",
      description:"Nour Palace Mahdia est un hôtel 5 étoiles appartenant à la chaîne El Mouradi Hotels, situé directement en bord de mer, dans la ville de Mahdia, en Tunisie.",
      star:5,
      destination:"Mahdia",
      address:"Zone Touristique",
      equipments:["wifi","piscine","climatisation","parking"],
      partner_id:18,
      images:
      [
      {
        image_url:"Nour_Palace_Resort_et_Thalasso_1.jpg",
        type:"hotel",
      },
      {
        image_url:"Nour_Palace_Resort_et_Thalasso_2.jpg",
        type:"hotel",
      },
      {
        image_url:"Nour_Palace_Resort_et_Thalasso_3.jpg",
        type:"hotel",
      },
    ]
    },
     {
      name:"Hotel Tour Khalef",
      description:"Jaz Tour Khalef est un hôtel 5 étoiles situé à l'entrée de la ville de Sousse en Tunisie, idéal pour les voyageurs d'affaires et les touristes.",
      star:5,
      destination:"Sousse",
      address:"Boulevard du 14 Janvier, Sousse 4051 Tunisie",
      equipments:["wifi","piscine","restaurant","climatisation","spa"],
      partner_id:19,
      images:
      [
      {
        image_url:"Jaz_Tour_Khalef_1.jpg",
        type:"hotel",
      },
      {
        image_url:"Jaz_Tour_Khalef_2.jpg",
        type:"hotel",
      },
      {
        image_url:"Jaz_Tour_Khalef_3.jpg",
        type:"hotel",
      },
    ]
    },
   ]
   for(const d of data){
   const [hotel] = await queryInterface.bulkInsert("hotels",[{
    name:d.name,
    description:d.description,
    star:d.star,
    destination:d.destination,
    address:d.address,
   equipments: JSON.stringify(d.equipments),
    partner_id:d.partner_id,
    createdAt: new Date(),
    updatedAt: new Date()
  }],
{ returning: true }
)
  for(const i of d.images){
    await queryInterface.bulkInsert("image_services",[{
      image_url:i.image_url,
      type:i.type,
      service_id:hotel.id,
      createdAt: new Date(),
      updatedAt: new Date()
    }])
    }
  }
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
