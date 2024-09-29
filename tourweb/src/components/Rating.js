import { useState } from "react";
import { Button, Form } from "react-bootstrap";
import cookie from "react-cookies"
import { useNavigate } from "react-router-dom";
import APIs, { endpoints } from "../configs/APIs";

const Rating = () => {
    const [booking] = useState(cookie.load("booking"))
    const [star, setStar] = useState(1)
    const [content, setContent] = useState("")
    const nav = useNavigate()

    const addRating = async () => {
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

    return (
        <>
        <select className="mt-3 mb-3" value={star} onChange={e => setStar(e.target.value)}>
            <option value="1">1 &#127775;</option>
            <option value="2">2 &#127775;</option>
            <option value="3">3 &#127775;</option>
            <option value="4">4 &#127775;</option>
            <option value="5">5 &#127775;</option>
        </select>

        <div>Nhập nhận xét</div>
        <Form.Control className="mb-3 mt-3" type="text" placeholder="Nhập nhận xét" value={content} onChange={e => setContent(e.target.value)} />
        <Button className="mb-3" onClick={addRating}>Gửi</Button>
        </>
    );
}

export default Rating;