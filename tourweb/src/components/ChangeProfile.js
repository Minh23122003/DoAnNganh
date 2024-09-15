import { useEffect, useReducer, useRef, useState } from "react";
import { Alert, Button, Form, Image } from "react-bootstrap";
import { useNavigate } from "react-router";
import APIs, { authAPIs, endpoints } from "../configs/APIs";
import cookie from "react-cookies";

const ChangeProfile = () =>{
    const user = cookie.load("user");
    const [err, setErr] = useState("");
    const nav = useNavigate();
    const avatar = useRef(null);
    const [firstName, setFirstName] = useState(user.first_name)
    const [lastName, setLastName] = useState(user.last_name)
    const [email, setEmail] = useState(user.email)
    const [phone, setPhone] = useState(user.phone)

    const changeUser = async (e) => {
        e.preventDefault();

        let form = new FormData();
        form.append('id', user.id)
        form.append('first_name', firstName)
        form.append('last_name', lastName)
        form.append('phone', phone)
        form.append('email', email)
        form.append('avatar', avatar.current.files[0]);
        try {
            let res = await authAPIs().put(endpoints['current-user'], form, {
                headers: {
                    'Content-Type': "multipart/form-data"
                }
            });
            cookie.save("user", res.data);
            nav("/profile");   
        }catch (ex) {
            console.error(ex)
        }
    }

    useEffect(() => {

    }, [user])

    return (
        <>
            <h1 className="text-center text-info mt-1">Thay đổi tài khoản</h1>
            {err && <Alert variant="danger">{err}</Alert>}
            <Form method="post" onSubmit={changeUser}>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput11">
                    <Form.Label>Tên</Form.Label>
                    <Form.Control type="text" placeholder="Tên..." value={firstName} onChange={e => setFirstName(e.target.value)}  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                    <Form.Label>Họ và tên lót</Form.Label>
                    <Form.Control type="text" placeholder="Họ và tên lót..." value={lastName} onChange={e => setLastName(e.target.value)}  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="exampleForm.ControlInput21">
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" placeholder="Email..." value={email} onChange={e => setEmail(e.target.value)}   />
                </Form.Group>
                <Form.Group className="mb-3" controlId="exampleForm.ControlInput22">
                    <Form.Label>Phone</Form.Label>
                    <Form.Control type="text" placeholder="SDT..." value={phone} onChange={e => setPhone(e.target.value)}   />
                </Form.Group>
                <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea7">
                    <Form.Label>Ảnh đại diện</Form.Label>
                    <Form.Control accept=".png,.jpg" type="file" ref={avatar}   />
                </Form.Group>
                <Image src={user.avatar} width="100" className="mb-3" />
                <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea5">
                    <Button type="submit" variant="success">Xác nhận thay đổi</Button>
                </Form.Group>
            </Form>
        </>
    )
}

export default ChangeProfile;