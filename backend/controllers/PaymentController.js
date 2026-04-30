const { body, validationResult } = require("express-validator");
const { Payment, Booking, Users, Notification, PaymentInstallments, Package, OfferBookingDetails, CarRentalBookingDetails, HotelBookingDetails, FlightBookingDetails, CircuitBookingDetails, Flight } = require("../models");
const Activity = require("../models/Activity");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.CreatePayment = async (amount, booking_id, client_id,partner_id, installment = 0, type = "total", part = 0) => {
    try {
        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            locale: "fr",

            line_items: [
                {
                    price_data: {
                        currency: "tnd",
                        product_data: {
                            name: `Booking #${booking_id}`
                        },
                        unit_amount: (type === "installment" ? part : amount) * 1000
                    },
                    quantity: 1
                }
            ],
            success_url: `http://localhost:5173/payment/success?booking=${booking_id}&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `http://localhost:5173/payment/cancel?booking=${booking_id}&session_id={CHECKOUT_SESSION_ID}`,

            metadata: {
                booking_id: booking_id
            }
        });
        if (type === "installment") {
            const totalWithFee = amount * 1.05;
            const payment = await Payment.create({ amount: totalWithFee, client_id, booking_id,partner_id })
            await PaymentInstallments.create({
                payment_id: payment.id,
                amount: part,
                installment_number: 1,
                due_date: new Date(Date.now()),
                status: "en attente",
                reference: session.id
            });
            for (let i = 1; i < installment; i++) {
                await PaymentInstallments.create({
                    payment_id: payment.id,
                    amount: part,
                    installment_number: i + 1,
                    due_date: new Date(Date.now() + i * 30 * 24 * 60 * 60 * 1000),
                    status: "en attente"
                });
            }
        } else {
            await Payment.create({ amount, client_id, booking_id, reference: session.id,partner_id })
        }
        return session.url

    } catch (err) {
        console.log(err)
        return "error";
    }
}



// exports.CreatePayment = [
//     body("amount").notEmpty().withMessage("amount is required")
//     .isInt().withMessage("amount should be integer"),
//     body("booking_id").notEmpty().withMessage("booking id is required")
//     .isInt().withMessage("booking id should be integer"),
//     async(req,res)=>{
//         const error = validationResult(req);
//             if(!error.isEmpty()){
//               return res.status(422).send({message:error.array().map(err => err.msg)})
//             }
//     let { amount,booking_id } = req.body
//     amount *= 1000
//     try{
//         const response = await axios.post("https://api.sandbox.konnect.network/api/v2/payments/init-payment",{
//                 receiverWalletId:process.env.KONNECT_WALLET_ID,
//                 amount,
//                 acceptedPaymentMethods: ["bank_card", "e-DINAR","konnect"],
//                 successUrl:"http://localhost:8080/payment/success",
//                 failUrl:"http://localhost:8080/payment/fail",
//             },
//             { 
//                 headers:{
//                     "x-api-key":process.env.KONNECT_API_KEY,
//                 }
//         }
//     )
//     res.send(response.data)

//     }catch(err){
//         console.log(err)
//         return res.status(500).send({message:err})
//     }
// }
// ]
// exports.VerifyPayment = [
//     body("payment_id").notEmpty().withMessage("payment id is required"),
//     async (req, res) => {
//         const error = validationResult(req);
//         if (!error.isEmpty()) {
//             return res.status(422).send({ message: error.array().map(err => err.message) })
//         }
//         const { payment_id } = req.body
//         try {
//             const paymentSchema = await Payment.findOne({ where: { references: payment_id } })
//             const booking = await Booking.findByPk(paymentSchema.booking_id)
//             const response = await axios.get(`https://api.sandbox.konnect.network/api/v2/payments/${payment_id}`)
//             const payment = response.data.payment;
//             if (payment.failedTransactions === 1) {
//                 paymentSchema.status = "refuse"
//                 paymentSchema.save()
//                 return res.status(402).send("payment not valid")
//             }
//             else if (payment.successfulTransactions === 1) {
//                 paymentSchema.status = "accept";
//                 booking.payment_access = "accept";
//                 booking.save();
//                 const booking = Booking.findByPk(payment.booking_id)
//                 const user = Users.findByPk(booking.user_id)
//                 Notification.create({
//                     title: "Nouvelle paiment reçue",
//                     message: `${user.name} a terminé le paiement le ${new Date().toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}`,
//                     to: "admin",
//                     type: "booking"
//                 })
//                 const io = req.app.get("io");
//                 io.to("admin").emit("payment success", { msg: "update" })
//             }
//             paymentSchema.save()

//             res.send({ message: "payment updated", data: payment });

//         } catch (err) {
//             console.log(err)
//             return res.status(500).send({ message: err })
//         }
//     }
// ];

exports.VerifyPayment = [
    body("reference").notEmpty().withMessage("reference is required"),
    body("booking_id").notEmpty().withMessage("booking id is required"),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array().map(err => err.msg) });
        }
        const { reference, booking_id } = req.body
        try {
            const booking = await Booking.findByPk(booking_id);
            if (!booking) {
                return res.status(404).json({ message: "booking not found" })
            }
            if (booking.payment_method === "total") {
                const payment = await Payment.findOne({ where: { reference } });
                const session = await stripe.checkout.sessions.retrieve(reference);
                if (session.payment_status === "paid") {
                    if(payment.status != "confirmée") {
                    await payment.update({ status: "confirmée" })
                    booking.update({ status: "confirmée" })
                    await Activity.create({ type: "payment", titre: "paiement est confirmée" })
                    }
                } else {
                    if(payment.status != "annulée") {
                    await payment.update({ status: "annulée" })
                    booking.update({ status: "annulée" })
                    await Activity.create({ type: "payment", titre: "paiement est annulée" })
                    }
                }
            } else {
                const p = await Payment.findOne({ where: { booking_id } })
                const payment = await PaymentInstallments.findOne({ where: { reference } });
                const session = await stripe.checkout.sessions.retrieve(reference);
                if (session.payment_status === "paid") {
                    await payment.update({ status: "payé" })
                    await Activity.create({ type: "payment", titre: "Paiement de tranche confirmé" })
                    const allInstallments = await PaymentInstallments.findAll({
                        where: { payment_id: p.id }
                    })
                    const allPaid = allInstallments.every(p => p.status === "payé")
                    if (allPaid) {
                        await booking.update({ status: "confirmée" })
                        await p.update({ status: "confirmée" })
                        await Activity.create({
                            type: "payment",
                            titre: "Tous les paiements sont confirmés (réservation validée)"
                        })
                    }
                } else {
                    await payment.update({ status: "échoué" })
                    await Activity.create({ type: "payment", titre: "Paiement de tranche annulé" })
                }
            }

            return res.send({ message: "payment updated" });

        } catch (err) {
            console.log(err)
            return res.status(500).send({ message: "error server" })
        }
    }
];


exports.paymentVerifyAdmin = [
    body("references").notEmpty().withMessage("reference is required"),
    async (req, res) => {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return res.status(422).send({ message: error })
        }
        const { references } = req.body;
        try {
            const payment = await Payment.findOne({
                where: { references },
                include: [{
                    model: Booking,
                    as: "bookingPayment",
                    attributes: ["id", "membership", "date_start", "time_start", "duration", "number_person", "createdAt"],
                    include: {
                        model: Users,
                        as: "users",
                        attributes: ["id", "name", "last_name", "email", "phone"]
                    }
                }]
            });
            if (!payment) {
                return res.status(404).send({ message: "payment not found" })
            }
            if (payment.status !== "accept") {
                return res.status(400).send({ message: "payment is pending" })
            }
            return res.send(payment)
        }
        catch (err) {
            console.log(err)
            return res.status(500).send({ message: "server error" })
        }
    }
]
exports.sendReturnPayment = async (req, res) => {
    const { payment_ref } = req.params
    const payment = await Payment.findOne({ where: { references: payment_ref } });
    const amount = payment.amount;
    const booking_id = payment.booking_id;
    try {
        const response = await axios.post("https://api.sandbox.konnect.network/api/v2/payments/init-payment", {
            receiverWalletId: process.env.KONNECT_WALLET_ID,
            amount,
            acceptedPaymentMethods: ["bank_card", "e-DINAR", "konnect"],
            successUrl: "http://localhost:8080/payment/success",
            failUrl: "http://localhost:8080/payment/fail",
        },
            {
                headers: {
                    "x-api-key": process.env.KONNECT_API_KEY,
                }
            }
        )
        Payment.create({ booking_id, references: response.data.paymentRef, amount })
        res.send(response.data)
    } catch (err) {
        console.log(err)
        return res.status(500).send({ message: "error server" })

    }
}
exports.cashPayment = async (req, res) => {
    const { payment_ref } = req.params;
    try {
        const payment = await Payment.findOne({
            include: {
                model: Booking,
                as: "bookingPayment",
                attributes: ["status"]
            }, where: { references: payment_ref }
        });
        if (!payment) {
            return res.status(404).send({ message: "payment not found" })
        }
        if (payment.bookingPayment.status !== "accept") {
            return res.status(400).send({ message: "you can't accept this payment" })
        }
        payment.update({ status: "accept" });
        await Booking.update({ payment_access: "accept" }, { where: { id: payment.booking_id } })
        return res.status(202).send({ message: "payment accept" })

    } catch {
        return res.status(500).send({ message: "error server" })
    }
}

exports.PaymentInstallments = [
    body("amount").notEmpty().withMessage("amount is required")
        .isInt().withMessage("amount should be integer"),
    async (req, res) => {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return res.status(422).send({ message: error.array().map(err => err.msg) })
        }
        try {
            const { amount } = req.body
            const { id } = req.params;
            const payment = await PaymentInstallments.findByPk(id)
            if (!payment) {
                return res.status(404).send({ message: "payment not found" })
            }
            if (payment.status === "payé") {
                return res.status(400).send({ message: "payment is already payed" })
            }

            const session = await stripe.checkout.sessions.create({
                mode: "payment",
                locale: "fr",

                line_items: [
                    {
                        price_data: {
                            currency: "tnd",
                            product_data: {
                                name: `Booking #${payment.booking_id}`
                            },
                            unit_amount: amount * 1000
                        },
                        quantity: 1
                    }
                ],
                success_url: `http://localhost:5173/payment/success?booking=${payment.booking_id}&session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `http://localhost:5173/payment/cancel?booking=${payment.booking_id}&session_id={CHECKOUT_SESSION_ID}`,

                metadata: {
                    booking_id: payment.booking_id
                }
            });
            payment.update({ reference: session.id })
            return res.send({ message: "payment url", url: session.url })

        } catch (err) {
            return res.status(500).send({ message: "error server" })
        }
    }
]



exports.CancelPayment = async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params
        const booking = await Booking.findByPk(id, {
            include: [
                {
                    model: Payment,
                    as: "payment",
                    include: [
                        {
                            model: PaymentInstallments,
                            as: "paymentInstallments"
                        }
                    ]
                },
                {
                    model: CarRentalBookingDetails,
                    as: "carDetails",
                },
                {
                    model: CircuitBookingDetails,
                    as: "circuitBooking",
                    include: [
                        {
                            model: Package,
                            as: "bookingPackageCircuit",
                        }
                    ]
                },
                {
                    model: FlightBookingDetails,
                    as: "flightBooking",
                    include: [
                        {
                            model: Flight,
                            as: "detailsFlight"
                        }
                    ]
                }, {
                    model: HotelBookingDetails,
                    as: "bookingHotelDetails",
                },
                {
                    model: OfferBookingDetails,
                    as: "offerBooking",
                    include: [
                        {
                            model: Package,
                            as: "bookingPackageOffer",
                        }
                    ]
                }
            ]
        })
        if (!booking) {
            return res.status(404).send({ message: "booking not found" })
        }
        if (booking.client_id !== userId) {
            return res.status(403).send({ message: "you don't have access to cancel this" })
        }
        const now = new Date();
        const limit = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        // return res.send({booking})
        const dates = [];

        if (booking.carDetails?.pickup_date)
        dates.push(new Date(booking.carDetails[0].pickup_date));

        if (booking.circuitBooking[0]?.departureDate)
        dates.push(new Date(booking.circuitBooking[0].departureDate));

        if (booking.flightBooking[0]?.departure)
        dates.push(new Date(booking.flightBooking[0].departure));

        if (booking.bookingHotelDetails[0]?.check_in_date)
        dates.push(new Date(booking.bookingHotelDetails[0].check_in_date));

        if (booking.offerBooking[0]?.departureDate)
        dates.push(new Date(booking.offerBooking[0].departureDate));

        const nearestDate = new Date(Math.min(...dates.map(d => d.getTime())));

        if (nearestDate < limit) {
        return res.status(403).send({
            message: "Cancellation not allowed (less than 24h before booking)"
        });
        }

        
        if (booking.payment_method === "total") {
            console.log(booking.payment[0].reference)
            // const refund = await stripe.refunds.create({
            // payment_intent: booking.payment[0].reference
            // });
            // booking.update({status:"annulée"});
            // booking.payment[0].update({status:"annulée"})

        }
        return res.send({ message: "booking is cancel" })
    } catch (err) {
        console.log(err)
        return res.status(500).send({ message: "error server" })
    }
}
