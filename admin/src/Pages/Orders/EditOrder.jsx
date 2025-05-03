import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getData, postData, serverURL } from '../../services/FetchNodeServices';
import { PDFDownloadLink, Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";


const styles = StyleSheet.create({
    page: { padding: 20, fontSize: 9, },
    section: { marginBottom: 10, },
    shipping: { fontSize: 12, fontWeight: 700, marginBottom: 10, },
    header: { fontSize: 18, textAlign: "center", marginBottom: 20, },
    table: { display: "table", width: "auto", marginVertical: 20, },
    tableRow: { flexDirection: "row", },
    tableCol: { borderStyle: "solid", borderWidth: 1, padding: 5, flex: 1, },
    bold: { fontWeight: "bold", },
    footer: { marginTop: 20, textAlign: "center", },
});


const InvoicePDF = ({ order }) => {
    const [taxDetails, setTaxDetails] = useState([]);
    console.log("order:--", order)
    useEffect(() => {
        const fetchTaxDetails = async () => {
            const details = [];
            for (const item of order?.orderItems || []) {
                try {
                    const product = item.productId;
                    const variant = product.variant?.[0];
                    const tax = Number(variant?.tex || 0);
                    const price = Number(item?.price);
                    details.push({ productName: product.productName, weight: `${item?.day}, ${item?.bottle}`, quantity: item?.quantity, tax, price });
                } catch (error) {
                    console.error("Error fetching product variant:", error);
                    toast.error("Failed to load some product data.");
                }
            }
            setTaxDetails(details);
        };

        fetchTaxDetails();
    }, [order]);

    const shipping = order.shippingAddress;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <Text style={styles.header}>Manovaidya</Text>
                <Text style={styles.shipping}>Shipping Details</Text>
                <Text style={styles.section}>Order ID: {order?._id}</Text>
                <Text style={styles.section}>Order Number: {order?.orderUniqueId}</Text>
                <Text style={styles.section}>Customer Name: {shipping?.fullName}</Text>
                <Text style={styles.section}>
                    Address: {shipping?.addressLine1}, {shipping?.addressLine2}, {shipping?.city},{" "}
                    {shipping?.state}, {shipping?.country} - {shipping?.pinCode}
                </Text>
                <Text style={styles.section}>Phone: {shipping?.phone}</Text>
                <Text style={styles.section}>Order Date: {new Date(order?.createdAt).toLocaleString()}</Text>

                <View style={styles.table}>
                    <View style={[styles.tableRow, { backgroundColor: "#ddd" }]}>
                        <Text style={[styles.tableCol, styles.bold]}>Product Name</Text>
                        <Text style={[styles.tableCol, styles.bold]}>Weight</Text>
                        <Text style={[styles.tableCol, styles.bold]}>Quantity</Text>
                        <Text style={[styles.tableCol, styles.bold]}>Tax (%)</Text>
                        <Text style={[styles.tableCol, styles.bold]}>Price (Excl. Tax)</Text>
                        <Text style={[styles.tableCol, styles.bold]}>Final Price</Text>
                    </View>
                    {taxDetails.map((item, i) => {
                        const priceExclTax = item.price / (1 + item.tax / 100);
                        return (
                            <View key={i} style={styles.tableRow}>
                                <Text style={styles.tableCol}>{item.productName}</Text>
                                <Text style={styles.tableCol}>{item.weight}</Text>
                                <Text style={styles.tableCol}>{item.quantity}</Text>
                                <Text style={styles.tableCol}>{item.tax.toFixed(2)}%</Text>
                                <Text style={styles.tableCol}>₹{priceExclTax.toFixed(2)}</Text>
                                <Text style={styles.tableCol}>₹{item.price.toFixed(2)}</Text>
                            </View>
                        );
                    })}
                </View>

                <Text style={styles.section}>Shipping Cost: ₹{order.shippingAmount || 0}</Text>
                <Text style={styles.section}>Total Amount: ₹{order.totalAmount}</Text>
                <Text style={styles.footer}>Thank you for your order!</Text>
            </Page>
        </Document>
    );
};


const EditOrder = () => {
    const { id } = useParams();
    const [orderData, setOrderData] = useState({});
    const [orderStatus, setOrderStatus] = useState("");
    const [paymentStatus, setPaymentStatus] = useState("");
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    console.log("length, breadth, height, weight, id", orderData.length, orderData.breadth, orderData.height, orderData.weight)
    // Fetch API data
    const getApiData = async () => {
        try {
            const res = await getData(`api/orders/get-order-by-id/${id}`);
            console?.log("DATA", res);
            if (res?.success === true) {
                setOrderData(res?.order);
                setOrderStatus(res?.order?.status);
                setPaymentStatus(res?.order?.isPaid ? "Success" : "Pending");
            }
        } catch (error) {
            console?.error("Error fetching order data:", error);
            toast?.error("Failed to fetch order data.");
        }
    };

    useEffect(() => {
        getApiData();
    }, []);

    const handleChangeStatus = async (e) => {
        try {
            const res = await postData(`api/orders/change-status/${id}`, { orderStatus: e });
            if (res?.success === true) {
                toast?.success("Order updated successfully!");
                getApiData()
            }
        } catch (error) {
            console?.error("Error updating order:", error);
            toast?.error("Failed to update order.");
        }
    };

    const isOrderStatusDisabled = orderStatus === "Delivered" || orderStatus === "Cancelled";
    const isPaymentStatusDisabled = paymentStatus === "Success";
    const handleLogin2 = () => {
        setStep(2)
        setLoading(false);
    }
    const handleLogin = async (e) => {
        setStep(2)
        e.preventDefault();
        setLoading(true);

        const payload = { email, password };

        try {
            const response = await postData('api/shiprocket/login-via-shiprocket', payload);
            console.log(response)
            if (response.success === true) {
                localStorage.setItem('shiprocketToken', response.data.token);
                setToken(response?.data?.token)
                toast.success('Login successful!');
                setStep(3);
            }
        } catch (error) {
            console?.log(error)
            toast.error('Login failed! Check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     try {
    //         let body = { length: orderData?.length, id, breadth: orderData.breadth, height: orderData.height, weight: orderData.weight }

    //         const response = await postData('api/shiprocket/shiped-order-shiprocket', body);

    //         console.log(response)
    //         if (response?.success === true) {
    //             toast.success('Order successfully submitted to ShipRocket and status updated to Shipped!');
    //             setStep(1)
    //         }

    //     } catch (error) {
    //         console.log(error);
    //         toast.error(error?.response?.data?.msg);
    //     }
    // };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // Ensure we have a valid MongoDB ObjectId (24 characters, hex)
        if (!id || id.length !== 24) {
            toast.error("Invalid order ID. Please check the order.");
            return;
        }
    
        // Convert values to numbers and apply fallback defaults
        const length = Number(orderData?.length) || 10;
        const breadth = Number(orderData?.breadth) || 10;
        const height = Number(orderData?.height) || 10;
        const weight = Number(orderData?.weight) || 1;
    
        // Validate numbers are positive
        if ([length, breadth, height, weight].some(v => isNaN(v) || v <= 0)) {
            toast.error("Please enter valid package dimensions (length, breadth, height, weight).");
            return;
        }
    
        const body = { id, length, breadth, height, weight };
    
        try {
            const response = await postData('api/shiprocket/shiped-order-shiprocket', body);
    
            console.log("Shiprocket response:", response);
            if (response?.success === true) {
                toast.success('Order successfully submitted to ShipRocket and status updated to Shipped!');
                setStep(1);
            } else {
                toast.error(response?.msg || 'Failed to submit order to ShipRocket.');
            }
    
        } catch (error) {
            console.error("Shiprocket API error:", error);
            toast.error(error?.response?.data?.msg || 'An unexpected error occurred while submitting the order.');
        }
    };
    

    return (
        <>
            <div className="bread">
                <div className="head">
                    {
                        step === 1 ? <h4>Update Order</h4> :
                            step === 2 ? <h4>Login Ship Rocket</h4> :
                                <h4>Create Order</h4>
                    }
                </div>
                <div className="links">
                    <Link to="/all-orders" className="btn btn-outline-secondary">Back <i className="fa fa-arrow-left"></i></Link>
                </div>
            </div>

            <div className="container mt-5">
                <div className="row">
                    {
                        step === 1 && (
                            <> <div className="col-lg-8">
                                <div className="card shadow-lg">
                                    <div className="card-header bg-primary text-white d-flex justify-content-between">
                                        <h5 className="card-title">Order Details</h5>
                                        <PDFDownloadLink
                                            document={<InvoicePDF order={orderData} />}
                                            fileName={`Invoice_ ${orderData?.orderUniqueId}.pdf`}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {({ loading }) =>
                                                loading ? (
                                                    <button className="btn btn-secondary">Loading...</button>
                                                ) : (
                                                    <button className="btn btn-success">Download Invoice</button>
                                                )
                                            }
                                        </PDFDownloadLink>
                                    </div>
                                    <div className="table-responsive">
                                        <table className="table table-bordered">
                                            <tbody>
                                                <tr>
                                                    <th scope="row">Order ID</th>
                                                    <td>{orderData?._id}</td>
                                                </tr>
                                                <tr>
                                                    <th scope="row">User Name</th>
                                                    <td>{orderData?.user?.name}</td>
                                                </tr>
                                                <tr>
                                                    <th scope="row">Email</th>
                                                    <td>{orderData?.user?.email}</td>
                                                </tr>
                                                <tr>
                                                    <th scope="row">Phone Number</th>
                                                    <td>{orderData?.user?.phone}</td>
                                                </tr>
                                                <tr>
                                                    <th scope="row">Address</th>
                                                    <td>{orderData?.shippingAddress?.addressLine1}, {orderData?.shippingAddress?.addressLine2}, {orderData?.shippingAddress?.city}, {orderData?.shippingAddress?.state}, {orderData?.shippingAddress?.pinCode}</td>
                                                </tr>
                                                <tr>
                                                    <th scope="row">Order Date</th>
                                                    <td>{new Date(orderData?.createdAt).toLocaleString()}</td>
                                                </tr>
                                                <tr>
                                                    <th scope="row">Final Price</th>
                                                    <td>₹{orderData?.totalAmount}</td>
                                                </tr>
                                                <tr>
                                                    <th scope="row">Order Status</th>
                                                    <td>
                                                        <select
                                                            className="form-select"
                                                            value={orderStatus}
                                                            onChange={(e) => handleChangeStatus(e.target.value)}
                                                            disabled={isOrderStatusDisabled}
                                                        >
                                                            <option value="orderConfirmed">Order Confirmed</option>
                                                            <option value="processing">Processing</option>
                                                            <option value="shipped">Shipped</option>
                                                            <option value="delivered">Delivered</option>
                                                            <option value="cancelled">Cancelled</option>
                                                        </select>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <th scope="row">Payment Mode</th>
                                                    <td>{orderData?.paymentMethod}</td>
                                                </tr>
                                                <tr>
                                                    <th scope="row">Payment Id</th>
                                                    <td>{orderData?.payment_id}</td>
                                                </tr>
                                                <tr>
                                                    <th scope="row">Payment Status</th>
                                                    <td>
                                                        <select
                                                            className="form-select"
                                                            value={paymentStatus}
                                                            onChange={(e) => setPaymentStatus(e.target.value)}
                                                            disabled={isPaymentStatusDisabled}
                                                        >
                                                            <option value="Pending">Pending</option>
                                                            <option value="Success">Success</option>
                                                        </select>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                                <div className="col-lg-4" style={{ overflowY: 'scroll', height: '550px' }}>
                                    <div className="card shadow-lg">
                                        <div className="card-header bg-info text-white">
                                            <h5 className="card-title">Ordered Items</h5>
                                        </div>
                                        <div className="card-body">
                                            {orderData?.orderItems && orderData?.orderItems?.length > 0 ? (
                                                orderData?.orderItems.map((item, index) => (
                                                    <div key={index} className="mb-3">
                                                        <strong>{item?.productId?.productName}</strong><br />
                                                        <p className="mb-1">Quantity: {item?.quantity}</p>
                                                        <p className="mb-1">Price: ₹{item?.productId?.variant[0]?.finalPrice}</p>
                                                        <p className="mb-1">Delivery Period: {item?.productId?.variant[0]?.day || '20 days'}</p>
                                                        <p className="mb-0">Bottle Quantity: {item?.productId?.variant[0]?.bottle || 1}</p>
                                                        <img
                                                            src={`${serverURL}/uploads/products/${item?.productId?.productImages[0]}`}
                                                            alt={item?.productId?.productName}
                                                            style={{ width: "100px", height: "100px", marginTop: "10px" }}
                                                        />
                                                        <hr />
                                                    </div>
                                                ))
                                            ) : (
                                                <p>No items in the cart.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )
                    }
                </div>
            </div>

            {
                step === 2 || step === 3 ? "" : <div className="">
                    {/* <button className="btn btn-primary" onClick={handleUpdate}>
                        Save Changes
                    </button> */}
                    <button className="btn btn-primary" onClick={handleLogin2}>
                        Ready To Ship
                    </button>
                </div>
            }

            {step === 2 && (
                <div>
                    <form onSubmit={handleLogin}>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input type="email" className="form-control" id="email" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                        <div className="form-group mt-3">
                            <label htmlFor="password">Password</label>
                            <input type="password" className="form-control" id="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </div>
                        <button type="submit" className="btn btn-primary mt-4" disabled={loading}>
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>
                </div>
            )}

            {step === 3 && (
                <div>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="length">Package Length (cm)</label>
                            <input
                                type="number"
                                name="length"
                                className="form-control"
                                value={orderData.length}
                                onChange={(e) => setOrderData(prev => ({ ...prev, length: e.target.value }))}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="breadth">Package Breadth (cm)</label>
                            <input
                                type="number"
                                name="breadth"
                                className="form-control"
                                value={orderData.breadth}
                                onChange={(e) => setOrderData(prev => ({ ...prev, breadth: e.target.value }))}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="height">Package Height (cm)</label>
                            <input
                                type="number"
                                name="height"
                                className="form-control"
                                value={orderData.height}
                                onChange={(e) => setOrderData(prev => ({ ...prev, height: e.target.value }))}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="weight">Package Weight (kg)</label>
                            <input
                                type="number"
                                name="weight"
                                className="form-control"
                                value={orderData.weight}
                                onChange={(e) => setOrderData(prev => ({ ...prev, weight: e.target.value }))}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary mt-4">Submit</button>
                    </form>
                </div>
            )}

            <ToastContainer />
        </>
    );
};

export default EditOrder;
