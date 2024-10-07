import { useState } from "react";
import { Button, Form } from "react-bootstrap";
import cookie from "react-cookies"
import { useNavigate } from "react-router-dom";
import APIs, { endpoints } from "../configs/APIs";
import { Rating } from "react-simple-star-rating";

const RatingTour = () => {
    const [booking] = useState(cookie.load("booking"))
    const [star, setStar] = useState(0)
    const [content, setContent] = useState("")
    const nav = useNavigate()

    const addRating = async () => {
        if (star === 0)
            alert("Vui lòng chọn số sao đánh giá!")
        else if (content === "")
            alert("Bạn chưa nhập nhận xét!")
        else {
            try{
                let res = await APIs.post(endpoints['addRating'](booking.id), {
                    'stars': star,
                    'content': content
                })

                if(res.status === 201){
                    alert("Gửi thành công!")
                    cookie.remove("booking")
                    nav('/cart')
                }
            }catch(ex){
                console.error(ex)
            }
        }
    }

    return (
        <>
        <div className="mb-3">Chọn số sao:</div>
        <Rating className="mb-3" onClick={(number) => setStar(number)} />

        <div>Nhập nhận xét</div>
        <Form.Control className="mb-3 mt-3" type="text" placeholder="Nhập nhận xét" value={content} onChange={e => setContent(e.target.value)} />
        <Button className="mb-3" onClick={addRating}>Gửi</Button>
        </>
    );
}

export default RatingTour;