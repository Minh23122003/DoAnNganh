import { useEffect, useState } from "react";
import cookie from "react-cookies"
import APIs, { authAPIs, endpoints } from "../configs/APIs";
import { Button, Table } from "react-bootstrap";
import { Link } from "react-router-dom";

const Cart = () => {
    const [booking, setBooking] = useState([])
    const [quantity, setQuantity] = useState(0)
    const [user] = useState(cookie.load("user"))

    const loadBooking = async () => {
        try{
            let token = cookie.load("access-token")
            let res = await authAPIs(token).get(endpoints['booking'])
            setBooking(res.data)
            setQuantity(res.data.length)
        }catch(ex){
            console.error(ex)
        }
    }

    useEffect(() => {
        loadBooking();
    }, [quantity])

    const deleteBooking = async (id) => {
        if(window.confirm("Bạn muốn hủy đặt vé này?") === true){
            try{
                let token = cookie.load("access-token")
                let res = await authAPIs(token).delete(endpoints['deleteBooking'](id))
                setQuantity(quantity - 1)
            }catch(ex){
                console.error(ex)
            }
        }
    }

    const payAll = async () => {
        if (window.confirm("Bạn chắc chắn thanh toán?") === true){
            try{
                let res = await APIs.post(endpoints['payAll'], {
                    'user_id': user.id,
                    'method_pay': "Momo"
                })

                if(res.status === 200)
                    setQuantity(0)
            }catch(ex){
                console.error(ex)
            }
        }
    }

    const pay = async (id, total) => {
        if (window.confirm("Bạn chắc chắn thanh toán?") === true){
            try{
                let res = await APIs.post(endpoints['pay'], {
                    'id': id,
                    'method_pay': "Momo",
                    'total': total
                })

                if(res.status===200)
                    setQuantity(0)
            }catch(ex){
                console.error(ex)
            }
        }
    }

    return (
        <>
        <h1 className="text-center mt-3">Danh sách các tour du lịch đã đặt</h1>
        <Button className="mt-3 mb-3" onClick={payAll}>Thanh toán tất cả</Button>
        <Table striped bordered hover>
            <thead>
                <tr>
                    <th>Tên tour du lịch</th>
                    <th>Loại vé</th>
                    <th>Giá</th>
                    <th>Số lượng</th>
                    <th>Ngày đặt</th>
                    <th>Tổng tiền</th>
                    <th>Trạng thái</th>
                    <th></th>
                    <th></th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {booking.map(b => <tr key={b.id}>
                    <th>{b.tour_name}</th>
                    <th>{b.price.type}</th>
                    <th>{b.price.price}</th>
                    <th>{b.quantity}</th>
                    <th>{new Date(b.created_date).toLocaleDateString()}</th>
                    <th>{b.quantity * b.price.price}</th>
                    <th>{b.pay===true?"Đã thanh toán":"Chưa thanh toán"}</th>
                    <th>{b.pay===false?<Button onClick={() => deleteBooking(b.id)} variant="danger">Hủy đặt vé</Button>:<></>}</th>
                    <th>{b.pay===false?<Button onClick={() => pay(b.id, b.quantity * b.price.price)}>Thanh toán</Button>:<></>}</th>
                    <th>{new Date(b.tour_start_date)<new Date()?<Button onClick={() => cookie.save("booking", b)} ><Link className="nav-link" to='/rating' >Đánh giá</Link></Button>:<></>}</th>
                </tr>)}
            </tbody>
        </Table>
        </>
    );
}

export default Cart;