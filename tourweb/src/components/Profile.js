import { useEffect } from "react";
import { Button, Image } from "react-bootstrap";
import cookie from "react-cookies";
import { Link } from "react-router-dom";

const Profile = () => {
    const user = cookie.load("user")

    useEffect(() => {

    }, [user])

    return (
        <>
        <h1>Họ tên: {user.first_name} {user.last_name}</h1>
        <h1>Email: {user.email}</h1>
        <h1>Số điện thoại: {user.phone}</h1>
        <Image src={user.avatar} width="500" />
        <div className="m-3"><Button><Link className="nav-link" to="/changeProfile" >Thay đổi thông tin tài khoản</Link></Button></div>
        </>
    )
}

export default Profile;