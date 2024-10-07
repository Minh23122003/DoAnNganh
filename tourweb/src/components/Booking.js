import { useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";
import cookie from "react-cookies"
import APIs, { authAPIs, endpoints } from "../configs/APIs";
import { useNavigate } from "react-router";

const Booking = () => {
    const [tour, setTour] = useState(null)
    const [type, setType] = useState(null)
    const [quantity, setQuantity] = useState(1)
    const [user] = useState(cookie.load("user"))
    const nav = useNavigate()

    const loadTour = async() => {
        let res = await APIs.get(endpoints['tour'](cookie.load('tourId')))
        setTour(res.data)
        setType(res.data.prices[0].id)
    }

    useEffect(() => {
        loadTour()
    }, [])
    
    const booking = async () => {
        if (user === undefined){
            alert("Bạn cần đăng nhập để đặt tour!")
        }
        else{
            if (quantity === "")
                alert("Bạn chưa nhập số lượng vé cần đặt!")
            else if(tour.remain_ticket < quantity)
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
        {tour===null?<></>:<div>
                <div className="mt-3">Số vé còn lại: {tour.remain_ticket}</div>
                <div className="mt-3">Chọn loại vé:</div>
                <select className="mt-3 mb-3 form-select" onChange={e => setType(e.target.value)}>
                    {tour.prices.map(p => <option value={p.id} key={p.id}>{p.type}: {p.price} VNĐ</option>)}
                </select>
                <Form.Control className="mb-3" placeholder="Nhập số lượng vé cần đặt..." value={quantity} onChange={e => setQuantity(e.target.value)} type="number" />
                <Button onClick={booking} className="mb-3">Đặt tour</Button>
            </div>}
        </>
    );
}

export default Booking;