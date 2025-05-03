import express from "express";
import mongoose from 'mongoose';
import axios from "axios";
import Order from "../models/Order.js";

const router = express.Router();

router.post("/login-via-shiprocket", async (req, res) => {
  try {
    const { email, password } = req.body;

    const response = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/auth/login",
      { email, password }
    );

    return res
      .status(200)
      .json({ success: true, data: response.data, msg: "Login successful" });
  } catch (error) {
    if (error.response) {
      console.log(error.response.data);
      return res.status(error.response.status).json({
        success: false,
        msg: error.response.data.message || "Error during login",
      });
    }
    return res
      .status(500)
      .json({ success: false, msg: error.message || "Internal Server Error" });
  }
});

// router.post('/shiped-order-shiprocket', async (req, res) => {
//     try {
//         // console.log("XXXXXXXXXXXX:-", req.body);

//         const { length, breadth, height, weight } = req.body;
//         const id = req.body?._id;

//         const order = await Order.findById(id).populate('user').populate('orderItems.productId');
//         if (!order) {
//             return res.status(404).json({ success: false, msg: "Order not found" });
//         }

//         if (order.sentToShipRocket) {
//             return res.status(400).json({ success: false, msg: "Order has already been sent to ShipRocket" });
//         }

//         // console.log("My orderItemsArrayss", order);

//         // Map the orderItems to the format expected by ShipRocket
//         const orderItemsArray = order?.orderItems?.map((item, index) => ({
//             name: item?.productId?.productName,
//             sku: `MKV${index + 1}`,
//             units: parseInt(item?.quantity),
//             selling_price: parseFloat(item?.price),
//             discount: 0,
//             tax: 0,
//             hsn: 441122,
//             image: item?.productId?.productImages[0]
//         }));
//         // console.log("My orderItemsArray", orderItemsArray);

//         // Login to ShipRocket API and get the token
//         const loginResponse = await axios.post('https://apiv2.shiprocket.in/v1/external/auth/login', {
//             email: 'aasibkhan155471@gmail.com',
//             password: 'Aasib@2025'
//         });

//         const token = loginResponse?.data?.token;

//         // Prepare the data to be sent to ShipRocket
//         const data = {
//             order_id: order._id,
//             order_date: new Date().toISOString(),
//             billing_customer_name: order?.billingAddress === 'same' ? order?.shippingAddress.fullName : order?.billingAddress.fullName,
//             billing_last_name: order?.billingAddress === 'same' ? order?.shippingAddress.fullName || "" : order?.billingAddress.fullName || "",
//             billing_address: order?.billingAddress === 'same' ? order?.shippingAddress.addressLine1 : order?.billingAddress.addressLine1,
//             billing_address_2: order?.billingAddress === 'same' ? order?.shippingAddress.addressLine2 : order?.billingAddress.addressLine2,
//             billing_city: order?.billingAddress === 'same' ? order?.shippingAddress.city : order?.billingAddress.city,
//             billing_pincode: order?.billingAddress === 'same' ? order?.shippingAddress.pinCode : order?.billingAddress.pinCode,
//             billing_state: order?.billingAddress === 'same' ? order?.shippingAddress.state : order?.billingAddress.state,
//             billing_country: order?.billingAddress === 'same' ? order?.shippingAddress.country : order?.billingAddress.country,
//             billing_email: order?.billingAddress === 'same' ? order?.shippingAddress.email || order?.user.email : order.billingAddress.email || order.user.email,
//             billing_phone: order?.billingAddress === 'same' ? order?.shippingAddress.phone : order?.billingAddress.phone,
//             shipping_is_billing: true,
//             shipping_customer_name: order?.shippingAddress.fullName || "",
//             shipping_last_name: order?.shippingAddress.fullName || "",
//             shipping_address: order?.shippingAddress.addressLine1 || "",
//             shipping_address_2: order?.shippingAddress.addressLine2 || "",
//             shipping_city: order?.shippingAddress.city || "",
//             shipping_pincode: order?.shippingAddress.pinCode || "",
//             shipping_country: order?.shippingAddress.country || "",
//             shipping_state: order?.shippingAddress.state || "",
//             shipping_email: order?.shippingAddress.email || order.user.email,
//             shipping_phone: order?.shippingAddress.phone || "",
//             order_items: orderItemsArray,
//             payment_method: order?.paymentMethod,
//             shipping_charges: order?.shippingAmount,
//             giftwrap_charges: 0,
//             transaction_charges: 0,
//             total_discount: order?.couponDiscount,
//             sub_total: order?.subtotal,
//             length,
//             breadth,
//             height,
//             weight
//         };
//         console.log("Mybbbs", data);
//         const response = await axios.post('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', data, {
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${token}`
//             }
//         });

//         order.sentToShipRocket = true;
//         await order.save();

//         return res.status(200).json({ success: true, msg: "Shipping is Done", data: response.data });

//     } catch (error) {
//         console.error(error);
//         if (error.response) {
//             return res.status(error.response.status).json({
//                 success: false,
//                 msg: error.response.data.message || "Unknown Error"
//             });
//         } else if (error.request) {
//             return res.status(500).json({ success: false, msg: "No response from ShipRocket server" });
//         } else {
//             return res.status(500).json({ success: false, msg: "Internal Server Error" });
//         }
//     }
// });

// router.post('/shiped-order-shiprocket', async (req, res) => {
//     try {
//         const { length, breadth, height, weight, _id: id } = req.body;

//         const order = await Order.findById(id)
//             .populate('user')
//             .populate('orderItems.productId');

//         if (!order) {
//             return res.status(404).json({ success: false, msg: "Order not found" });
//         }

//         if (order.sentToShipRocket) {
//             return res.status(409).json({ success: false, msg: "Order already sent to ShipRocket" });
//         }

//         const loginRes = await axios.post('https://apiv2.shiprocket.in/v1/external/auth/login', {
//             email: 'aasibkhan155471@gmail.com',
//             password: 'Aasib@2025',
//         });
//         console.log("DDDDDDDDDFFFFFFF:-", loginRes.data)
//         const token = loginRes?.data?.token;

//         const isSameAddress = order.billingAddress === 'same';
//         const billing = isSameAddress ? order.shippingAddress : order.billingAddress;
//         const shipping = order.shippingAddress;

//         // ✅ Validate critical fields
//         const requiredFields = [
//             billing?.fullName, billing?.addressLine1, billing?.city, billing?.pinCode, billing?.state,
//             shipping?.fullName, shipping?.addressLine1, shipping?.city, shipping?.pinCode, shipping?.state,
//         ];

//         if (requiredFields.some(field => !field || field.trim() === "")) {
//             return res.status(400).json({ success: false, msg: "Billing/Shipping address fields are incomplete or missing." });
//         }

//         const orderItems = order.orderItems.map((item, index) => ({
//             name: item?.productId?.productName || `Item-${index + 1}`,
//             sku: `MKV${index + 1}`,
//             units: parseInt(item?.quantity),
//             selling_price: parseFloat(item?.price),
//             discount: 0,
//             tax: 0,
//             hsn: 441122,
//             // image: item?.productId?.productImages?.[0] || "",
//         }));

//         const userEmail = order?.user?.email || billing?.email || "default@example.com";

//         const payload = {
//             order_id: order._id,
//             order_date: new Date().toISOString(),
//             pickup_location: "Gwalior",
//             channel_id: "",

//             billing_customer_name: billing?.fullName,
//             billing_last_name: billing?.fullName,
//             billing_address: billing?.addressLine1,
//             billing_address_2: billing?.addressLine2 || "",
//             billing_city: billing?.city,
//             billing_pincode: billing?.pinCode,
//             billing_state: billing?.state,
//             billing_country: billing?.country || "India",
//             billing_email: userEmail,
//             billing_phone: billing?.phone || "0000000000",

//             shipping_is_billing: true,
//             shipping_customer_name: shipping?.fullName,
//             shipping_last_name: shipping?.fullName,
//             shipping_address: shipping?.addressLine1,
//             shipping_address_2: shipping?.addressLine2 || "",
//             shipping_city: shipping?.city,
//             shipping_pincode: shipping?.pinCode,
//             shipping_state: shipping?.state,
//             shipping_country: shipping?.country || "India",
//             shipping_email: userEmail,
//             shipping_phone: shipping?.phone || "0000000000",

//             order_items: orderItems,
//             payment_method: order?.paymentMethod || "Prepaid",
//             shipping_charges: parseFloat(order?.shippingAmount || 0),
//             giftwrap_charges: 0,
//             transaction_charges: 0,
//             total_discount: parseFloat(order?.couponDiscount || 0),
//             sub_total: parseFloat(order?.subtotal || 0),

//             length: parseFloat(length),
//             breadth: parseFloat(breadth),
//             height: parseFloat(height),
//             weight: parseFloat(weight)
//         };

//         console.log("📦 Sending payload to ShipRocket:", JSON.stringify(payload, null, 2));

//         const response = await axios.post(
//             'https://apiv2.shiprocket.in/v1/external/orders/create/adhoc',
//             payload,
//             {
//                 headers: {
//                     Authorization: `Bearer ${token}`
//                 }
//             }
//         );

//         order.sentToShipRocket = true;
//         await order.save();

//         return res.status(200).json({
//             success: true,
//             msg: "Shipping created successfully in ShipRocket",
//             data: response.data
//         });

//     } catch (error) {
//         console.error("❌ ShipRocket API Error:", error?.response?.data || error);

//         if (error.response) {
//             return res.status(error.response.status).json({
//                 success: false,
//                 msg: error.response.data.message || "Unknown ShipRocket Error"
//             });
//         } else if (error.request) {
//             return res.status(500).json({ success: false, msg: "No response from ShipRocket server" });
//         } else {
//             return res.status(500).json({ success: false, msg: "Internal Server Error" });
//         }
//     }
// });

router.post("/shiped-order-shiprocket", async (req, res) => {
  try {
    const { length, breadth, height, weight, id } = req.body;

    // Validate the id as a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, msg: "Invalid order ID" });
    }

    // Fetch order details
    const order = await Order.findById(id)
      .populate("orderItems.productId")
      .populate("user");

    if (!order) {
      return res.status(404).json({ success: false, msg: "Order not found" });
    }

    // Check if the order has already been sent to ShipRocket
    if (order?.sentToShipRocket) {
      return res.status(400).json({
        success: false,
        msg: "Order has already been sent to ShipRocket",
      });
    }

    const orderItemsArray = order.orderItems.map((item, index) => ({
      name: item.productId?.productName,
      sku: `MKV${index + 1}`,
      units: parseInt(item?.quantity),
      selling_price: parseFloat(item?.price),
      discount: 0,
      tax: 0,
      hsn: "441122",
      image: `https://api.manovaidya.com//uploads/products${item.productId?.productImages[0]}`,
    }));

    // Fetch token from ShipRocket
    const loginResponse = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/auth/login",
      {
        email: "aasibkhan155471@gmail.com",
        password: "Aasib@2025",
      }
    );

    const token = loginResponse.data.token;

    // Prepare the data for ShipRocket
    const order_date = new Date().toISOString().split("T")[0];

    const data = {
      order_id: id, // Use the MongoDB ObjectId as the order ID
      order_date: order_date,
      pickup_location: "warehouse",
      comment: "Handle with care. Deliver between 9 AM - 6 PM.",
      reseller_name: "Your Reseller Name",
      company_name: "Your Company Name",
      billing_customer_name: order.shippingAddress.fullName,
      billing_last_name: "",
      billing_address: order.shippingAddress.addressLine1,
      billing_address_2: order.shippingAddress.addressLine2 || "",
      billing_isd_code: "+91",
      billing_city: order.shippingAddress.city || "Gwalior", // Use actual city from the address
      billing_pincode: order.shippingAddress.pinCode || "474001", // Use actual pincode from the address
      billing_state: order.shippingAddress.state || "Madhya Pradesh", // Use actual state
      billing_country: "India",
      billing_email: order.shippingAddress.email,
      billing_phone: order.shippingAddress.phone,
      billing_alternate_phone: "",
      shipping_is_billing: true,
      order_items: orderItemsArray,
      payment_method: order.paymentMethod,
      shipping_charges: parseFloat(order.shippingAmount) || 0,
      giftwrap_charges: 0,
      transaction_charges: 0,
      total_discount: parseFloat(order.couponDiscount) || 0,
      sub_total: parseFloat(order.totalAmount),
      length: Number(length),
      breadth: Number(breadth),
      height: Number(height),
      weight: Number(weight),
      ewaybill_no: "",
      customer_gstin: "",
      invoice_number: "INV" + id,
      order_type: "NON ESSENTIALS",
    };

    // Send data to ShipRocket to create the order
    const response = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Mark the order as sent to ShipRocket
    order.sentToShipRocket = true;
    await order.save();

    return res
      .status(200)
      .json({ success: true, msg: "Shipping is Done", data: response.data });
  } catch (error) {
    console.error("Error occurred during ShipRocket integration:", error);

    // Log the error response from ShipRocket if available
    if (error.response) {
      console.error("Error response from ShipRocket:", error.response.data);
      return res.status(error.response.status).json({
        success: false,
        msg: error.response.data.message || "Unknown Error",
        fullError: error.response.data, // Log full error from ShipRocket for debugging
      });
    } else if (error.request) {
      return res
        .status(500)
        .json({ success: false, msg: "No response from ShipRocket server" });
    } else {
      return res
        .status(500)
        .json({ success: false, msg: "Internal Server Error", fullError: error });
    }
  }
});


export default router;
