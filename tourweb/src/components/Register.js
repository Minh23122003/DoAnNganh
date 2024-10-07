import { useRef, useState } from "react";
import { Alert, Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router";
import APIs, { endpoints } from "../configs/APIs";

const Register = () => {
    const [user, setUser] = useState({});
    const [err, setErr] = useState();
    const nav = useNavigate();
    const avatar = useRef();

    const register = async (e) => {
        e.preventDefault();

        if (user.first_name === undefined || user.first_name === "")
            alert("Vui lòng nhập tên!")
        else if (user.last_name === undefined || user.last_name === "")
            alert("Vui lòng nhập họ!")
        else if (user.phone === undefined || user.phone === "")
            alert("Vui lòng nhập số điện thoại!")
        else if (user.username === undefined || user.username === "")
            alert("Vui lòng nhập tên đăng nhập!")
        else if (user.password === "" || user.password === undefined)
            alert("Vui lòng nhập mật khẩu")
        else if (user.password !== user.confirm)
            alert("Mật khẩu và xác nhận mật khẩu không trùng khớp. Vui lòng kiểm tra lại!");
        else if (avatar.current.files.length === 0)
            alert("Vui lòng chọn avatar!")
        else {
            let form = new FormData();
            for (let f in user)
                if (f !== 'confirm') {
                    form.append(f, user[f]);
                }

            form.append('avatar', avatar.current.files[0]);

            try {
                let res = await APIs.post(endpoints['register'], form, {
                    headers: {
                        'Content-Type': "multipart/form-data"
                    }
                });

                console.info(res.data);
                if (res.status === 201)
                    nav("/login");
            } catch(ex){
                alert("Tên đăng nhập đã tồn tại. Vui lòng chọn tên đăng nhập khác!")
            }
        }
    }

    const change = (e, field) => {
        setUser({...user, [field]: e.target.value})
    }

    return (
        <>
            <h1 className="text-center text-info mt-1">ĐĂNG KÝ</h1>
            {/* {err && <Alert variant="danger">{err}</Alert>} */}
            <Form method="post" onSubmit={register}>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput11">
                    <Form.Label>Tên</Form.Label>
                    <Form.Control type="text" placeholder="Tên..." value={user["first_name"]} onChange={e => change(e, "first_name")}  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                    <Form.Label>Họ và tên lót</Form.Label>
                    <Form.Control type="text" placeholder="Họ và tên lót..." value={user["last_name"]} onChange={e => change(e, "last_name")}  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="exampleForm.ControlInput21">
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" placeholder="Email..." value={user["email"]} onChange={e => change(e, "email")}   />
                </Form.Group>
                <Form.Group className="mb-3" controlId="exampleForm.ControlInput22">
                    <Form.Label>Phone</Form.Label>
                    <Form.Control type="text" placeholder="SDT..." value={user["phone"]} onChange={e => change(e, "phone")}   />
                </Form.Group>
                <Form.Group className="mb-3" controlId="exampleForm.ControlInput2">
                    <Form.Label>Tên đăng nhập</Form.Label>
                    <Form.Control type="text" placeholder="Tên đăng nhập..." value={user["username"]} onChange={e => change(e, "username")}   />
                </Form.Group>
                <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea3">
                    <Form.Label>Mật khẩu</Form.Label>
                    <Form.Control type="password" placeholder="Mật khẩu..." value={user["password"]} onChange={e => change(e, "password")}  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea4">
                    <Form.Label>Xác nhận mật khẩu</Form.Label>
                    <Form.Control type="password" placeholder="Xác nhận mật khẩu..." value={user["confirm"]} onChange={e => change(e, "confirm")}   />
                </Form.Group>
                <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea7">
                    <Form.Label>Ảnh đại diện</Form.Label>
                    <Form.Control accept=".png,.jpg" type="file" ref={avatar}   />
                </Form.Group>
                <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea5">
                    <Button type="submit" variant="success">Đăng ký</Button>
                </Form.Group>
            </Form>
        </>
    );
}

export default Register;