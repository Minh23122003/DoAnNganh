import { useState } from "react";
import { Button, Form } from "react-bootstrap";
import cookie from "react-cookies"
import { authAPIs, endpoints } from "../configs/APIs";
import { useNavigate } from "react-router";

const Booking = () => {
    const [tour] = useState(cookie.load("tour"))
    const [type, setType] = useState(tour.prices[0].id)
    const [quantity, setQuantity] = useState("")
    const [user] = useState(cookie.load("user"))
    const nav = useNavigate()
    
    const booking = async () => {
        if (user === null){
            alert("Bạn cần đăng nhập để đặt tour!")
        }
        else{
            if(tour.remain_ticket < quantity)
                alert(`Số vé đặt không vượt quá ${tour.remain_ticket}!`)
            else{
                let token = cookie.load("access-token")
                let res = await authAPIs(token).post(endpoints['addBooking'](tour.id), {
                    'quantity': quantity,
                    'price_id': type
                })

                if(res.data.status === 406)
                    alert(res.data.content)
                else{
                    alert("Đặt vé thành công!")
                    nav("/")
                }
            }
        }
    }

    return (
        <>
        <div className="mt-3">Số vé còn lại: {tour.remain_ticket}</div>
        <div className="mt-3">Chọn loại vé:</div>
        <select className="mt-3 mb-3" onChange={e => setType(e.target.value)}>
            {tour.prices.map(p => <option value={p.id} key={p.id}>{p.type}: {p.price} VNĐ</option>)}
        </select>
        <Form.Control className="mb-3" placeholder="Nhập số lượng vé cần đặt..." value={quantity} onChange={e => setQuantity(e.target.value)} type="number" />
        <Button onClick={booking} className="mb-3">Đặt tour</Button>
        </>
    );
}

export default Booking;