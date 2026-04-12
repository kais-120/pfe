const { body, validationResult } = require("express-validator");
const { Payment, Booking, Users, Notification } = require("../models");
const Activity = require("../models/Activity");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.CreatePayment = async (amount, booking_id, client_id) => {
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
                        unit_amount: amount * 1000
                    },
                    quantity: 1
                }
            ],
            success_url: `http://localhost:5173/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `http://localhost:5173/payment/cancel?session_id={CHECKOUT_SESSION_ID}`,

            metadata: {
                booking_id: booking_id
            }
        });
        await Payment.create({ amount, client_id, booking_id,reference: session.id })

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
    body("reference").notEmpty().withMessage("payment id is required"),
    async (req, res) => {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return res.status(422).send({ message: error.array().map(err => err.message) })
        }
        const { reference } = req.body
        try {
            const payment = await Payment.findOne({where: {reference}})
            const booking = await Booking.findByPk(payment.booking_id);
            const session = await stripe.checkout.sessions.retrieve(payment.reference);
                if (session.payment_status === "paid") {
                    await payment.update({status:"confirmée"})
                    booking.update({status:"confirmée"})
                    await Activity.create({type:"payment",titre:"paiement est confirmée"})
                }else{
                    await payment.update({status:"annulée"})
                    booking.update({status:"annulée"})
                    await Activity.create({type:"payment",titre:"paiement est annulée"})

                }
            return res.send({ message: "payment updated"});

        } catch (err) {
            return res.status(500).send({ message: err })
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
